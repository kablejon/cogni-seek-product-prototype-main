import { SearchSession } from './types';
import {
  itemCategories,
  locationCategories,
  moodOptions
} from './data';

export interface AIPredictionPoint {
  location: string;
  confidence: number;
  reason: string;
  technique: string;
}

export interface AIAnalysisResult {
  probability: number;
  probabilityLevel: string;
  summary: string;
  priorityAction: {
    target: string;
    action: string;
    why: string;
  };
  behaviorAnalysis: string;
  environmentAnalysis: string;
  basicSearchPoints: string[];
  checklist: string[];
  cognitiveOverride: string;
  encouragement: string;
  safetyAlert?: string | null;
}

export interface AIPremiumResult {
  predictions: AIPredictionPoint[];
  checklist: string[];
  timelineAnalysis: string;
  stopCondition: string;
}

export interface AnalyzeResponsePayload {
  reportId: string;
  result: AIAnalysisResult;
}

function getItemDisplayName(session: SearchSession, locale?: string): string {
  if (session.itemName) return session.itemName;
  const category = itemCategories.find(c => c.id === session.itemCategory);
  const item = category?.items.find(i => i.id === session.itemCategory);
  return item?.label || (locale === 'en' ? 'item' : '物品');
}

function getLocationDisplayName(session: SearchSession): string {
  if (session.lossLocationCustom) return session.lossLocationCustom;
  if (session.lossLocation) return session.lossLocation;
  const category = locationCategories.find(c => c.id === session.lossLocationCategory);
  return category?.label || category?.name || session.lossLocationCategory || 'Unknown location';
}

function getActivityDisplayName(session: SearchSession, locale?: string): string {
  return session.userActivity || (locale === 'en' ? 'daily activity' : '日常活动');
}

function getMoodDisplayInfo(session: SearchSession): { label: string; icon: string } {
  if (session.userMood) return { label: session.userMood, icon: '🧠' };
  const mood = moodOptions.find(m => m.id === session.userMood);
  return { label: mood?.label || '', icon: '' };
}

export async function analyzeWithAI(session: SearchSession, locale: string = 'en'): Promise<AnalyzeResponsePayload> {
  const itemName = getItemDisplayName(session, locale);
  const locationName = getLocationDisplayName(session);
  const activityName = getActivityDisplayName(session, locale);
  const mood = getMoodDisplayInfo(session);

  const isZHLoc = locale === 'zh-CN';
  const sectorLabelMap: Record<string, string> = isZHLoc
    ? { Home: '家里', Work: '工作/学校', Vehicle: '交通工具', Public: '公共场所', Outdoors: '户外', Unsure: '不确定' }
    : { Home: 'Home', Work: 'Work / School', Vehicle: 'Vehicle', Public: 'Public Place', Outdoors: 'Outdoors', Unsure: 'Unsure' };

  const rawLocCat = session.lossLocationCategory || '';
  const locCatLabel = sectorLabelMap[rawLocCat]
    || locationCategories.find(c => c.id.toLowerCase() === rawLocCat.toLowerCase())?.label
    || rawLocCat;

  const locCatData = locationCategories.find(c =>
    c.id.toLowerCase() === rawLocCat.toLowerCase() || c.id === rawLocCat
  );

  const locSubLabels = (session.lossLocationSubCategory || []).map(subId => {
    if (!locCatData) return subId;
    const sub = locCatData.subLocations.find(s => (typeof s === 'string' ? s === subId : s.id === subId));
    return typeof sub === 'string' ? sub : (sub?.label || subId);
  }).join(isZHLoc ? '、' : ', ');

  const requestBody = {
    itemType: session.itemCategory || '',
    itemName,
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
    session,
  };

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'AI 分析请求失败');
  }

  const data = await response.json();
  if (!data.result || !data.reportId) {
    throw new Error('返回数据格式异常');
  }

  return {
    reportId: data.reportId,
    result: data.result as AIAnalysisResult,
  };
}

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
      behaviorAnalysis: `在你当时的活动状态下，大脑处于「认知卸载」模式。${itemName}很可能被无意识地放置在你移动路径上的某个停留点。这不是遗忘，而是大脑为了节省认知资源而进行的自动化行为。`,
      environmentAnalysis: `${locationName}存在多个典型的视觉盲区：1) 与背景颜色相近的区域（色彩融合）；2) 视线水平以上或以下的空间（垂直盲区）；3) 物品堆叠区域的底层（遮挡盲区）。`,
      basicSearchPoints: [
        `${locationName}的表面和可见区域`,
        '桌面、台面等最后使用物品的区域',
        '地面开阔区域（掉落的第一反应位置）',
      ],
      checklist: [
        `⚡ 趴在地上用手机闪光灯扫描${locationName}所有家具底部`,
      ],
      cognitiveOverride: `停止寻找「${itemName}」本身。改为寻找：${itemColor}的反光/光泽、${itemName}的轮廓形状、或它投射的阴影。让眼睛捕捉异常，而不是匹配预期。`,
      encouragement: `90%的「丢失」物品都在你认为的2米范围内。你的${itemName}没有离开——它正在等待被重新发现。相信物理学，用手而不是眼睛去找，你一定能找到它！`,
      safetyAlert: null,
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
    behaviorAnalysis: `In your activity state, your brain likely entered cognitive offloading mode. ${itemName} was probably placed unconsciously at a pause point in your movement path. This is not forgetfulness — it's automated behavior intended to conserve attention.`,
    environmentAnalysis: `${locationName} contains multiple classic visual blind spots: 1) same-color background blending; 2) above-eye-level and below-eye-level zones; 3) lower layers of clutter stacks where items get visually buried.`,
    basicSearchPoints: [
      `Visible surfaces and open areas in ${locationName}`,
      'Desks, counters, and recently used surface zones',
      'Open floor area where a dropped item would first be noticed',
    ],
    checklist: [
      `⚡ Use your phone flashlight to scan under all furniture in ${locationName}`,
    ],
    cognitiveOverride: `Stop looking for the ${itemName} itself. Instead, look for the reflection/glint of its ${itemColor} surface, its outline, or the shadow it casts. Train your eyes to detect anomalies, not expectations.`,
    encouragement: `90% of “lost” items are within 2 meters of where you think they are. Your ${itemName} hasn't left — it's waiting to be rediscovered. Trust the physics, use your hands and not just your eyes, and you will find it.`,
    safetyAlert: null,
  };
}
