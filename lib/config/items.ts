// lib/config/items.ts

export interface ItemConfig {
  tags: string[]       // 中文标签
  tagsEn: string[]     // 英文标签
  hideSize: boolean
  hideColor: boolean
  defaultSize?: string
}

export const ITEM_MAPPING_CONFIG: Record<string, ItemConfig> = {
  // 1. 日常必需品
  'keys': {
    tags: ['一大串', '带门禁卡', '有公仔挂件', '车钥匙', '单把钥匙'],
    tagsEn: ['Big bunch', 'With access card', 'Has keychain', 'Car key', 'Single key'],
    hideSize: true, hideColor: false, defaultSize: 'small'
  },
  'wallet': {
    tags: ['长款', '短款折叠', '鼓鼓的', '带拉链', '名片夹'],
    tagsEn: ['Long wallet', 'Bi-fold', 'Bulging/Full', 'With zipper', 'Card holder'],
    hideSize: true, hideColor: false, defaultSize: 'small'
  },
  'glasses': {
    tags: ['有眼镜盒', '镜腿折断', '金属框', '黑框', '隐形眼镜'],
    tagsEn: ['With case', 'Broken arm', 'Metal frame', 'Black frame', 'Contact lenses'],
    hideSize: true, hideColor: false, defaultSize: 'small'
  },
  'watch': {
    tags: ['智能手表', '机械表', '表带断裂', '没电了', '屏幕碎了'],
    tagsEn: ['Smartwatch', 'Mechanical watch', 'Broken strap', 'Dead battery', 'Cracked screen'],
    hideSize: true, hideColor: false, defaultSize: 'small'
  },
  'umbrella': {
    tags: ['长柄伞', '折叠伞', '透明伞', '便利店伞', '很旧'],
    tagsEn: ['Long handle', 'Folding', 'Transparent', 'Convenience store type', 'Very old'],
    hideSize: true, hideColor: false, defaultSize: 'medium'
  },
  'daily_other': {
    tags: ['刚买的', '借来的', '有特殊包装'],
    tagsEn: ['Just bought', 'Borrowed', 'Special packaging'],
    hideSize: false, hideColor: false,
  },

  // 2. 数码产品
  'phone': {
    tags: ['🔕 静音/震动', '🔋 没电关机', '💥 屏幕碎裂', '📲 戴手机壳'],
    tagsEn: ['🔕 Silent/Vibrate', '🔋 Dead battery', '💥 Cracked screen', '📲 Has phone case'],
    hideSize: true, hideColor: false, defaultSize: 'medium'
  },
  'airpods': {
    tags: ['🎧 头戴式', '💊 仅耳机仓', '👂 仅左耳', '👂 仅右耳', '带保护套'],
    tagsEn: ['🎧 Over-ear', '💊 Case only', '👂 Left ear only', '👂 Right ear only', 'With cover'],
    hideSize: true, hideColor: false, defaultSize: 'small'
  },
  'tablet': {
    tags: ['带键盘套', '有贴纸', '屏幕碎裂', '手写笔也在'],
    tagsEn: ['With keyboard case', 'Has stickers', 'Cracked screen', 'Stylus included'],
    hideSize: true, hideColor: false, defaultSize: 'medium'
  },
  'laptop': {
    tags: ['装在内胆包', '贴满贴纸', '电源线也在', '休眠状态'],
    tagsEn: ['In laptop sleeve', 'Full of stickers', 'Charger included', 'Sleep mode'],
    hideSize: true, hideColor: false, defaultSize: 'large'
  },
  'powerbank': {
    tags: ['自带线', '很重/大砖头', '磁吸式', '借用共享的'],
    tagsEn: ['Built-in cable', 'Very heavy/large', 'MagSafe type', 'Shared/rental'],
    hideSize: true, hideColor: false, defaultSize: 'medium'
  },
  'cable': {
    tags: ['一团乱', '带插头', '很长', '原装白色'],
    tagsEn: ['Tangled up', 'With plug', 'Very long', 'Original white'],
    hideSize: true, hideColor: false, defaultSize: 'small'
  },
  'usb': {
    tags: ['带盖子', '挂在绳上', '有很多重要数据', '金属外壳'],
    tagsEn: ['With cap', 'On a lanyard', 'Important data inside', 'Metal case'],
    hideSize: true, hideColor: false, defaultSize: 'small'
  },
  'remote': {
    tags: ['电视遥控', '空调遥控', '车库遥控', '按键失灵'],
    tagsEn: ['TV remote', 'AC remote', 'Garage remote', 'Faulty buttons'],
    hideSize: true, hideColor: false, defaultSize: 'small'
  },
  'camera': {
    tags: ['单反/微单', '卡片机', '镜头盖没盖', '在相机包里'],
    tagsEn: ['DSLR/Mirrorless', 'Compact camera', 'Lens cap off', 'In camera bag'],
    hideSize: true, hideColor: false, defaultSize: 'medium'
  },
  'digital_other': {
    tags: ['有指示灯', '正在运行', '刚买的'],
    tagsEn: ['Has indicator light', 'Still running', 'Just bought'],
    hideSize: false, hideColor: false,
  },

  // 3. 证件文件
  'id_card': {
    tags: ['💳 有卡套', '👜 在钱包里', '🗂 和其他证件一起', '临时身份证'],
    tagsEn: ['💳 With card sleeve', '👜 In wallet', '🗂 With other IDs', 'Temporary ID'],
    hideSize: true, hideColor: true, defaultSize: 'card'
  },
  'passport': {
    tags: ['📕 带护照夹', '🎫 夹着机票', '很旧'],
    tagsEn: ['📕 With passport holder', '🎫 Ticket inside', 'Very old'],
    hideSize: true, hideColor: true, defaultSize: 'booklet'
  },
  'driver_license': {
    tags: ['⚫️ 黑色皮套', '📑 副页也在', '即将过期'],
    tagsEn: ['⚫️ Black leather case', '📑 Appendix included', 'Expiring soon'],
    hideSize: true, hideColor: true, defaultSize: 'booklet'
  },
  'bank_card': {
    tags: ['💳 信用卡', '🏦 储蓄卡', '装在卡套里'],
    tagsEn: ['💳 Credit card', '🏦 Debit card', 'In card sleeve'],
    hideSize: true, hideColor: false, defaultSize: 'card'
  },
  'membership_card': {
    tags: ['🔑 蓝色小扣', '💳 白卡', '带有贴纸', '挂在手机上'],
    tagsEn: ['🔑 Blue keychain', '💳 White card', 'Has sticker', 'Attached to phone'],
    hideSize: true, hideColor: false, defaultSize: 'small'
  },
  'important_docs': {
    tags: ['📄 A4纸', '📁 在文件夹里', '🟤 牛皮纸袋', '多页订书钉'],
    tagsEn: ['📄 A4 paper', '📁 In folder', '🟤 Kraft envelope', 'Stapled multiple pages'],
    hideSize: true, hideColor: true, defaultSize: 'large'
  },
  'docs_other': {
    tags: ['带照片', '塑封', '公章'],
    tagsEn: ['With photo', 'Laminated', 'Official seal'],
    hideSize: false, hideColor: false,
  },

  // 4. 贵重物品
  'ring': {
    tags: ['💍 钻戒', '🟡 黄金', '⚪️ 铂金/银', '在首饰盒里'],
    tagsEn: ['💍 Diamond ring', '🟡 Gold', '⚪️ Platinum/Silver', 'In jewelry box'],
    hideSize: true, hideColor: false, defaultSize: 'tiny'
  },
  'necklace': {
    tags: ['打结了', '吊坠很大', '断裂', '很细'],
    tagsEn: ['Tangled', 'Large pendant', 'Broken', 'Very thin chain'],
    hideSize: true, hideColor: false, defaultSize: 'small'
  },
  'earrings': {
    tags: ['只丢了一只', '长款耳线', '耳钉'],
    tagsEn: ['Only one missing', 'Long drop earring', 'Stud earring'],
    hideSize: true, hideColor: false, defaultSize: 'tiny'
  },
  'bracelet': {
    tags: ['珠串', '玉镯', '金属链', '很松容易掉'],
    tagsEn: ['Beaded', 'Jade bangle', 'Metal chain', 'Loose/falls off easily'],
    hideSize: true, hideColor: false, defaultSize: 'small'
  },
  'cash': {
    tags: ['🧧 在红包里', '✉️ 在信封里', '💵 一整沓', '散钱'],
    tagsEn: ['🧧 In red envelope', '✉️ In envelope', '💵 A whole stack', 'Loose change'],
    hideSize: true, hideColor: true, defaultSize: 'small'
  },
  'valuables_other': {
    tags: ['有证书', '祖传', '易碎'],
    tagsEn: ['Has certificate', 'Heirloom', 'Fragile'],
    hideSize: false, hideColor: false,
  },

  // 5. 宠物
  'cat': {
    tags: ['🔔 戴项圈', '🏠 室内猫(怕人)', '🍖 贪吃', '🤕 生病/受伤'],
    tagsEn: ['🔔 Wearing collar', '🏠 Indoor cat (shy)', '🍖 Food motivated', '🤕 Sick/Injured'],
    hideSize: true, hideColor: false, defaultSize: 'dynamic'
  },
  'dog': {
    tags: ['🐕 戴牵引绳', '🔊 叫名字有反应', '🐶 幼犬', '👵 老年犬'],
    tagsEn: ['🐕 On leash', '🔊 Responds to name', '🐶 Puppy', '👵 Senior dog'],
    hideSize: true, hideColor: false, defaultSize: 'dynamic'
  },
  'bird': {
    tags: ['🦜 会说话', '🪶 剪了羽', '笼子一起丢'],
    tagsEn: ['🦜 Can talk', '🪶 Wing clipped', 'Lost with cage'],
    hideSize: true, hideColor: false, defaultSize: 'small'
  },
  'hamster': {
    tags: ['跑得很快', '胆小', '在笼子里'],
    tagsEn: ['Runs very fast', 'Timid', 'In cage'],
    hideSize: true, hideColor: false, defaultSize: 'small'
  },
  'pets_other': {
    tags: ['冷血动物', '有毒', '需要特殊环境'],
    tagsEn: ['Cold-blooded animal', 'Venomous', 'Needs special environment'],
    hideSize: false, hideColor: false,
  },

  // 6. 其他物品
  'bag': {
    tags: ['👜 拉链没拉', '🎒 鼓鼓的', '🛍 购物纸袋', '帆布袋'],
    tagsEn: ['👜 Zipper open', '🎒 Bulging/Heavy', '🛍 Paper shopping bag', 'Canvas bag'],
    hideSize: true, hideColor: false, defaultSize: 'large'
  },
  'clothes': {
    tags: ['🧥 外套', '🧣 围巾/帽子', '👕 刚脱下的', '脏衣物'],
    tagsEn: ['🧥 Outer jacket', '🧣 Scarf/Hat', '👕 Just taken off', 'Dirty clothes'],
    hideSize: true, hideColor: false, defaultSize: 'medium'
  },
  'medicine': {
    tags: ['💊 药瓶', '📦 药盒', '急救药', '袋装'],
    tagsEn: ['💊 Pill bottle', '📦 Medicine box', 'Emergency medicine', 'Packet form'],
    hideSize: true, hideColor: true, defaultSize: 'small'
  },
  'toys': {
    tags: ['🧸 毛绒公仔', '🏎 模型', '很大', '零件散落'],
    tagsEn: ['🧸 Stuffed animal', '🏎 Model/Figure', 'Very large', 'Parts scattered'],
    hideSize: false, hideColor: false,
  },
  'book': {
    tags: ['📚 厚书', '📖 杂志', '借书馆的', '精装'],
    tagsEn: ['📚 Thick book', '📖 Magazine', 'Library book', 'Hardcover'],
    hideSize: true, hideColor: false, defaultSize: 'medium'
  },

  // 默认配置
  'completely_other': {
    tags: ['刚买的', '借来的', '有特殊包装', '易碎', '液体'],
    tagsEn: ['Just bought', 'Borrowed', 'Special packaging', 'Fragile', 'Liquid'],
    hideSize: false, hideColor: false,
  }
}
