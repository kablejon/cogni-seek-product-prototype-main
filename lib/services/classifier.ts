// lib/services/classifier.ts
// 万物分类器逻辑 - 负责"万物分类"的核心逻辑

export interface ClassificationResult {
  targetClass: 'Living_Human' | 'Living_Pet' | 'Inanimate_Object';
  physicsTag: 'Roll' | 'Slide' | 'Sink' | 'Static' | 'Flight' | 'Wander' | 'Denning';
  safetyWarning: boolean;
}

export function classifySearchTarget(inputText: string): ClassificationResult {
  const lowerItem = inputText.toLowerCase();
  
  // 默认结果
  const result: ClassificationResult = {
    targetClass: 'Inanimate_Object',
    physicsTag: 'Static',
    safetyWarning: false
  };

  // --- A. 活物判断 (优先级最高) ---
  // itemType='people' 直接映射，无需关键词匹配
  if (lowerItem.startsWith('people ') || lowerItem.includes(' people ')) {
    result.targetClass = 'Living_Human';
    result.physicsTag = 'Wander';
    result.safetyWarning = true;
  }
  else if (/(child|kid|baby|toddler|son|daughter|grandpa|grandma|grandfather|grandmother|elderly|elder|senior|mom|dad|person|human|male|female|man|woman|patient|幼童|小孩|婴儿|儿子|女儿|爷爷|奶奶|外公|外婆|姥爷|姥姥|老人|老年|长辈|妈妈|爸爸|父亲|母亲|男性|女性|患者|病人|家人|亲属|丈夫|妻子|孩子|小孩|儿童|老头|老太)/i.test(lowerItem)) {
    result.targetClass = 'Living_Human';
    result.physicsTag = 'Wander';
    result.safetyWarning = true;
  } 
  else if (/(dog|cat|pet|bird|hamster|puppy|kitten|rabbit|turtle|animal|狗|猫|宠物|鸟|仓鼠|小狗|小猫|兔子|乌龟|动物|金毛|泰迪|柯基|哈士奇|布偶|英短|波斯猫)/i.test(lowerItem)) {
    result.targetClass = 'Living_Pet';
    
    // 细分宠物行为模式
    if (/(cat|kitten|hamster|snake|猫|小猫|仓鼠|蛇)/i.test(lowerItem)) {
      result.physicsTag = 'Denning'; // 躲藏型
    } else if (/(bird|parrot|鸟|鹦鹉)/i.test(lowerItem)) {
      result.physicsTag = 'Flight'; // 飞行型
    } else {
      result.physicsTag = 'Wander'; // 奔跑型
    }
  } 
  // --- B. 死物物理判断 ---
  else {
    result.targetClass = 'Inanimate_Object';
    
    // 1. 滚动体 (Roll)
    if (/(ring|lipstick|pen|pencil|coin|ball|marble|bottle|battery|earbud|戒指|口红|笔|硬币|球|弹珠|电池|耳机)/i.test(lowerItem)) {
      result.physicsTag = 'Roll';
    } 
    // 2. 滑动/扁平体 (Slide)
    else if (/(card|id|paper|ticket|cash|passport|sticker|photo|卡|身份证|纸|票|钱|护照|贴纸|照片)/i.test(lowerItem)) {
      result.physicsTag = 'Slide';
    } 
    // 3. 重力体/下沉体 (Sink)
    else if (/(phone|wallet|keys|remote|watch|jewelry|手机|钱包|钥匙|遥控|手表|首饰)/i.test(lowerItem)) {
      result.physicsTag = 'Sink';
    }
    // 4. 默认 (Static)
    else {
      result.physicsTag = 'Static';
    }
  }

  return result;
}

export function determineEntropy(mood: string | undefined): 'High' | 'Low' {
  // High-entropy mood IDs stored in Zustand (from step-4 MOOD_OPTIONS)
  const highEntropyIds = ['angry', 'anxious', 'tipsy', 'excited', 'confused', 'rushed', 'irritated', 'distracted'];
  if (mood && highEntropyIds.includes(mood.toLowerCase())) {
    return 'High';
  }
  return 'Low';
}





