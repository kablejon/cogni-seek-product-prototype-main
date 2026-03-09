import { SearchSession } from './types';
import { 
  itemCategories, 
  locationCategories, 
  activityCategories, 
  moodOptions 
} from './data';

// ==================== 类型定义 ====================

export interface AIAnalysisResult {
  probability: number;
  probabilityLevel: string;
  summary: string;
  priorityAction: {
    target: string;
    action: string;
    why: string;
  };
  predictions: Array<{
    location: string;
    confidence: number;
    reason: string;
    technique: string;
  }>;
  direction: {
    primary: string;
    primaryLabel: string;
    confidence: number;
    description: string;
  };
  behaviorAnalysis: string;
  environmentAnalysis: string;
  timelineAnalysis: string;
  basicSearchPoints: string[]; // 免费：3个常规排查点
  checklist: string[];
  cognitiveOverride: string;
  stopCondition: string;
  encouragement: string;
}

// ==================== 辅助函数 ====================

function getItemDisplayName(session: SearchSession, locale?: string): string {
  if (session.itemName) return session.itemName;
  const category = itemCategories.find(c => c.id === session.itemCategory);
  const item = category?.items.find(i => i.id === session.itemCategory);
  return item?.label || (locale === 'en' ? 'item' : '物品');
}

function getLocationDisplayName(session: SearchSession): string {
  // ✅ 修复：使用正确的字段名
  if (session.lossLocationCustom) return session.lossLocationCustom;
  
  // 使用 lossLocation 或从 lossLocationCategory 查找
  if (session.lossLocation) return session.lossLocation;
  
  const category = locationCategories.find(c => c.id === session.lossLocationCategory);
  return category?.label || category?.name || session.lossLocationCategory || 'Unknown location';
}

function getActivityDisplayName(session: SearchSession, locale?: string): string {
  return session.userActivity || (locale === 'en' ? 'daily activity' : '日常活动');
}

function getMoodDisplayInfo(session: SearchSession): { label: string; icon: string } {
  // ✅ 修复：使用 userMood
  if (session.userMood) return { label: session.userMood, icon: '🧠' };
  
  // 备用：从 moodOptions 查找
  const mood = moodOptions.find(m => m.id === session.userMood);
  return { label: mood?.label || '', icon: '' };
}

// ==================== 专业提示词构建 ====================

