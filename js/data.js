/* =========================================================
   VAR Simulator：裁判压力室 — 回合数据
   所有回合数据集中在 events 数组中，方便修改。
   每个 event 包含事件文本与 scene 绘制配置。
   ========================================================= */

// ---------- 倒计时时长（秒） ----------
const ROUND_TIME = 15;

// ---------- 回合数据（10 个） ----------
const events = [
  {
    id: 1,
    title: "直塞破门的诱惑",
    description: "前锋接到中场直塞后单刀破门，边裁没有举旗，全场欢呼。但他启动时，明显比最后一名防守球员更靠近球门。",
    correctAnswer: "越位",
    explanation: "越位规则：队友传球的瞬间，若进攻球员比倒数第二名防守球员更靠近球门线，即处于越位位置并参与进攻，应判越位，进球无效。",
    crowdReaction: "球迷：\"这都越位了？我奶奶站这儿都看出来！\"",
    coachReaction: "防守方教练疯狂鼓掌：\"VAR 终于干了件人事！\"",
    mediaHeadline: "《越位半条街，VAR 毫不留情》",
    linesmanThought: "边裁内心：\"我其实看见他越位了，但当时正好眨了下眼，之后就不好意思举旗了。\"",
    controversyImpact: 2,
    scene: {
      offsideLine: 340,
      ball: { x1: 250, y1: 265, x2: 430, y2: 210 },
      attacker: { x1: 420, y1: 205, x2: 565, y2: 200 },
      players: [
        { type: "def", x: 340, y: 195 },
        { type: "def", x: 340, y: 270 },
        { type: "att", x: 235, y: 270 },
        { type: "gk", x: 612, y: 200 }
      ]
    }
  },
  {
    id: 2,
    title: "先脚后球的滑铲",
    description: "防守球员飞身滑铲，先重重踢到进攻球员的支撑脚，皮球才弹出。进攻球员痛苦倒地。",
    correctAnswer: "犯规",
    explanation: "判罚关键在接触顺序：先踢到人后碰到球，属危险动作，应判犯规，禁区内判点球。",
    crowdReaction: "球迷：\"那脚铲得比我上班打卡还准时！\"",
    coachReaction: "丢球方教练拍桌：\"这要是红牌我都认！\"",
    mediaHeadline: "《铲球先到脚，裁判没得选》",
    linesmanThought: "边裁内心：\"铲球那一瞬间我正好看向了角旗区，完美错过全场最佳镜头。\"",
    controversyImpact: 3,
    scene: {
      collision: { x: 432, y: 203, at: 0.5, kind: "foul" },
      ball: { x1: 360, y1: 198, x2: 430, y2: 202 },
      attacker: { x1: 360, y1: 205, x2: 438, y2: 208 },
      players: [
        { type: "def", x: 470, y: 205, slideTo: { x: 436, y: 206 } },
        { type: "def", x: 340, y: 250 },
        { type: "gk", x: 612, y: 200 }
      ]
    }
  },
  {
    id: 3,
    title: "张开的手臂",
    description: "禁区内混战，防守球员手臂高高张开，像在指挥交通。足球结结实实打在他的手臂上。",
    correctAnswer: "手球",
    explanation: "手臂离开身体自然范围、不自然扩大防守面积，球打手即判手球，禁区内判点球。",
    crowdReaction: "球迷：\"他是在守门，还是在拦出租车？\"",
    coachReaction: "防守方教练捂脸：\"能不能把手放口袋里踢球？\"",
    mediaHeadline: "《手臂比球门还宽，点球没商量》",
    linesmanThought: "边裁内心：\"我确实看到他张手了，但当时以为他在跟队友打招呼说'这边这边'。\"",
    controversyImpact: 8,
    scene: {
      highlight: { x: 548, y: 184, label: "手臂" },
      ball: { x1: 400, y1: 200, x2: 545, y2: 195 },
      attacker: { x1: 395, y1: 205, x2: 430, y2: 205 },
      players: [
        { type: "def", x: 560, y: 205 },
        { type: "def", x: 500, y: 250 },
        { type: "gk", x: 612, y: 200 }
      ]
    }
  },
  {
    id: 4,
    title: "毫厘之间的平行",
    description: "前锋接球时与最后一名防守球员几乎完全平行，随后冷静推射破门。全场屏住呼吸等待 VAR。",
    correctAnswer: "进球有效",
    explanation: "平行即不越位。进攻球员与倒数第二名防守球员处于同一水平线时不构成越位，进球有效。",
    crowdReaction: "球迷：\"这平行线画得比我人生规划还准！\"",
    coachReaction: "进攻方教练竖大拇指：\"VAR 这次眼神不错。\"",
    mediaHeadline: "《平行就是平行，毫米级也认》",
    linesmanThought: "边裁内心：\"这个我看得清清楚楚，平行！平行！我敢用人格担保……大概。\"",
    controversyImpact: 5,
    scene: {
      offsideLine: 360,
      ball: { x1: 270, y1: 250, x2: 365, y2: 205 },
      attacker: { x1: 360, y1: 205, x2: 590, y2: 200 },
      players: [
        { type: "def", x: 360, y: 200 },
        { type: "def", x: 360, y: 280 },
        { type: "att", x: 255, y: 250 },
        { type: "gk", x: 612, y: 200 }
      ]
    }
  },
  {
    id: 5,
    title: "撞翻守门员",
    description: "守门员已经双手将球抱住，进攻球员却全速冲来将其撞翻，球脱手滚入网中。",
    correctAnswer: "犯规",
    explanation: "守门员控球时受规则保护，冲撞已控球的守门员属犯规，进球无效并判犯规。",
    crowdReaction: "球迷：\"他是来踢球，还是来相扑的？\"",
    coachReaction: "门将教练怒吼：\"我家门将差点飞出球场！\"",
    mediaHeadline: "《门将变道具，进球被吹》",
    linesmanThought: "边裁内心：\"门将抱球了？我以为他脱手了，差点吹进球有效，幸好没举旗。\"",
    controversyImpact: 4,
    scene: {
      collision: { x: 602, y: 200, at: 0.55, kind: "foul" },
      ball: { x1: 460, y1: 195, x2: 612, y2: 195 },
      attacker: { x1: 460, y1: 205, x2: 600, y2: 205 },
      players: [
        { type: "gk", x: 612, y: 200 },
        { type: "def", x: 490, y: 230 }
      ]
    }
  },
  {
    id: 6,
    title: "回传失误的礼物",
    description: "前锋原本站在越位位置，但防守球员主动回传失误，球直接送到前锋脚下，他笑纳大礼破门。",
    correctAnswer: "进球有效",
    explanation: "若防守球员主动触球（回传或解围失误）将球送到越位位置的进攻球员脚下，不构成越位犯规，进球有效。",
    crowdReaction: "球迷：\"这助攻比我们前锋还到位！\"",
    coachReaction: "防守方教练瘫坐：\"这锅我得背到退休。\"",
    mediaHeadline: "《自家回传送礼，VAR 也不背锅》",
    linesmanThought: "边裁内心：\"越位是越位了，但那球是防守球员自己送的，关我什么事，我举旗也没用。\"",
    controversyImpact: 10,
    scene: {
      offsideLine: 400,
      ball: { x1: 402, y1: 198, x2: 450, y2: 202 },
      attacker: { x1: 450, y1: 205, x2: 590, y2: 200 },
      players: [
        { type: "def", x: 400, y: 205 },
        { type: "def", x: 380, y: 260 },
        { type: "att", x: 300, y: 250 },
        { type: "gk", x: 612, y: 200 }
      ]
    }
  },
  {
    id: 7,
    title: "肩膀不是手",
    description: "一脚射门击中防守球员肩膀后变线弹入球门，防守方疯狂投诉手球，要求吹掉进球。",
    correctAnswer: "进球有效",
    explanation: "肩膀属合法触球部位，肩部以下手臂才判手球。击中肩膀不构成手球，进球有效。",
    crowdReaction: "球迷：\"肩膀肩膀，又不是手肘！\"",
    coachReaction: "防守方教练摊手：\"下次我让球员用脸挡？\"",
    mediaHeadline: "《肩膀清白，进球成立》",
    linesmanThought: "边裁内心：\"打肩膀还是打手臂？我站的那个角度根本看不清，幸好不是我判。\"",
    controversyImpact: 6,
    scene: {
      highlight: { x: 558, y: 188, label: "肩膀" },
      ball: { x1: 400, y1: 200, x2: 612, y2: 198 },
      attacker: { x1: 395, y1: 205, x2: 430, y2: 205 },
      players: [
        { type: "def", x: 560, y: 205 },
        { type: "gk", x: 612, y: 200 }
      ]
    }
  },
  {
    id: 8,
    title: "干净利落的滑铲",
    description: "防守球员一记干净滑铲先碰到球，球弹到另一名进攻球员脚下破门，丢球方围住裁判投诉犯规。",
    correctAnswer: "进球有效",
    explanation: "先触球且动作合理的滑铲属合法防守，不构成犯规，随后产生的进球有效。",
    crowdReaction: "球迷：\"这铲得比扫地机器人还干净！\"",
    coachReaction: "丢球方教练跺脚：\"铲到球就不算犯规？我不服！\"",
    mediaHeadline: "《先碰球的铲球，VAR 摆手放过》",
    linesmanThought: "边裁内心：\"铲到球了！这个我看得真真的——虽然铲完人确实倒了，但那不怪我。\"",
    controversyImpact: 4,
    scene: {
      collision: { x: 434, y: 203, at: 0.45, kind: "clean" },
      ball: { x1: 380, y1: 198, x2: 600, y2: 200 },
      attacker: { x1: 380, y1: 205, x2: 430, y2: 208 },
      players: [
        { type: "def", x: 475, y: 205, slideTo: { x: 438, y: 206 } },
        { type: "att", x: 300, y: 250 },
        { type: "gk", x: 612, y: 200 }
      ]
    }
  },
  {
    id: 9,
    title: "头球前的暗手",
    description: "角球开出，进攻球员在起跳头球前，明显伸手推开防守球员，随后头球破门。",
    correctAnswer: "犯规",
    explanation: "头球前用手推搡防守球员属犯规，进球无效，判防守方任意球。",
    crowdReaction: "球迷：\"那一推比我挤早高峰还用力！\"",
    coachReaction: "防守方教练模仿推人动作：\"看到没？这是柔道！\"",
    mediaHeadline: "《先推后顶，进球泡汤》",
    linesmanThought: "边裁内心：\"那一推我看见了，但当时以为他俩在友好拍肩鼓励，谁推谁分不清。\"",
    controversyImpact: 3,
    scene: {
      collision: { x: 442, y: 188, at: 0.5, kind: "push" },
      highlight: { x: 444, y: 188, label: "推手" },
      ball: { x1: 250, y1: 80, x2: 452, y2: 184 },
      attacker: { x1: 420, y1: 205, x2: 452, y2: 182 },
      players: [
        { type: "def", x: 470, y: 205 },
        { type: "def", x: 430, y: 245 },
        { type: "gk", x: 612, y: 200 }
      ]
    }
  },
  {
    id: 10,
    title: "防线身后的单刀",
    description: "进攻球员在防线身后接到队友过顶长传，单刀面对门将推射破门，越位线清晰可见。",
    correctAnswer: "越位",
    explanation: "传球瞬间进攻球员处于倒数第二名防守球员身前（更靠近球门），接球即越位，进球无效。",
    crowdReaction: "球迷：\"这越位线画得比斑马线还清楚！\"",
    coachReaction: "防守方教练点头：\"这次没什么可吵的。\"",
    mediaHeadline: "《单刀变空欢，越位线说了算》",
    linesmanThought: "边裁内心：\"这条线我画得问心无愧，就摆在那儿，谁看都越位，我这次没眨眼。\"",
    controversyImpact: 2,
    scene: {
      offsideLine: 380,
      ball: { x1: 300, y1: 230, x2: 480, y2: 200 },
      attacker: { x1: 470, y1: 205, x2: 590, y2: 200 },
      players: [
        { type: "def", x: 380, y: 180 },
        { type: "def", x: 380, y: 270 },
        { type: "att", x: 290, y: 235 },
        { type: "gk", x: 612, y: 200 }
      ]
    }
  },
  {
    id: 11,
    title: "门将出击过了头",
    description: "门将冲出禁区想要拦截直塞球，但在禁区线外用手将球抱住。进攻球员集体举手示意手球。",
    correctAnswer: "手球",
    explanation: "守门员仅在自己禁区内享有手球特权。禁区外用手触球属手球犯规，判直接任意球。",
    crowdReaction: "球迷：\"门将以为禁区是整个中场吗？\"",
    coachReaction: "进攻方教练跳脚：\"他抱着球跑出禁区了都！\"",
    mediaHeadline: "《门将的禁区，不是整个球场》",
    linesmanThought: "边裁内心：\"我数了步数，他确实跑出去了三步，但数步数不是我的工作。\"",
    controversyImpact: 5,
    scene: {
      ball: { x1: 300, y1: 200, x2: 470, y2: 200 },
      attacker: { x1: 300, y1: 205, x2: 440, y2: 205 },
      players: [
        { type: "gk", x: 475, y: 200 },
        { type: "def", x: 430, y: 240 },
        { type: "def", x: 380, y: 260 }
      ]
    }
  },
  {
    id: 12,
    title: "挡视线的影子",
    description: "一名进攻球员站在越位位置，虽然没有触球，但正好挡住了门将视线。队友从远处射门得分。",
    correctAnswer: "越位",
    explanation: "处于越位位置的球员即使不触球，若遮挡门将视线、干扰门将扑救，即构成越位犯规，进球无效。",
    crowdReaction: "球迷：\"他没碰球啊！怎么也越位？\"懂球帝：\"这叫干扰！\"",
    coachReaction: "防守方教练：\"他站在那儿跟柱子一样，门将怎么看球？\"",
    mediaHeadline: "《不碰球也能越位，规则就是这么细》",
    linesmanThought: "边裁内心：\"这个我真举旗了，但他没碰球我也有点虚，好在 VAR 看清了。\"",
    controversyImpact: 9,
    scene: {
      offsideLine: 380,
      ball: { x1: 280, y1: 230, x2: 612, y2: 198 },
      attacker: { x1: 280, y1: 235, x2: 430, y2: 208 },
      players: [
        { type: "def", x: 380, y: 180 },
        { type: "def", x: 380, y: 270 },
        { type: "att", x: 560, y: 200 },
        { type: "gk", x: 612, y: 200 }
      ]
    }
  },
  {
    id: 13,
    title: "影帝级表演",
    description: "进攻球员突入禁区，在没有身体接触的情况下突然倒地，双手抱头痛苦翻滚。防守球员一脸茫然。",
    correctAnswer: "犯规",
    explanation: "无身体接触情况下假摔骗取点球属非体育行为（假摔），判犯规并可能出示黄牌，不判点球。",
    crowdReaction: "球迷：\"这演技，奥斯卡欠他一座小金人！\"",
    coachReaction: "防守方教练冷笑：\"建议他退役去演电影。\"",
    mediaHeadline: "《禁区影帝，VAR 不买账》",
    linesmanThought: "边裁内心：\"我看了三遍回放，连一根草都没碰到他，他是被空气绊倒的。\"",
    controversyImpact: 6,
    scene: {
      collision: { x: 510, y: 215, at: 0.4, kind: "dive" },
      ball: { x1: 380, y1: 198, x2: 505, y2: 202 },
      attacker: { x1: 380, y1: 205, x2: 510, y2: 215 },
      players: [
        { type: "def", x: 540, y: 205 },
        { type: "gk", x: 612, y: 200 }
      ]
    }
  },
  {
    id: 14,
    title: "压线还是过线",
    description: "射门击中门柱后弹向球门线，防守球员奋力解围。球整体是否已经越过门线？全场屏息等待 VAR 判定。",
    correctAnswer: "进球有效",
    explanation: "门线技术判定球整体已完全越过球门线，进球有效。即使防守球员随后解围，进球依然成立。",
    crowdReaction: "球迷：\"进了！没进？进了？我眼都花了！\"",
    coachReaction: "防守方教练捂眼：\"我不敢看，告诉我结果就行。\"",
    mediaHeadline: "《毫米级判定，门线技术说了算》",
    linesmanThought: "边裁内心：\"这个我真看不清，球太快了，感谢门线技术替我背锅。\"",
    controversyImpact: 4,
    scene: {
      highlight: { x: 620, y: 200, label: "门线" },
      ball: { x1: 400, y1: 200, x2: 622, y2: 200 },
      attacker: { x1: 395, y1: 205, x2: 430, y2: 205 },
      players: [
        { type: "def", x: 580, y: 205 },
        { type: "gk", x: 612, y: 200 }
      ]
    }
  },
  {
    id: 15,
    title: "进球前的旧账",
    description: "进球前几秒，进攻方球员在中场附近推搡防守球员，裁判未吹停比赛，随后进攻方完成破门。VAR 回溯检查。",
    correctAnswer: "犯规",
    explanation: "VAR 可回溯进球前的犯规。若进球前存在明显犯规（即使裁判当时未吹停），进球应被取消，判防守方任意球。",
    crowdReaction: "球迷：\"这都追溯到上一回合了？VAR 管得真宽！\"",
    coachReaction: "丢球方教练：\"早该吹了！这叫什么叫有利？\"",
    mediaHeadline: "《进球无效，VAR 追到中场算旧账》",
    linesmanThought: "边裁内心：\"那个推搡我看见了，但当时以为裁判会吹，结果他没吹，我也没敢举旗。\"",
    controversyImpact: 7,
    scene: {
      collision: { x: 320, y: 250, at: 0.3, kind: "push" },
      ball: { x1: 340, y1: 248, x2: 600, y2: 200 },
      attacker: { x1: 340, y1: 255, x2: 590, y2: 200 },
      players: [
        { type: "def", x: 320, y: 245 },
        { type: "def", x: 480, y: 200 },
        { type: "gk", x: 612, y: 200 }
      ]
    }
  }
];

