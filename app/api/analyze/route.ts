import { NextRequest, NextResponse } from 'next/server';
import { classifySearchTarget, determineEntropy } from '@/lib/services/classifier';
import { getSystemPromptV9 } from '@/lib/services/prompt-engine';

// ============================================================
// 🧠 V9.0 Production：万物分类系统 (已重构为服务层)
// ============================================================

interface SearchParams {
  entropy: 'High' | 'Low';
  targetClass: 'Living_Human' | 'Living_Pet' | 'Inanimate_Object';
  physicsTag: 'Roll' | 'Slide' | 'Sink' | 'Static' | 'Flight' | 'Wander' | 'Denning';
  safetyWarning: boolean;
  globalContext?: 'Individualist' | 'Collectivist' | 'Outdoor';
}

// ============================================================
// 📜 SYSTEM_PROMPT_V9: Production 系统提示词 (已移至 prompt-engine.ts)
// ============================================================

// 原 SYSTEM_PROMPT_V9 已移至 lib/services/prompt-engine.ts

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: NextRequest) {
  console.log('=== 🚀 CogniSeek V9.0 Production 分析开始 ===');
  
  try {
    const body = await request.json();
    console.log('接收到的数据:', JSON.stringify(body, null, 2));

    const { 
      itemType, 
      itemName,
      itemDescription, 
      lastSeenLocation,
      lastSeenTime,
      activity,
      mood,
      userMood,
      locale,
      searchedPlaces,
      ...otherData 
    } = body;

    // ============================================================
    // 🧠 万物分类器：使用重构后的服务层
    // ============================================================
    
    const inputText = `${itemType} ${itemName} ${itemDescription}`;
    console.log('📋 分析物品:', inputText);
    
    // 1. 调用业务服务进行分类
    const classification = classifySearchTarget(inputText);
    // Use userMood (ID-based) for entropy; fall back to mood label for compatibility
    const entropy = determineEntropy(userMood || mood);
    
    const params: SearchParams = {
      ...classification,
      entropy,
      globalContext: 'Individualist' // 可以后续根据 headers 或 user profile 动态获取
    };
    
    console.log('📊 最终分类参数:', params);

    // ============================================================
    // 🚀 调用 OpenRouter API
    // ============================================================

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error('❌ OPENROUTER_API_KEY 未配置');
      return NextResponse.json(
        { error: 'API 配置错误' },
        { status: 500 }
      );
    }

    console.log('✓ API Key 已配置');
    console.log('📡 正在调用 OpenRouter (Model: google/gemini-2.0-flash-001)...');

    // 创建超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45秒超时

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'CogniSeek V7.0',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [
            {
              role: 'system',
              content: getSystemPromptV9(locale || 'zh-CN')
            },
            {
              role: 'user',
              content: JSON.stringify({
                User_Input: {
                  itemType,
                  itemName,
                  itemDescription,
                  lastSeenLocation,
                  lastSeenTime,
                  activity,
                  mood,
                  searchedPlaces,
                  ...otherData
                },
                System_Injected_Params: params // 🔐 硬参数注入
              })
            }
          ],
          temperature: 0.6,
          max_tokens: 4000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📡 OpenRouter 响应状态:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ OpenRouter API 错误:', errorData);
        return NextResponse.json(
          { error: 'AI 服务暂时不可用', details: errorData },
          { status: 500 }
        );
      }

      const data = await response.json();
      console.log('✓ OpenRouter 响应成功');
      
      const aiContent = data.choices?.[0]?.message?.content;

      if (!aiContent) {
        console.error('❌ AI 返回内容为空');
        return NextResponse.json(
          { error: 'AI 返回内容异常' },
          { status: 500 }
        );
      }

      console.log('📝 AI 回复长度:', aiContent.length);
      console.log('📝 AI 回复预览:', aiContent.substring(0, 300));

      // 解析 JSON 结果
      let result;
      try {
        const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : aiContent;
        result = JSON.parse(jsonString.trim());
        console.log('✓ JSON 解析成功');
      } catch (parseError) {
        console.error('⚠️ JSON 解析失败，尝试直接解析');
        
        try {
          result = JSON.parse(aiContent.trim());
          console.log('✓ 直接解析成功');
        } catch {
          console.error('❌ 所有解析尝试都失败');
          console.error('原始内容:', aiContent);
          return NextResponse.json(
            { error: 'AI 返回格式异常', raw: aiContent.substring(0, 500) },
            { status: 500 }
          );
        }
      }
      
      // 验证必需字段
      if (!result.probability || !result.predictions || !result.checklist || !result.priorityAction) {
        console.error('❌ AI 返回数据不完整:', result);
        return NextResponse.json(
          { error: 'AI 返回数据不完整', raw: JSON.stringify(result) },
          { status: 500 }
        );
      }

      // ============================================================
      // 🔄 数据格式转换：V7.0 → 前端兼容格式
      // ============================================================
      
      // Locale-aware fallback strings
      const isZH = (locale || 'en') === 'zh-CN';
      const fallbacks = {
        summary: isZH ? '基于科学寻物系统分析的综合评估' : 'Comprehensive assessment based on CogniSeek system.',
        direction: isZH ? '基于物理模拟的方向预测' : 'Direction prediction based on physics simulation.',
        encouragement: isZH ? '90%的"丢失"物品都在你认为它们所在的2米范围内。' : '90% of lost items are within 2 meters of where you think they are.',
        primaryLabel: isZH ? '北方' : 'North',
        basicSearchPoints: isZH
          ? [`${lastSeenLocation || '该区域'}的表面和可见区域`, '桌面、台面等最后使用物品的区域', '地面开阔区域（掉落的第一反应位置）']
          : [`Visible surfaces in ${lastSeenLocation || 'the area'}`, 'Tables and countertops (last-used areas)', 'Open floor areas (first instinct drop zones)'],
      };

      // --- Task 2: API fully owns probabilityLevel, never trust AI's enum ---
      const probabilityMap: { [key: string]: number } = {
        'High': 85, 'Medium': 60, 'Low': 35
      };
      const rawProbability = result.probability;
      const numericProbability = typeof rawProbability === 'number'
        ? Math.min(99, Math.max(1, rawProbability))
        : (probabilityMap[rawProbability] || 70);

      // Hard-coded thresholds: AI probabilityLevel is ignored
      const probabilityLevel = numericProbability >= 75 ? 'High'
        : numericProbability >= 55 ? 'Medium'
        : 'Low';

      // --- Task 3: API owns safetyAlert for living targets ---
      const safetyAlert = (() => {
        const isLivingPet = params.targetClass === 'Living_Pet';
        const isLivingHuman = params.targetClass === 'Living_Human';
        const needsSafety = isLivingPet || isLivingHuman || params.safetyWarning;
        if (!needsSafety) return result.safetyAlert || null;

        // If AI already returned a valid safetyAlert, keep it
        if (result.safetyAlert && result.safetyAlert.length > 10) return result.safetyAlert;

        // Otherwise inject a code-level default
        if (isLivingHuman) {
          return isZH
            ? '🚨 您正在寻找的是人。若失联已超过24小时，请立即联系警方报案，并保持手机畅通以便被联系。'
            : '🚨 You are searching for a person. If missing for more than 24 hours, contact police immediately and keep your phone reachable.';
        }
        if (isLivingPet) {
          return isZH
            ? '⚠️ 您正在寻找的是宠物。请立即扩大搜索范围至周边街区，联系附近邻居，并在显眼位置张贴寻宠启事。时间至关重要！'
            : '⚠️ You are searching for a pet. Expand your search to nearby blocks, contact neighbors, and post missing pet notices in visible locations immediately. Time is critical!';
        }
        return isZH
          ? '⚠️ 请注意安全，若情况紧急请立即联系相关部门。'
          : '⚠️ Please ensure your safety. Contact relevant authorities immediately if the situation is urgent.';
      })();

      const transformedResult = {
        probability: numericProbability,
        probabilityLevel,
        summary: result.summary || result.diagnosis || fallbacks.summary,
        safetyAlert,
        priorityAction: {
          target: result.priorityAction?.target || '',
          action: result.priorityAction?.action || '',
          why: result.priorityAction?.why || '',
          successRate: result.priorityAction?.successRate || '60%'
        },
        predictions: (result.predictions || []).map((pred: any) => ({
          location: pred.location || '',
          // confidence may be "XX%", "XX", or a raw number
          confidence: typeof pred.confidence === 'number'
            ? pred.confidence
            : (parseInt(String(pred.confidence || pred.probability || '50')) || 50),
          reason: pred.reason || pred.reasoning || '',
          technique: pred.technique || ''
        })),
        direction: (() => {
          const validDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
          // Extract direction — match only capital-letter compass tokens
          const rawDir = result.compass?.direction?.match(/^(NE|NW|SE|SW|N|S|E|W)$/)?.[1]
            || result.compass?.direction?.match(/(NE|NW|SE|SW|N|S|E|W)/)?.[1]
            || '';
          const isValid = validDirections.includes(rawDir);
          // API-level fallback: if AI returned empty or invalid, infer from physicsTag
          const finalDirection = isValid ? rawDir
            : (params.physicsTag === 'Roll' ? 'SE' : 'N');
          const finalConfidence = isValid
            ? (parseInt(String(result.compass?.confidence || '65')) || 65)
            : 40; // lower confidence when system-inferred
          return {
            primary: finalDirection,
            primaryLabel: isValid ? (result.compass?.direction || finalDirection) : fallbacks.primaryLabel,
            confidence: finalConfidence,
            description: result.compass?.reasoning || fallbacks.direction
          };
        })(),
        _compassFallback: !['N','NE','E','SE','S','SW','W','NW'].includes(
          result.compass?.direction?.match(/^(NE|NW|SE|SW|N|S|E|W)$/)?.[1] || ''
        ),
        behaviorAnalysis: result.behaviorAnalysis || '',
        environmentAnalysis: result.environmentAnalysis || '',
        timelineAnalysis: result.timelineAnalysis || '',
        basicSearchPoints: result.basicSearchPoints || fallbacks.basicSearchPoints,
        checklist: result.checklist || [],
        cognitiveOverride: result.cognitiveOverride || '',
        stopCondition: result.stopCondition || '',
        encouragement: result.encouragement || fallbacks.encouragement,
        _thought_process: result._thought_process || ''
      };

      console.log('=== ✅ CogniSeek V9.0 Production 分析完成 ===');
      console.log('📊 转换后的结果:', JSON.stringify(transformedResult).substring(0, 300));
      
      return NextResponse.json({
        success: true,
        result: transformedResult,
        classification: params, // 返回分类信息供前端参考
        usage: data.usage,
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('⏱️ 请求超时');
        return NextResponse.json(
          { error: 'AI 服务响应超时，请重试' },
          { status: 504 }
        );
      }
      
      throw fetchError;
    }

  } catch (error) {
    console.error('❌ 分析请求处理失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误', details: String(error) },
      { status: 500 }
    );
  }
}