export function buildAnalysisPrompt(session: SearchSession): string {
  const itemName = getItemDisplayName(session);
  const locationName = getLocationDisplayName(session);
  const activityName = getActivityDisplayName(session);
  const mood = getMoodDisplayInfo(session);

  // 计算熵值（混乱程度）
  const calculateEntropyScore = (): 'High' | 'Low' => {
    if (session.wasDistracted || session.userMood === 'stressed' || session.userMood === 'anxious') {
      return 'High';
    }
    if (session.visitedMultipleLocations) return 'High';
    return 'Low';
  };

  // 推断物理标签（物品运动特性）
  const inferPhysicsTag = (): string => {
    const size = session.itemSize;
    const category = session.itemCategory;
    
    // 圆形/球形物品 -> Roll
    if (['electronics', 'accessories'].includes(category || '') && size === 'small') {
      return 'Roll（滚动型：会滚向低点、边缘、家具底部中心）';
    }
    // 扁平物品 -> Stick
    if (['documents', 'cards'].includes(category || '') || itemName.includes('卡') || itemName.includes('票')) {
      return 'Stick（粘附型：会滑入垂直缝隙、书页/布料夹层）';
    }
    // 重物 -> Sink
    if (size === 'large' || ['keys', 'wallet'].includes(session.itemType || session.itemName || '')) {
      return 'Sink（下沉型：会陷入软表面如沙发缝隙、被埋没）';
    }
    return 'Slide（滑动型：会在平面上滑动到边缘）';
  };

  // 行为状态映射
  const getActivityState = (): string => {
    if (session.wasDistracted) return 'High-Entropy（高熵：匆忙/分心/多任务）';
    if (session.userMood === 'relaxed' || session.userMood === 'tired') return 'Low-Entropy（低熵：放松/休息）';
    if (session.userMood === 'stressed' || session.userMood === 'anxious') return 'High-Entropy（高熵：紧张/焦虑）';
    return 'Medium-Entropy（中熵：一般状态）';
  };

  const entropyScore = calculateEntropyScore();
  const physicsTag = inferPhysicsTag();

  const prompt = `# System Prompt: CogniSeek Ultimate (Production Edition)

## Role: CogniSeek AI - Global Recovery Commander
You are the central intelligence engine for a global SaaS lost item recovery platform.
Your operating mode is **"Tactical Action Compression."**
You act as a forensic expert who collapses infinite search possibilities into **3 immediate, high-probability physical actions.**

## 🛡️ The 3 Laws of Recovery (Hard Constraints)
1. **The "2-Minute Rule"**: The #1 Priority Action MUST be performable immediately (under 2 minutes). It must be a specific physical movement (e.g., "shake," "sweep," "shine light"), not just "look."
2. **Scientific Grounding**: No luck or metaphysics. Base every logic on **Object Dynamics** (Gravity/Friction), **Behavioral Psychology** (Inattentional Blindness), and **Probability**.
3. **Global & Inclusive**: Adjust for cultural context. Provide inclusive alternatives if an action requires high mobility.

---

## 📥 Input Data Stream

### User_Input
- **Item_Name**: ${itemName}
- **Item_Color**: ${session.itemColor || 'Not specified'}
- **Item_Size**: ${session.itemSize === 'small' ? 'Small (高滑落风险)' : session.itemSize === 'medium' ? 'Medium (易被遮挡)' : session.itemSize === 'large' ? 'Large (可能被误认)' : 'Unknown'}
- **Has_Sound**: No
- **Has_Case**: No
- **Time_Lost**: ${session.lossTime || session.lossTimeRange || 'Unknown'}
- **Time_Confidence**: ${session.confidence > 70 ? 'High' : session.confidence > 40 ? 'Medium' : 'Low'}
- **Activity_State**: ${getActivityState()}
- **Current_Activity**: ${activityName || 'Not specified'}
- **Mood**: ${mood.label || 'Not specified'}
- **Was_Distracted**: ${session.wasDistracted ? 'Yes' : 'No'}
- **Others_Present**: ${session.otherPeoplePresent ? 'Yes (物品可能被移动)' : 'No'}
- **Last_Location**: ${locationName || 'Not specified'}
- **Multiple_Locations**: ${session.visitedMultipleLocations ? 'Yes' : 'No'}
- **Other_Locations**: ${(session.otherVisitedLocations?.length ?? 0) > 0 ? session.otherVisitedLocations.join(', ') : 'None'}

### Search_History
- **Already_Searched**: ${session.hasSearched ? 'Yes' : 'No (刚发现丢失)'}
- **Search_Duration**: ${session.searchDuration || 'Unknown'}
- **Searched_Areas**: ${[...(session.searchedLocations || []), ...(session.searchedCustomLocations || [])].length > 0 ? [...(session.searchedLocations || []), ...(session.searchedCustomLocations || [])].join(', ') : 'None'}
- **Asked_Others**: ${session.askedOthers ? 'Yes' : 'No'}
- **Tried_FindMy**: ${session.triedFindMy ? 'Yes' : 'No'}

### System_Params (Auto-Calculated)
- **Entropy_Score**: ${entropyScore}
- **Physics_Tag**: ${physicsTag}
- **Global_Context**: Collectivist (家庭/共享空间)

---

## 🧠 Internal Reasoning Pipeline (Execute Silently)

1. **Physics Simulation**:
   - Roll: Target low points, edges, under-furniture centers
   - Stick (Flat): Target vertical gaps, between pages/fabric layers
   - Sink (Heavy): Target soft surfaces (sofa crevices), buried spots
   - Slide: Target table edges, floor perimeters

2. **Context Adjustment**:
   - If Others_Present=Yes: Increase "moved by others" probability
   - If High-Entropy: Object likely placed unconsciously in transit zones
   - If Low-Entropy: Object likely near resting position

3. **Action Selection**:
   - Select Top 3 Scenarios based on highest probability
   - Ensure #1 is "Sensory Override" (tactile/flashlight search)
   - Each action must be specific and physical

---

## 📤 Output Format (Strict JSON)

Return ONLY the following JSON format, no other text:

\`\`\`json
{
  "probability": 78,
  "probabilityLevel": "High",
  "summary": "This is a classic 'Static Concealment' case. The ${itemName} is likely stationary but fused with the background in ${locationName}.",
  "priorityAction": {
    "target": "Specific micro-location (e.g., '${locationName}沙发垫下方中心位置')",
    "action": "Specific physical movement (e.g., '趴在地上用手机闪光灯照射家具底部，同时用手臂横扫整个区域')",
    "why": "One-sentence scientific reason based on Physics_Tag: ${physicsTag}"
  },
  "predictions": [
    {
      "location": "Zone A - Most probable specific location",
      "confidence": 45,
      "reason": "Physics/Psychology based reason",
      "technique": "Specific search technique (e.g., '将书脊朝下抖动，让夹住的物品掉落')"
    },
    {
      "location": "Zone B - Second probable location",
      "confidence": 30,
      "reason": "Scientific reason",
      "technique": "Specific technique"
    },
    {
      "location": "Zone C - Context-specific (e.g., 'Ask roommate if they tidied a ${session.itemColor || ''} colored object')",
      "confidence": 20,
      "reason": "Social/contextual reason",
      "technique": "Specific approach"
    }
  ],
  "direction": {
    "primary": "NW",
    "primaryLabel": "西北方向",
    "confidence": 70,
    "description": "Based on physics simulation: ${physicsTag.split('（')[0]} objects tend to move toward..."
  },
  "behaviorAnalysis": "Psychological analysis of the user's ${getActivityState()} state. Explain how Inattentional Blindness caused the item to be placed unconsciously.",
  "environmentAnalysis": "Environmental blind spots in ${locationName}: vertical surfaces, same-color backgrounds, cluttered zones.",
  "timelineAnalysis": "Timeline reconstruction: Based on ${session.lossTime || 'unknown time'}, the item was likely deposited during [specific moment/action].",
  "checklist": [
    "⚡ PRIORITY: [The 2-minute action - specific physical movement with tool if needed]",
    "🔦 Use flashlight at ground level to catch reflections/shadows in ${locationName}",
    "👐 Tactile sweep: Run hands through surfaces instead of just looking",
    "📐 Check vertical height: Shelves and surfaces ABOVE eye level",
    "🗂️ Check concealment: Under papers, clothes, books that may have covered it",
    "🪑 Check gaps: Sofa cushions, furniture-wall gaps, drawer interiors",
    "👥 Social check: Ask anyone who entered ${locationName} if they 'tidied up'",
    "🔄 Retrace: Walk through the exact path you took when you last had ${itemName}"
  ],
  "cognitiveOverride": "Counter-intuitive psychological command: 'Stop looking for ${itemName}. Instead, look for the GLINT of ${session.itemColor || 'its surface'} / the SHAPE outline / the SHADOW it casts.'",
  "stopCondition": "If not found after completing checklist: The probability model suggests external loss. Escalation: Check trash bins → Retrace outdoor route → Post community alert.",
  "encouragement": "90% of 'lost' items are within 2 meters of where you think they are. Your ${itemName} hasn't left - it's waiting to be rediscovered. Trust the physics, use your hands not just your eyes, and you WILL find it!"
}
\`\`\`

## ⚠️ Critical Requirements
1. **probability**: Integer between 55-92
2. **probabilityLevel**: Must be one of: Very High, High, Medium, Low
3. **priorityAction**: MUST be a specific 2-minute physical action, not "look around"
4. **predictions**: Exactly 3 zones with technique for each
5. **checklist**: Exactly 8 items, first one must be the PRIORITY action
6. **cognitiveOverride**: Must be a counter-intuitive perception shift command
7. **ALL content must be personalized** to the specific item (${itemName}), location (${locationName}), and context provided

## 🌐 Language Requirement
**所有输出内容必须使用简体中文。** 包括 summary、predictions、checklist、encouragement 等所有文本字段。

Return ONLY valid JSON. No markdown formatting, no explanations.`;

  return prompt;
}