// ---------- 通用弹幕池（回合中随机飘过） ----------
const danmakuPool = [
  "VAR 又来了！", "这都看不出来？", "裁判去看屏幕！",
  "我奶奶都看出来越位了！", "这球要吵到明天。", "快判啊！",
  "压力来到了 VAR 这边", "全场都在等", "别看回放了！",
  "这还用看？", "我要上热搜了", "时间！时间！"
];

// ---------- 高压弹幕池（压力值 ≥ 80 时替换） ----------
const danmakuPoolHigh = [
  "这裁判收了多少？", "我狗都判得比他准！", "VAR 房间门没锁吗？",
  "建议查查他银行账户", "这是职业裁判？", "全场都在骂你！",
  "别扛了，承认看不清吧", "你是在给裁判行业抹黑",
  "我见过最差的 VAR，没有之一", "求求你换个班吧"
];

// ---------- 赛后发布会问题 ----------
// 根据玩家表现选择不同问题，每个问题有多个选项，影响舆论分
const pressQuestions = [
  {
    when: (s) => s.controversy >= 50,
    reporter: "《球市周刊》记者",
    question: "今天您的几次判罚引发了巨大争议，争议值高达 {controversy}。您觉得自己对得起 VAR 房间这把椅子吗？",
    options: [
      { text: "我对每一帧回放都负责，规则就是规则。", opinion: +8, tag: "硬刚" },
      { text: "有些判罚确实可以再讨论，但当时时间有限。", opinion: +3, tag: "服软" },
      { text: "下一个问题。", opinion: -5, tag: "拒答" }
    ]
  },
  {
    when: (s) => s.pressure >= 60,
    reporter: "体育频道现场记者",
    question: "我们看到您在后半段压力值飙到 {pressure}，画面都变红了。当时心态崩了吗？",
    options: [
      { text: "压力是裁判工作的一部分，我扛住了。", opinion: +5, tag: "嘴硬" },
      { text: "说实话，确实有点慌，但判罚没受影响。", opinion: +6, tag: "坦诚" },
      { text: "我什么都没看到，眼前一片红。", opinion: -8, tag: "自爆" }
    ]
  },
  {
    when: (s) => s.correct >= 10,
    reporter: "《战术板》专栏作家",
    question: "您今天 {correct} 次判罚正确，是本赛季 VAR 表现最好的之一。有什么秘诀？",
    options: [
      { text: "多看球，多被骂，脸皮厚了判断就准了。", opinion: +10, tag: "幽默" },
      { text: "只是做好本职工作，没什么特别的。", opinion: +4, tag: "谦虚" },
      { text: "秘诀就是——别眨眼。", opinion: +7, tag: "装酷" }
    ]
  },
  {
    when: (s) => s.correct <= 6,
    reporter: "球迷代表（带了喇叭）",
    question: "{correct} 个对的……您是认真的吗？我奶奶……",
    options: [
      { text: "我接受球迷的批评，会认真复盘。", opinion: +5, tag: "认怂" },
      { text: "规则很复杂，不是每个人都能理解的。", opinion: -10, tag: "嘴硬" },
      { text: "你奶奶来判可能确实比我强，我认。", opinion: +8, tag: "自嘲" }
    ]
  },
  {
    when: () => true,
    reporter: "自由撰稿人",
    question: "最后一个问题：如果时光倒流，你最想重新判罚哪一回合？",
    options: [
      { text: "每一回合都想重来，但裁判没有后悔药。", opinion: +6, tag: "感慨" },
      { text: "一个都不用重来，我对自己有信心。", opinion: +2, tag: "自信" },
      { text: "能不能把整个 VAR 房间也时光倒流回去？", opinion: +5, tag: "搞笑" }
    ]
  }
];
