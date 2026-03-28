import { NextRequest, NextResponse } from 'next/server';
import { getSystemPromptV9 } from '@/lib/services/prompt-engine';
import { classifySearchTarget, determineEntropy } from '@/lib/services/classifier';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { AIAnalysisResult, AIPremiumResult } from '@/lib/ai-service';
import type { SearchSession } from '@/lib/types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEDUPE_WINDOW_MS = 10 * 60 * 1000;

function buildFreeResult(result: Record<string, unknown>): AIAnalysisResult {
  const rawChecklist = Array.isArray(result.checklist) ? (result.checklist as string[]) : [];

  return {
    probability: Number(result.probability) || 70,
    probabilityLevel: String(result.probabilityLevel || 'Medium'),
    summary: String(result.summary || ''),
    priorityAction: {
      target: String((result.priorityAction as Record<string, unknown> | undefined)?.target || ''),
      action: String((result.priorityAction as Record<string, unknown> | undefined)?.action || ''),
      why: String((result.priorityAction as Record<string, unknown> | undefined)?.why || ''),
    },
    behaviorAnalysis: String(result.behaviorAnalysis || ''),
    environmentAnalysis: String(result.environmentAnalysis || ''),
    basicSearchPoints: Array.isArray(result.basicSearchPoints) ? (result.basicSearchPoints as string[]) : [],
    checklist: rawChecklist.slice(0, 1),
    cognitiveOverride: String(result.cognitiveOverride || ''),
    encouragement: String(result.encouragement || ''),
    safetyAlert: result.safetyAlert ? String(result.safetyAlert) : null,
  };
}

