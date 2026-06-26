/* =========================================================
   VAR Simulator：裁判压力室 — 回合数据
   所有回合数据集中在 events 数组中，方便修改。
   每个 event 包含事件文本与 scene 绘制配置。
   ========================================================= */

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
  }
];

// ---------- 通用弹幕池（回合中随机飘过） ----------
const danmakuPool = [
  "VAR 又来了！", "这都看不出来？", "裁判去看屏幕！",
  "我奶奶都看出来越位了！", "这球要吵到明天。", "快判啊！",
  "压力来到了 VAR 这边", "全场都在等", "别看回放了！",
  "这还用看？", "我要上热搜了", "时间！时间！"
];
