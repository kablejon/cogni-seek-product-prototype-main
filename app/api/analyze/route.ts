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
          temperature: 0.4,
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
      const medicalKeywords = ['药', '胰岛素', '注射笔', '血糖仪', '救心丸', '硝酸甘油', '吸入器', '哮喘', '透析'];
      const medicalKeywordsEN = ['insulin', 'medication', 'medicine', 'inhaler', 'syringe', 'epipen', 'prescription'];
      const combinedText = `${itemType || ''} ${itemName || ''} ${itemDescription || ''}`.toLowerCase();
      const isMedical = itemType === 'medical'
        || medicalKeywords.some(k => combinedText.includes(k))
        || medicalKeywordsEN.some(k => combinedText.includes(k));

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

      // --- API 层：领域专家动作注入 ---
      // 对于特定物品类型，强制把最高洞察力的动作放到 checklist[0]
      const rawChecklist: string[] = result.checklist || [];

      const domainFirstAction = (() => {
        const nameLC = String(itemName || '').toLowerCase();
        const descLC = String(itemDescription || '').toLowerCase();
        const typeLC = String(itemType || '').toLowerCase();

        // 电子设备：充电宝/移动电源 — 最高概率在充电口
        if (['移动电源','充电宝','power bank','powerbank'].some(k => nameLC.includes(k) || descLC.includes(k))) {
          return isZH
            ? '🔌 立即检查工位及周边5米内所有插座和充电口：充电宝极易被插上后忘记取走，这比任何物理搜索的找回率都高。'
            : '🔌 Check every power outlet and charging dock within 5 meters immediately — power banks are most often found still plugged in, forgotten after charging. Do this BEFORE any physical search.';
        }
        // 手机 — 拨打听声音
        if (['手机','phone','iphone','android','smartphone'].some(k => nameLC.includes(k) || typeLC === 'phone')) {
          return isZH
            ? '📞 立刻用另一部手机拨打丢失号码，保持安静聆听铃声方向——这是找手机ROI最高的第一动作。'
            : '📞 Call the lost phone from another device right now and listen for the ringtone direction — highest ROI first action for any phone search.';
        }
        // 钥匙 — 检查所有锁孔
        if (['钥匙','key','keys'].some(k => nameLC.includes(k))) {
          return isZH
            ? '🗝️ 检查你今天经过的所有门锁和抽屉锁的锁孔：钥匙极易留在锁里，这是最常见的"遗失"原因。'
            : '🗝️ Check every door lock and drawer lock you used today — keys are most commonly found still inserted in the lock.';
        }
        // 戒指/首饰 — 检查排水口
        if (['戒指','耳环','首饰','项链','ring','earring','jewelry','bracelet','necklace'].some(k => nameLC.includes(k))) {
          return isZH
            ? '🚿 立即检查3米内所有排水口（洗手盆下水、地漏、浴室排水）：小型圆形首饰在3秒内就能滚入排水口，时间至关重要。'
            : '🚿 Check every drain within 3 meters immediately (sink drain, floor drain, shower drain) — small round jewelry rolls into drains within seconds, time is critical.';
        }
        // 护照/重要证件 — 先打电话给机构
        if (['护照','passport','身份证','id card','证件'].some(k => nameLC.includes(k) || descLC.includes(k))) {
          return isZH
            ? '📞 立即致电所在机构（机场失物招领：400热线/航司；酒店：前台；地铁：运营商失物处）——工作人员可能已经找到，先电话确认比自行搜索效率高10倍。'
            : '📞 Call the institution immediately (airport: airline lost & found hotline; hotel: front desk; transit: operator lost property) — staff may already have it. Phone call beats manual search by 10x.';
        }
        return null; // 其他物品不注入，由 AI 自由生成
      })();

      // 注入规则：如果有领域特定动作，且 AI 的 Action 1 包含"手电筒/flashlight"等通用词，替换掉
      const genericFirstActionPatterns = /手电筒|flashlight|用光|照射|flash\s*light/i;
      const finalChecklist = (() => {
        if (!domainFirstAction || rawChecklist.length === 0) return rawChecklist;
        // 如果 Action 1 是通用手电筒类，替换；否则在最前面插入
        if (genericFirstActionPatterns.test(rawChecklist[0])) {
          return [domainFirstAction, ...rawChecklist.slice(1)];
        }
        // Action 1 已经是好内容，把领域动作插入 Action 1 位置，原内容后移
        return [domainFirstAction, ...rawChecklist.slice(0, 4)];
      })();

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
        checklist: finalChecklist,
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