function buildPremiumResult(result: Record<string, unknown>): AIPremiumResult {
  return {
    predictions: Array.isArray(result.predictions)
      ? (result.predictions as AIPremiumResult['predictions'])
      : [],
    checklist: Array.isArray(result.checklist) ? (result.checklist as string[]) : [],
    timelineAnalysis: String(result.timelineAnalysis || ''),
    stopCondition: String(result.stopCondition || ''),
  };
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API Key 未配置' }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      itemType,
      itemName,
      itemDescription,
      itemColor,
      itemSize,
      lastSeenLocation,
      lastSeenTime,
      lossLocationCategory,
      lossLocationSubCategory,
      activity,
      mood,
      userMood,
      userActivity,
      searchedPlaces,
      locale = 'zh-CN',
      session,
    } = body as {
      itemType?: string;
      itemName?: string;
      itemDescription?: string;
      itemColor?: string;
      itemSize?: string;
      lastSeenLocation?: string;
      lastSeenTime?: string;
      lossLocationCategory?: string;
      lossLocationSubCategory?: string;
      activity?: string;
      mood?: string;
      userMood?: string;
      userActivity?: string;
      searchedPlaces?: string;
      locale?: string;
      session?: SearchSession;
    };

    const fullSession = session || null;
    const fingerprintBase = fullSession
      ? fullSession
      : {
          itemType,
          itemName,
          itemDescription,
          itemColor,
          itemSize,
          lastSeenLocation,
          lastSeenTime,
          lossLocationCategory,
          lossLocationSubCategory,
          activity,
          mood,
          userMood,
          userActivity,
          searchedPlaces,
        };

    const sessionFingerprint = JSON.stringify({ locale, ...fingerprintBase });

    const dedupeCutoff = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString();
    const { data: recentReports } = await supabaseAdmin
      .from('analysis_reports')
      .select('id, free_result, created_at, session_data')
      .eq('user_id', user.id)
      .eq('locale', locale)
      .gte('created_at', dedupeCutoff)
      .order('created_at', { ascending: false })
      .limit(20);

    const matchedReport = (recentReports || []).find((report) => {
      const reportSessionData = report.session_data && typeof report.session_data === 'object'
        ? (report.session_data as Record<string, unknown>)
        : {};
      return reportSessionData.analysisFingerprint === sessionFingerprint;
    });

    if (matchedReport?.id && matchedReport.free_result) {
      return NextResponse.json({
        success: true,
        reportId: matchedReport.id,
        result: matchedReport.free_result as AIAnalysisResult,
        reused: true,
      });
    }

    const isZH = locale === 'zh-CN' || locale === 'zh-TW';

    const classifyInput = [itemType, itemName, itemDescription].filter(Boolean).join(' ');
    const params = classifySearchTarget(classifyInput);
    const entropy = determineEntropy(userMood || mood);
    const systemPrompt = getSystemPromptV9(locale);

    const userContent = JSON.stringify({
      User_Input: {
        itemType,
        itemName,
        itemDescription,
        itemColor,
        itemSize,
        lastSeenLocation,
        lastSeenTime,
        lossLocationCategory,
        lossLocationSubCategory,
        activity,
        mood,
        userActivity,
        searchedPlaces,
      },
      System_Injected_Params: {
        targetClass: params.targetClass,
        physicsTag: params.physicsTag,
        safetyWarning: params.safetyWarning,
        entropy,
        locale,
      },
    }, null, 2);

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'CogniSeek AI Analysis',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.4,
        max_tokens: 6000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: `AI API 调用失败: ${response.status}`, details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json({ success: false, error: 'AI 返回内容为空' }, { status: 500 });
    }

    let result: Record<string, unknown>;
    try {
      const cleaned = rawContent.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      result = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ success: false, error: 'AI 返回格式错误', raw: rawContent }, { status: 500 });
    }

    const numericProbability = Number(result.probability) || 70;
    let probabilityLevel: 'High' | 'Medium' | 'Low' = 'Low';
    if (numericProbability >= 75) probabilityLevel = 'High';
    else if (numericProbability >= 55) probabilityLevel = 'Medium';
    result.probabilityLevel = probabilityLevel;
    result.probability = numericProbability;

    const isMedical =
      itemType === 'medical' ||
      /药|胰岛素|insulin|medication|medicine|epipen|注射器|inhaler|血压|血糖/i.test(String(itemName || '')) ||
      /药|胰岛素|insulin|medication|medicine/i.test(String(itemDescription || ''));

    if (params.targetClass === 'Living_Human' || params.safetyWarning || isMedical) {
      if (!result.safetyAlert) {
        result.safetyAlert = isZH
          ? '⚠️ 紧急提醒：请立即拨打110/120，并同步联系周边安保人员协助搜寻。'
          : '⚠️ URGENT: Call emergency services immediately and alert nearby security staff.';
      }
    } else if (params.targetClass === 'Living_Pet') {
      if (!result.safetyAlert) {
        result.safetyAlert = isZH
          ? '🐾 宠物走失提醒：立即在附近张贴寻宠启事，并联系周边动物救助站。'
          : '🐾 Pet Alert: Post lost pet notices nearby and contact local animal shelters immediately.';
      }
    }

    const rawChecklist: string[] = Array.isArray(result.checklist) ? (result.checklist as string[]) : [];
    result.checklist = rawChecklist;

    const nowIso = new Date().toISOString();

    const freeResult = buildFreeResult(result);
    const premiumResult = buildPremiumResult(result);

    const persistedSessionData = {
      ...(fullSession && typeof fullSession === 'object' ? fullSession : {}),
      analysisFingerprint: sessionFingerprint,
      analysisFingerprintAt: nowIso,
    };

    const { data: insertedReport, error: insertError } = await supabaseAdmin
      .from('analysis_reports')
      .insert({
        user_id: user.id,
        locale,
        session_data: persistedSessionData,
        free_result: freeResult,
        premium_result: premiumResult,
      })
      .select('id')
      .single();

    if (insertError || !insertedReport) {
      console.error('[analyze] failed to save report', insertError);
      return NextResponse.json(
        {
          success: false,
          error: '报告保存失败，请重试',
          details: insertError?.message || 'Unknown insert error',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reportId: insertedReport.id,
      result: freeResult,
      classification: params,
      usage: data.usage,
    });
  } catch (error) {
    console.error('❌ analyze route 错误:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