// ==================== API 调用 ====================

export async function analyzeWithAI(session: SearchSession, locale: string = 'en'): Promise<AIAnalysisResult> {
  console.log('=== 🚀 开始 AI 分析 ===');
  
  const itemName = getItemDisplayName(session, locale);
  const locationName = getLocationDisplayName(session);
  const activityName = getActivityDisplayName(session, locale);
  const mood = getMoodDisplayInfo(session);

  try {
    // ✅ 使用新的 API Route 期望的格式
    // Translate location category — step-0 stores capitalized English IDs (e.g. 'Home', 'Outdoors')
    // data.ts uses lowercase IDs (e.g. 'home', 'outdoor'). Use a direct map to avoid mismatch.
    const isZHLoc = locale === 'zh-CN';
    const sectorLabelMap: Record<string, string> = isZHLoc
      ? { Home: '家里', Work: '工作/学校', Vehicle: '交通工具', Public: '公共场所', Outdoors: '户外', Unsure: '不确定' }
      : { Home: 'Home', Work: 'Work / School', Vehicle: 'Vehicle', Public: 'Public Place', Outdoors: 'Outdoors', Unsure: 'Unsure' };

    const rawLocCat = session.lossLocationCategory || '';
    // Try direct sector map first, then fall back to locationCategories lookup (case-insensitive)
    const locCatLabel = sectorLabelMap[rawLocCat]
      || locationCategories.find(c => c.id.toLowerCase() === rawLocCat.toLowerCase())?.label
      || rawLocCat;

    // Translate sub-location IDs to display labels
    const locCatData = locationCategories.find(c =>
      c.id.toLowerCase() === rawLocCat.toLowerCase() ||
      c.id === rawLocCat
    );
    const locSubLabels = (session.lossLocationSubCategory || []).map(subId => {
      if (!locCatData) return subId;
      const sub = locCatData.subLocations.find(s => (typeof s === 'string' ? s === subId : s.id === subId));
      return typeof sub === 'string' ? sub : (sub?.label || subId);
    }).join(isZHLoc ? '、' : ', ');

    const requestBody = {
      itemType: session.itemCategory || '',
      itemName: itemName,
      itemDescription: session.itemFeatures || '',
      itemColor: session.itemColor || '',
      itemSize: session.itemSize || '',
      lastSeenLocation: locationName,
      lastSeenTime: session.lossTime || '',
      lossLocationCategory: locCatLabel,
      lossLocationSubCategory: locSubLabels,
      activity: activityName,
      mood: mood.label,
      userMood: session.userMood || '',
      userActivity: session.userActivity || '',
      searchedPlaces: [...(session.searchedLocations || []), ...(session.searchedCustomLocations || [])].join(', '),
      locale,
    };

    console.log('📤 发送请求到 API:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 API 响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API 错误:', errorData);
      throw new Error(errorData.error || 'AI 分析请求失败');
    }

    const data = await response.json();
    console.log('✅ AI 分析成功:', data);
    
    if (!data.result) {
      throw new Error('返回数据格式异常');
    }
    
    return data.result;
  } catch (error) {
    console.error('❌ AI 分析调用失败:', error);
    throw error;
  }
}

