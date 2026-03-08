import { NextRequest, NextResponse } from 'next/server';
import { classifySearchTarget, determineEntropy } from '@/lib/services/classifier';
import { getSystemPromptV9 } from '@/lib/services/prompt-engine';

// ============================================================
// 🧠 V17 Production：万物分类系统 + 钢铁防御 API 层
// ============================================================

interface SearchParams {
  entropy: 'High' | 'Low';
  targetClass: 'Living_Human' | 'Living_Pet' | 'Inanimate_Object';
  physicsTag: 'Roll' | 'Slide' | 'Sink' | 'Static' | 'Flight' | 'Wander' | 'Denning';
  safetyWarning: boolean;
  globalContext?: 'Individualist' | 'Collectivist' | 'Outdoor';
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: NextRequest) {
  console.log('=== 🚀 CogniSeek V17 Production 分析开始 ===');
  
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
    // 🧠 万物分类器
    // ============================================================
    
    const inputText = `${itemType} ${itemName} ${itemDescription}`;
    console.log('📋 分析物品:', inputText);
    
    const classification = classifySearchTarget(inputText);
    const entropy = determineEntropy(userMood || mood);
    
    const params: SearchParams = {
      ...classification,
      entropy,
      globalContext: 'Individualist'
    };
    
    console.log('📊 最终分类参数:', params);

    // ============================================================
    // 🚀 调用 OpenRouter API
    // ============================================================

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error('❌ OPENROUTER_API_KEY 未配置');
      return NextResponse.json({ error: 'API 配置错误' }, { status: 500 });
    }

    console.log('📡 正在调用 OpenRouter (Model: google/gemini-2.0-flash-001)...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'CogniSeek V17',
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
                System_Injected_Params: params
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
        return NextResponse.json({ error: 'AI 返回内容异常' }, { status: 500 });
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
          console.error('❌ 所有解析尝试都失败，原始内容:', aiContent);
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
      // 🛡️ V17 API 层数据强制接管与兜底策略
      // ============================================================

      const isZH = locale === 'zh-CN';

      // --- 1. API 完全接管 probabilityLevel，永远不信任 AI 的枚举 ---
      const rawProbability = result.probability;
      const numericProbability = typeof rawProbability === 'number'
        ? Math.min(99, Math.max(1, rawProbability))
        : 70;

      const probabilityLevel = numericProbability >= 75 ? 'High'
        : numericProbability >= 55 ? 'Medium'
        : 'Low';

      // --- 2. 生命安全强行熔断（含医疗物品检测）---
      const isMedical = itemType === 'medical'
        || String(itemName || '').includes('药')
        || String(itemName || '').toLowerCase().includes('insulin')
        || String(itemName || '').toLowerCase().includes('medication')
        || String(itemDescription || '').includes('药');

      const safetyAlert = (() => {
        const isLivingPet = params.targetClass === 'Living_Pet';
        const isLivingHuman = params.targetClass === 'Living_Human';
        const needsSafety = isLivingPet || isLivingHuman || isMedical || params.safetyWarning;

        if (!needsSafety) return result.safetyAlert || null;

        // AI 已返回有效 safetyAlert，优先保留
        if (result.safetyAlert && result.safetyAlert.length > 5) return result.safetyAlert;

        // API 注入兜底文案
        if (isLivingHuman) {
          return isZH
            ? '🚨 您正在寻找的是人。若失联已超过24小时，请立即联系警方报案，并保持手机畅通。'
            : '🚨 You are searching for a person. If missing for more than 24 hours, contact police immediately and keep your phone reachable.';
        }
        if (isLivingPet) {
          return isZH
            ? '⚠️ 寻找宠物请立即扩大周边物理搜索，切勿大声惊吓，时间至关重要！'
            : '⚠️ Expand physical search for pet immediately. Do not shout to avoid scaring them. Time is critical!';
        }
        if (isMedical) {
          return isZH
            ? '⚕️ 医疗用品遗失具有极高风险！排查的同时请立即准备备用药品方案。'
            : '⚕️ Medical item missing — high risk! Prepare backup medication options immediately while searching.';
        }
        return isZH
          ? '⚠️ 请注意排查过程中的人身安全。'
          : '⚠️ Ensure personal safety while searching.';
      })();

      // --- 3. Compass 兜底：防止 AI 输出 None 或空字符串导致前端崩溃 ---
      const validDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const rawDir = result.compass?.direction?.trim().toUpperCase() || '';
      const isValidDir = validDirections.includes(rawDir);

      const finalDirection = isValidDir ? rawDir : (params.physicsTag === 'Roll' ? 'SE' : 'N');
      const finalConfidence = isValidDir
        ? (parseInt(String(result.compass?.confidence || '60')) || 60)
        : 40;

      // --- 多语言兜底文案 ---
      const fallbacks = {
        summary: isZH ? '基于当前环境变量的系统综合分析' : 'Analysis based on current environmental variables.',
        encouragement: isZH ? '保持冷静，遵循上述战术动作排查，成功率很大。' : 'Stay calm and follow the tactical steps above. Success rate is high.',
        directionDesc: isZH ? '基于物理轨迹或环境地形的方向推算' : 'Inferred from physical trajectory or terrain layout.',
        primaryLabel: isZH ? '北方' : 'North',
        basicSearchPoints: isZH
          ? ['【附近显眼处】: 视觉疲劳导致的注意力盲区', '【动线沿途】: 移动中无意识的掉落点', '【异常高低处】: 随手搁置的异常落点']
          : ['【Immediate Area】: Inattentional blindness zone', '【Transit Path】: Unconscious drop during movement', '【Abnormal Heights】: Hasty placement spot'],
      };

      // --- 构建最终安全数据结构 ---
      const transformedResult = {
        probability: numericProbability,
        probabilityLevel,
        summary: result.summary || result.diagnosis || fallbacks.summary,
        safetyAlert,
        priorityAction: result.priorityAction || {
          target: isZH ? '最后确认接触点' : 'Last confirmed contact point',
          action: isZH ? '物理隔离排查法' : 'Physical isolation check',
          why: isZH ? '缩小核心嫌疑区域' : 'Narrow down the core suspect radius'
        },
        predictions: (result.predictions || []).map((pred: any) => ({
          location: pred.location || '',
          confidence: typeof pred.confidence === 'number'
            ? pred.confidence
            : (parseInt(String(pred.confidence || pred.probability || '50')) || 50),
          reason: pred.reason || pred.reasoning || '',
          technique: pred.technique || ''
        })),
        direction: {
          primary: finalDirection,
          primaryLabel: isValidDir ? (result.compass?.direction || finalDirection) : fallbacks.primaryLabel,
          confidence: finalConfidence,
          description: result.compass?.reasoning || fallbacks.directionDesc
        },
        behaviorAnalysis: result.behaviorAnalysis || '',
        environmentAnalysis: result.environmentAnalysis || '',
        timelineAnalysis: result.timelineAnalysis || '',
        basicSearchPoints: (result.basicSearchPoints && result.basicSearchPoints.length > 0)
          ? result.basicSearchPoints
          : fallbacks.basicSearchPoints,
        checklist: result.checklist || [],
        cognitiveOverride: result.cognitiveOverride || '',
        stopCondition: result.stopCondition || '',
        encouragement: result.encouragement || fallbacks.encouragement,
        _thought_process: result._thought_process || ''
      };

      console.log('=== ✅ CogniSeek V17 分析完成 ===');
      console.log('📊 概率:', numericProbability, '| 级别:', probabilityLevel, '| 安全警告:', !!safetyAlert);
      
      return NextResponse.json({
        success: true,
        result: transformedResult,
        classification: params,
        usage: data.usage,
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('⏱️ 请求超时');
        return NextResponse.json({ error: 'AI 服务响应超时，请重试' }, { status: 504 });
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
