import { NextRequest, NextResponse } from 'next/server';
import { getSystemPromptV9 } from '@/lib/services/prompt-engine';
import { classifySearchTarget, determineEntropy } from '@/lib/services/classifier';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API Key 未配置' }, { status: 500 });
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
    } = body;

    const isZH = locale === 'zh-CN';

    // --- 分类器：确定目标类别 ---
    const classifyInput = [itemType, itemName, itemDescription].filter(Boolean).join(' ');
    const params = classifySearchTarget(classifyInput);
    const entropy = determineEntropy(userMood || mood);

    // --- 构建系统提示词 ---
    const systemPrompt = getSystemPromptV9(locale);

    // --- 构建用户消息 ---
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

    console.log('📤 发送给 AI 的数据:', userContent.slice(0, 500));

    // --- 调用 OpenRouter API ---
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
      console.error('❌ OpenRouter API 错误:', response.status, errorText);
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

    // --- 解析 JSON ---
    let result: Record<string, unknown>;
    try {
      const cleaned = rawContent.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      result = JSON.parse(cleaned);
    } catch {
      console.error('❌ JSON 解析失败，原始内容:', rawContent.slice(0, 300));
      return NextResponse.json({ success: false, error: 'AI 返回格式错误', raw: rawContent }, { status: 500 });
    }

    // ============================================================
    // API 层强制处理：不相信 AI 的以下字段，由代码兜底
    // ============================================================

    // 1. probabilityLevel 覆盖：基于 probability 数字值计算
    const numericProbability = Number(result.probability) || 70;
    let probabilityLevel: 'High' | 'Medium' | 'Low' = 'Low';
    if (numericProbability >= 75) probabilityLevel = 'High';
    else if (numericProbability >= 55) probabilityLevel = 'Medium';
    result.probabilityLevel = probabilityLevel;

    // 2. safetyAlert：活人/活物/医疗物品强制触发
    const isMedical =
      itemType === 'medical' ||
      /药|胰岛素|insulin|medication|medicine|epipen|注射器|inhaler|血压|血糖/i.test(String(itemName || '')) ||
      /药|胰岛素|insulin|medication|medicine/i.test(String(itemDescription || ''));

    if (params.targetClass === 'Living_Human' || params.safetyWarning || isMedical) {
      if (!result.safetyAlert) {
        result.safetyAlert = isZH
          ? '⚠️ 紧急提醒：请立即拨打110/120，并同步联系周边安保人员协助搜寻。'
          : '⚠️ URGENT: Call emergency services (110/120) immediately and alert nearby security staff.';
      }
    } else if (params.targetClass === 'Living_Pet') {
      if (!result.safetyAlert) {
        result.safetyAlert = isZH
          ? '🐾 宠物走失提醒：立即在附近张贴寻宠启事，并联系周边动物救助站。'
          : '🐾 Pet Alert: Post lost pet notices nearby and contact local animal shelters immediately.';
      }
    }

    // 3. compass 方向兜底：确保 ENUM 合法
    const VALID_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const compassRaw = result.compass as Record<string, unknown> | undefined;
    if (compassRaw && typeof compassRaw.direction === 'string') {
      const dir = compassRaw.direction.trim().toUpperCase();
      if (!VALID_DIRECTIONS.includes(dir)) {
        compassRaw.direction = 'N';
      }
    } else if (!result.compass) {
      result.compass = { direction: 'N', confidence: '50%', reasoning: isZH ? '方向不确定' : 'Direction uncertain' };
    }

    // ============================================================
    // 4. API 层领域专家动作注入：checklist[0] 强制换成最高洞察力动作
    // ============================================================
    const rawChecklist: string[] = Array.isArray(result.checklist) ? (result.checklist as string[]) : [];

    // 判断是否为交通工具场景（出租车/网约车/公交/地铁/火车/飞机）
    const isTransitScene = /transport|交通|出租|网约|滴滴|uber|taxi|cab|公交|地铁|subway|metro|火车|train|飞机|plane|airplane|flight|巴士|bus|船|ferry/i.test(
      String(lossLocationCategory || '') + ' ' + String(lossLocationSubCategory || '') + ' ' + String(lastSeenLocation || '')
    );

    const domainFirstAction = (() => {
      const nameLC = String(itemName || '').toLowerCase();
      const descLC = String(itemDescription || '').toLowerCase();
      const typeLC = String(itemType || '').toLowerCase();

      // 交通工具场景：任何物品都优先拦截下游，时间窗口极窄
      if (isTransitScene) {
        return isZH
          ? '📞 立即致电交通运营方（网约车：平台客服/行程记录联系司机；出租车：当地出租车调度台；地铁/公交：运营商失物招领；火车/飞机：官方失物电话）——物品随车辆移动，每延误5分钟找回概率下降20%，打电话比亲自寻找快10倍。'
          : '📞 Call the transit operator IMMEDIATELY (rideshare: platform support + contact driver via trip history; taxi: local dispatch; subway/bus: operator lost property; train/plane: official lost & found hotline) — the item is moving away from you. Every 5-minute delay reduces recovery odds by 20%. One phone call beats any physical search.';
      }

      // 宠物（躲藏型）：仓鼠/猫 → 放气味诱导，人离开
      if (params.targetClass === 'Living_Pet' && params.physicsTag === 'Denning') {
        return isZH
          ? '👕 立即把你穿过的衣物和宠物食碗放在它最后出现的地点，然后所有人离开该区域至少30分钟——受惊的仓鼠/猫只有在感觉安全时才会出来，人的存在会让它一直躲着。'
          : '👕 Place worn clothing + food bowl at the last-seen spot, then ALL humans must leave the area for 30+ minutes — frightened hamsters/cats only emerge when they feel safe. Human presence keeps them hiding.';
      }

      // 宠物（奔跑型）：狗 → 气味锚点
      if (params.targetClass === 'Living_Pet' && params.physicsTag === 'Wander') {
        return isZH
          ? '👕 在最后目击点放置主人穿过的衣物作为气味锚点，不要追逐——奔跑型宠物被追会跑得更远，自行返回的概率远高于被追回的概率。'
          : '👕 Place worn owner clothing at last-seen point as scent anchor, DO NOT chase — running pets flee further when pursued. Probability of self-return far exceeds catch-by-chase.';
      }

      // 人（认知障碍/老人）→ 立刻报警
      if (params.targetClass === 'Living_Human') {
        return isZH
          ? '🚨 立即拨打110报警并同时联系社区/街道网格员——走失老人/儿童每过一小时找回概率下降15%，专业搜救资源是个人搜索效率的20倍，报警是唯一正确的第一步。'
          : '🚨 Call 110 police immediately AND contact community grid officers — recovery probability drops 15% per hour for missing persons. Professional search resources are 20x more effective than individual search.';
      }

      // 充电宝/移动电源/充电器/数据线 — 共同特征：极易插在插座后忘记
      if (['移动电源', '充电宝', 'power bank', 'powerbank', '充电器', '数据线', 'charger', 'charging cable', 'cable', 'usb', 'adapter', '插头', '电源适配器'].some(k => nameLC.includes(k) || descLC.includes(k)) || typeLC === 'cable') {
        return isZH
          ? '🔌 立即检查工位及周边5米内所有插座、充电口和排插：充电器/数据线极易插上后忘记取走——这比任何物理搜索的找回率都高，先确认插座再找其他地方。'
          : '🔌 Check every power outlet, charging dock, and power strip within 5 meters FIRST — chargers and cables are most often found still plugged in and forgotten. Do this BEFORE any physical search.';
      }

      // 手机
      if (['手机', 'phone', 'iphone', 'android', 'smartphone'].some(k => nameLC.includes(k) || typeLC === 'phone')) {
        return isZH
          ? '📞 立刻用另一部手机拨打丢失号码，保持安静聆听铃声方向——这是找手机ROI最高的第一动作。'
          : '📞 Call the lost phone from another device right now and listen for the ringtone direction — highest ROI first action for any phone search.';
      }

      // 钥匙
      if (['钥匙', 'key', 'keys'].some(k => nameLC.includes(k) || nameLC === k)) {
        return isZH
          ? '🗝️ 检查你今天经过的所有门锁和抽屉锁的锁孔：钥匙极易留在锁里，这是最常见的"遗失"原因。'
          : '🗝️ Check every door lock and drawer lock you used today — keys are most commonly found still inserted in the lock.';
      }

      // 戒指/首饰
      if (['戒指', '耳环', '首饰', '项链', '手链', 'ring', 'earring', 'jewelry', 'bracelet', 'necklace'].some(k => nameLC.includes(k))) {
        return isZH
          ? '🚿 立即检查3米内所有排水口（洗手盆下水、地漏、浴室排水）：小型圆形首饰在3秒内就能滚入排水口，时间至关重要。'
          : '🚿 Check every drain within 3 meters immediately (sink drain, floor drain, shower drain) — small round jewelry rolls into drains within seconds, time is critical.';
      }

      // 银行卡/信用卡 — 最高价值第一动作：先冻结再找
      if (['银行卡', '信用卡', '储蓄卡', '借记卡', 'bank card', 'credit card', 'debit card', 'atm card'].some(k => nameLC.includes(k) || descLC.includes(k))) {
        return isZH
          ? '🔐 立即拨打银行客服热线冻结卡片（工行95588/建行95533/招行95555等），同时查询最后一笔交易记录——冻结防止盗刷，交易记录可反向锁定丢失时间和地点，这比任何物理搜索都优先。'
          : '🔐 Call your bank hotline IMMEDIATELY to freeze the card and request recent transaction history — freezing prevents unauthorized use, and the last transaction timestamp + location can pinpoint exactly when and where you lost it. This is the highest-priority action before any physical search.';
      }

      // 笔记本电脑/平板 在交通工具（已被 isTransitScene 覆盖，此处处理非交通场景的数码大件）
      if (['笔记本', '电脑', 'laptop', 'notebook', '平板', 'tablet', 'ipad', 'macbook'].some(k => nameLC.includes(k) || descLC.includes(k))) {
        return isZH
          ? '📍 立即打开 Find My / 设备管理远程定位——笔记本/平板都有GPS或Wi-Fi定位功能，数字手段定位比物理搜索快100倍，同时开启远程锁定防止数据泄露。'
          : '📍 Open Find My / device management to get real-time location IMMEDIATELY — laptops and tablets have GPS/Wi-Fi tracking. Digital location beats physical search by 100x. Also enable remote lock to protect your data.';
      }

      // 护照/重要证件
      if (['护照', 'passport', '身份证', 'id card', '证件'].some(k => nameLC.includes(k) || descLC.includes(k))) {
        return isZH
          ? '📞 立即致电所在机构（机场：航司失物招领热线；酒店：前台；地铁：运营商失物处）——工作人员可能已经找到，先电话确认比自行搜索效率高10倍。'
          : '📞 Call the institution immediately (airport: airline lost & found hotline; hotel: front desk; transit: operator lost property) — staff may already have it. Phone call beats manual search by 10x.';
      }

      // 手表 — 最常在洗手/做饭时摘下忘在水槽旁
      if (['手表', 'watch', '腕表', 'apple watch', 'smartwatch'].some(k => nameLC.includes(k))) {
        return isZH
          ? '🚰 立即检查最近使用过的水槽/洗手台边缘和排水口——手表在洗手时被摘下放在台面，是最常见的"遗忘点"，而且可能已经滑入排水网。'
          : '🚰 Check every sink/basin edge and drain you visited recently — watches are removed for hand-washing and forgotten on countertops. They may have slid into the drain grate.';
      }

      // 耳机/AirPods — 用 Find My 定位
      if (['耳机', 'airpods', 'earbud', '蓝牙耳机', 'earphone', 'headphone', 'buds'].some(k => nameLC.includes(k))) {
        return isZH
          ? '📍 立即打开 Find My / 厂商定位App 搜索耳机位置——蓝牙耳机有定位功能，这比任何物理搜索都快，先用数字手段定位再行动。'
          : '📍 Open Find My / manufacturer tracking app to ping the earbuds location RIGHT NOW — Bluetooth earbuds have location tracking. Digital search before physical search.';
      }

      // 眼镜 — 检查头顶和衣领
      if (['眼镜', '墨镜', 'glasses', 'sunglasses', '太阳镜'].some(k => nameLC.includes(k))) {
        return isZH
          ? '👤 先摸一下自己的头顶和衣领——眼镜被推到头顶或挂在领口后遗忘的概率高达30%，这是最容易被忽视的"灯下黑"。'
          : '👤 Touch your head and collar FIRST — glasses pushed onto the head or hung on the collar are forgotten 30% of the time. This is the most overlooked blind spot.';
      }

      return null; // 其他物品由 AI 自由生成
    })();

    // ============================================================
    // 通用手电筒检测模式：匹配各种手电筒表达方式
    const genericPatterns = /手电筒|flashlight|闪光灯|flash\s*light|用光|照射|torch|lantern/i;

    // 通用动作质检：判断一条 action 是否"太通用"（不含具体场景信息）
    const isGenericAction = (action: string): boolean => {
      if (genericPatterns.test(action)) return true;
      // 其他通用模式：蹲下/改变视角/整理/回想 但不含具体地点名称
      if (/蹲下|弯腰|crouch|kneel|get low/i.test(action) && !/具体|specific|under the|在.*下方/.test(action)) return true;
      return false;
    };

    // 通用重排逻辑：当 Action 1 是通用动作且没有领域注入时，
    // 从 Actions 2-5 中找最"高价值"的（含电话/联系/app/冻结/系统等关键词）提升到首位
    const reorderForBestAction1 = (checklist: string[]): string[] => {
      if (checklist.length < 2) return checklist;
      if (!isGenericAction(checklist[0])) return checklist; // Action 1 已经足够好

      // 高价值关键词：打电话、联系机构、数字手段、防损失措施
      const highValuePatterns = /电话|联系|拨打|call|contact|freeze|冻结|定位|find my|app|platform|平台|客服|lost.*found|失物|报警|police|dispatch|schedule|清洁|cleaning|hotline/i;

      // 找第一个高价值动作的索引
      const bestIdx = checklist.findIndex((action, idx) => idx > 0 && highValuePatterns.test(action));

      if (bestIdx === -1) return checklist; // 没找到更好的，保持原样

      // 把高价值动作移到首位，其余顺序不变
      const reordered = [...checklist];
      const [best] = reordered.splice(bestIdx, 1);
      reordered.unshift(best);
      return reordered;
    };

    // 最终 checklist 生成逻辑
    const finalChecklist = (() => {
      if (rawChecklist.length === 0) return domainFirstAction ? [domainFirstAction] : [];

      // 有领域注入：注入动作替换 AI 的 Action 0，统一跳过 rawChecklist[0]
      // 避免注入动作与 AI 生成的第一条内容相近造成重复
      if (domainFirstAction) {
        return [domainFirstAction, ...rawChecklist.slice(1)];
      }

      // 无领域注入：用通用重排逻辑提升最佳 Action
      return reorderForBestAction1(rawChecklist);
    })();

    result.checklist = finalChecklist.length > 0 ? finalChecklist : rawChecklist;

    // ============================================================
    // 5. 返回结果
    // ============================================================
    const transformedResult = {
      probability: numericProbability,
      probabilityLevel: result.probabilityLevel,
      summary: result.summary || '',
      priorityAction: result.priorityAction || {},
      predictions: result.predictions || [],
      basicSearchPoints: result.basicSearchPoints || [],
      checklist: result.checklist || [],
      cognitiveOverride: result.cognitiveOverride || '',
      stopCondition: result.stopCondition || '',
      encouragement: result.encouragement || '',
      compass: result.compass || {},
      behaviorAnalysis: result.behaviorAnalysis || '',
      environmentAnalysis: result.environmentAnalysis || '',
      timelineAnalysis: result.timelineAnalysis || '',
      safetyAlert: result.safetyAlert || null,
      _thought_process: result._thought_process || '',
    };

    console.log('✅ 分析完成，targetClass:', params.targetClass, '| probabilityLevel:', probabilityLevel);

    return NextResponse.json({
      success: true,
      result: transformedResult,
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