// ==================== 默认/备用结果 ====================

export function getDefaultAnalysisResult(session: SearchSession, locale: string = 'en'): AIAnalysisResult {
  const isZH = locale === 'zh-CN';
  const itemName = getItemDisplayName(session);
  const locationName = getLocationDisplayName(session);
  const itemColor = session.itemColor || (isZH ? '物品' : 'item');

  if (isZH) {
    return {
      probability: 78,
      probabilityLevel: 'High',
      summary: `这是一个典型的「静态隐蔽」案例。你的 ${itemName} 可能没有被移动，而是与 ${locationName} 的背景融为一体了。`,
      priorityAction: {
        target: `${locationName}的家具底部和边缘区域`,
        action: `趴在地上，用手机闪光灯照射${locationName}所有家具底部，同时用手臂横扫整个区域。这个动作能在2分钟内覆盖60%的高概率藏匿点。`,
        why: `根据物理学原理，小型物品在重力作用下会滚落或滑落到低点。视觉搜索往往忽略地面以下的空间，但触觉搜索不会。`,
      },
      predictions: [
        {
          location: `${locationName}的家具缝隙或底部`,
          confidence: 45,
          reason: '根据物理动力学，物品在无意识放置后最可能滑落或滚落到低点',
          technique: '趴下用手机闪光灯扫描所有家具底部，寻找反光或阴影',
        },
        {
          location: `${locationName}中被其他物品覆盖的位置`,
          confidence: 30,
          reason: '无意识盲视效应：大脑会自动过滤「不应该在那里」的物品',
          technique: '将桌面/台面上的所有物品逐一移开，而不是仅用眼睛扫视',
        },
        {
          location: '被同住者无意中移动的位置',
          confidence: 20,
          reason: '共享空间中，物品经常因整理行为被重新放置',
          technique: `直接询问：「你有没有看到/移动过一个${itemColor}的${itemName}？」`,
        },
      ],
      direction: {
        primary: 'NW',
        primaryLabel: '西北方向',
        confidence: 70,
        description: `基于物理模拟：从你最后确认位置出发，物品最可能向重力低点或你的惯用手方向移动。优先搜索该方向的收纳空间和缝隙。`,
      },
      behaviorAnalysis: `在你当时的活动状态下，大脑处于「认知卸载」模式。${itemName}很可能被无意识地放置在你移动路径上的某个停留点。这不是遗忘，而是大脑为了节省认知资源而进行的自动化行为。`,
      environmentAnalysis: `${locationName}存在多个典型的视觉盲区：1) 与背景颜色相近的区域（色彩融合）；2) 视线水平以上或以下的空间（垂直盲区）；3) 物品堆叠区域的底层（遮挡盲区）。`,
      timelineAnalysis: `根据时间线推测，${itemName}最可能在你进行其他活动的过渡时刻被放下。当注意力从物品转移到新任务时，手部会自动完成放置动作，但大脑不会记录具体位置。`,
      basicSearchPoints: [
        `${locationName}的表面和可见区域`,
        '桌面、台面等最后使用物品的区域',
        '地面开阔区域（掉落的第一反应位置）',
      ],
      checklist: [
        `⚡ 趴在地上用手机闪光灯扫描${locationName}所有家具底部`,
        `🔦 在${locationName}用闪光灯低角度照射，寻找${itemName}的反光或投射阴影`,
        `👐 触觉搜索：用手扫过所有台面和缝隙，而不是仅用眼睛看`,
        '📐 检查视线以上：架子顶部、柜子上方、高处置物台',
        '🗂️ 移开遮挡物：逐一移开桌上的纸张、衣物、书本',
        '🪑 检查缝隙：沙发垫下、家具与墙壁的夹缝、抽屉内部',
        '👥 社交确认：询问同住者或到访者是否移动过该物品',
        `🔄 路径重走：从你最后使用${itemName}的地点，重新走一遍当时的路线`,
      ],
      cognitiveOverride: `停止寻找「${itemName}」本身。改为寻找：${itemColor}的反光/光泽、${itemName}的轮廓形状、或它投射的阴影。让眼睛捕捉异常，而不是匹配预期。`,
      stopCondition: `如果完成以上所有检查仍未找到：概率模型提示外部丢失可能性增加。升级方案：1) 检查所有垃圾桶 → 2) 回溯户外路线 → 3) 发布社区寻物信息`,
      encouragement: `90%的「丢失」物品都在你认为的2米范围内。你的${itemName}没有离开——它正在等待被重新发现。相信物理学，用手而不是眼睛去找，你一定能找到它！`,
    };
  }

  return {
    probability: 78,
    probabilityLevel: 'High',
    summary: `This is a classic 'Static Concealment' case. Your ${itemName} is likely stationary but has blended into the background in ${locationName}.`,
    priorityAction: {
      target: `Bottom and edges of furniture in ${locationName}`,
      action: `Get down on the floor. Use your phone's flashlight parallel to the ground to sweep all furniture bases in ${locationName}, while using your arm to physically sweep the area. This covers 60% of high-probability hiding spots in under 2 minutes.`,
      why: `By physics, small objects roll or slide to the lowest point under gravity. Visual searches typically miss sub-floor space; tactile sweeps do not.`,
    },
    predictions: [
      {
        location: `Under or between furniture in ${locationName}`,
        confidence: 45,
        reason: 'Physics dynamics: unconsciously placed items most likely slide or roll to the lowest point',
        technique: 'Get on the floor and use a flashlight to scan all furniture bases for reflections or shadows',
      },
      {
        location: `Buried under other items in ${locationName}`,
        confidence: 30,
        reason: 'Inattentional blindness: the brain auto-filters objects that "shouldn\'t be there"',
        technique: 'Remove items from surfaces one by one instead of scanning visually',
      },
      {
        location: 'Moved by another household member',
        confidence: 20,
        reason: 'In shared spaces, items are frequently relocated during tidying',
        technique: `Ask directly: "Have you seen or moved a ${itemColor} ${itemName}?"`,
      },
    ],
    direction: {
      primary: 'NW',
      primaryLabel: 'Northwest',
      confidence: 70,
      description: `Physics simulation: from your last confirmed position, the item most likely moved toward the gravity low point or your dominant hand direction. Prioritize storage spaces and gaps in that direction.`,
    },
    behaviorAnalysis: `During your activity at the time, your brain was in "cognitive offload" mode. The ${itemName} was likely placed unconsciously at a pause point along your movement path. This isn't forgetting — it's your brain automating placement to conserve cognitive resources.`,
    environmentAnalysis: `${locationName} contains several typical visual blind spots: 1) areas that match the item's color (color camouflage); 2) spaces above or below eye level (vertical blind zones); 3) the bottom layer of stacked items (occlusion blind zones).`,
    timelineAnalysis: `Based on the timeline, the ${itemName} was most likely set down during a transition between activities. When attention shifts from the item to a new task, the hand completes the placement automatically — but the brain doesn't log the exact location.`,
    basicSearchPoints: [
      `Visible surfaces in ${locationName}`,
      'Tables and countertops (last-used areas)',
      'Open floor areas (first instinct drop zones)',
    ],
    checklist: [
      `⚡ PRIORITY: Get on the floor and sweep all furniture bases in ${locationName} with a flashlight`,
      `🔦 Use your phone flashlight at a low angle in ${locationName} to catch reflections from the ${itemName}`,
      `👐 Tactile sweep: run your hand across all surfaces and gaps instead of just looking`,
      '📐 Check above eye level: tops of shelves, cabinet surfaces, high ledges',
      '🗂️ Remove obstacles: move papers, clothing, books off surfaces one by one',
      '🪑 Check gaps: under sofa cushions, between furniture and walls, inside drawers',
      '👥 Social check: ask housemates or recent visitors if they moved it',
      `🔄 Retrace your steps: walk back from the last place you used the ${itemName}`,
    ],
    cognitiveOverride: `Stop looking for the ${itemName} itself. Instead look for: the ${itemColor} glint/sheen, the outline of the ${itemName}'s shape, or the shadow it casts. Train your eyes to catch anomalies, not match expectations.`,
    stopCondition: `If all checks above fail: the probability model suggests external displacement is increasingly likely. Escalation: 1) Check all bins → 2) Retrace outdoor route → 3) Post a community lost item notice`,
    encouragement: `90% of "lost" items are within 2 meters of where you think they are. Your ${itemName} hasn't gone far — it's waiting to be rediscovered. Trust the physics, use your hands instead of your eyes, and you'll find it!`,
  };
}
