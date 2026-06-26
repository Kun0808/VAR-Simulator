/* =========================================================
   VAR Simulator：裁判压力室 — 游戏逻辑
   依赖：js/data.js（events、danmakuPool）
   ========================================================= */

// ---------- 游戏状态 ----------
const state = {
  round: 0,
  correct: 0,
  pressure: 0,
  controversy: 0,
  timeLeft: 8,
  answered: false,
  progress: 1,   // 当前动画进度（用于重绘）
  animRAF: null,
  timerId: null,
  dmkId: null
};

// ---------- DOM ----------
const $ = id => document.getElementById(id);
const canvas = $("pitch");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;

// ---------- 工具函数 ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
// 缓动：先慢后快再缓
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

// 球员颜色映射
const COLORS = { att: "#ff5252", def: "#3aa0ff", gk: "#ffc83a" };

/* =========================================================
   绘制：球场 + 场景元素
   ========================================================= */
function drawPitch() {
  // 草地底色 + 修剪条纹
  ctx.fillStyle = "#2d8a3e";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,.04)";
  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) ctx.fillRect(i * 64, 0, 64, H);
  }

  ctx.strokeStyle = "rgba(255,255,255,.85)";
  ctx.lineWidth = 2;
  const m = 18;
  // 边界
  ctx.strokeRect(m, m, W - m * 2, H - m * 2);
  // 中线
  ctx.beginPath();
  ctx.moveTo(W / 2, m); ctx.lineTo(W / 2, H - m);
  ctx.stroke();
  // 中圈
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 48, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 3, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();

  // 右侧禁区
  ctx.strokeRect(520, 70, W - m - 520, 330 - 70);
  // 右侧小禁区
  ctx.strokeRect(575, 135, W - m - 575, 265 - 135);
  // 点球点
  ctx.beginPath(); ctx.arc(560, 200, 3, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();

  // 球门（右侧）
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W - m, 165); ctx.lineTo(W - m + 10, 165);
  ctx.lineTo(W - m + 10, 235); ctx.lineTo(W - m, 235);
  ctx.stroke();
  // 球门网纹
  ctx.strokeStyle = "rgba(255,255,255,.25)";
  ctx.lineWidth = 1;
  for (let y = 168; y <= 232; y += 8) {
    ctx.beginPath(); ctx.moveTo(W - m, y); ctx.lineTo(W - m + 10, y); ctx.stroke();
  }
  ctx.lineWidth = 2;
}

// 绘制一名球员
function drawPlayer(x, y, color, label) {
  ctx.beginPath();
  ctx.arc(x, y + 1, 9, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.fill(); // 阴影
  ctx.beginPath();
  ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,.9)";
  ctx.stroke();
  if (label) {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y + 1);
  }
}

// 绘制完整场景
function drawScene(ev, p) {
  const sc = ev.scene;
  drawPitch();

  // 越位线
  if (sc.offsideLine != null) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,77,94,.9)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(sc.offsideLine, 18);
    ctx.lineTo(sc.offsideLine, H - 18);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255,77,94,.9)";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("越位线", sc.offsideLine, 12);
    ctx.restore();
  }

  // 静态球员
  sc.players.forEach(pl => {
    let x = pl.x, y = pl.y;
    // 滑铲球员：随进度移动到 slideTo
    if (pl.slideTo) {
      const t = clamp((p - 0.2) / 0.4, 0, 1);
      x = lerp(pl.x, pl.slideTo.x, t);
      y = lerp(pl.y, pl.slideTo.y, t);
    }
    drawPlayer(x, y, COLORS[pl.type], pl.type === "gk" ? "G" : "");
  });

  // 进攻球员跑动轨迹（虚线）
  const ep = ease(p);
  const ax = lerp(sc.attacker.x1, sc.attacker.x2, ep);
  const ay = lerp(sc.attacker.y1, sc.attacker.y2, ep);
  ctx.save();
  ctx.strokeStyle = "rgba(255,82,82,.55)";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(sc.attacker.x1, sc.attacker.y1);
  ctx.lineTo(ax, ay);
  ctx.stroke();
  ctx.setLineDash([]);
  // 跑动方向箭头
  if (p > 0.15) {
    const dx = sc.attacker.x2 - sc.attacker.x1, dy = sc.attacker.y2 - sc.attacker.y1;
    const ang = Math.atan2(dy, dx);
    ctx.translate(ax, ay); ctx.rotate(ang);
    ctx.fillStyle = "rgba(255,82,82,.7)";
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-7, -4); ctx.lineTo(-7, 4); ctx.closePath(); ctx.fill();
    ctx.rotate(-ang); ctx.translate(-ax, -ay);
  }
  ctx.restore();

  // 传球 / 射门路线（虚线）
  const bx = lerp(sc.ball.x1, sc.ball.x2, ep);
  const by = lerp(sc.ball.y1, sc.ball.y2, ep);
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.7)";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(sc.ball.x1, sc.ball.y1);
  ctx.lineTo(bx, by);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // 碰撞 / 冲击效果
  if (sc.collision && p >= sc.collision.at) {
    const c = sc.collision;
    const cp = clamp((p - c.at) / 0.4, 0, 1);
    drawCollision(c.x, c.y, cp, c.kind);
  }

  // 高亮区域（手臂 / 肩膀 / 推手）
  if (sc.highlight && p > 0.45) {
    const h = sc.highlight;
    ctx.save();
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
    ctx.strokeStyle = `rgba(255,206,58,${0.6 + 0.4 * pulse})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(h.x, h.y, 16, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(h.x, h.y, 11, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(255,206,58,.18)";
    ctx.beginPath(); ctx.arc(h.x, h.y, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffce3a";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(h.label, h.x, h.y - 22);
    ctx.restore();
  }

  // 足球（最上层）
  ctx.beginPath();
  ctx.arc(bx, by + 1, 5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fill();
  ctx.beginPath();
  ctx.arc(bx, by, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#fff"; ctx.fill();
  ctx.lineWidth = 1; ctx.strokeStyle = "#222"; ctx.stroke();

  // 主进攻球员（最上层）
  drawPlayer(ax, ay, COLORS.att, "");
}

// 碰撞 / 冲击绘制
function drawCollision(x, y, p, kind) {
  ctx.save();
  if (kind === "clean") {
    // 干净铲球：绿色对勾示意
    ctx.strokeStyle = "rgba(54,208,122,.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 8, y); ctx.lineTo(x - 2, y + 6); ctx.lineTo(x + 9, y - 7);
    ctx.stroke();
  } else {
    // 犯规 / 推人：冲击星芒
    const r = 10 + p * 12;
    ctx.strokeStyle = kind === "push" ? "rgba(255,77,94,.9)" : "rgba(255,77,94,.95)";
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + p;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,77,94,.25)";
    ctx.beginPath(); ctx.arc(x, y, r * 0.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

/* =========================================================
   动画与回合控制
   ========================================================= */
function startRound() {
  const ev = events[state.round];
  state.answered = false;
  state.timeLeft = 8;
  state.progress = 0;

  // 顶部信息
  $("roundPill").textContent = `第 ${state.round + 1} / 10 回合`;
  $("evTitle").textContent = ev.title;
  $("evText").textContent = ev.description;

  // 重置按钮与反馈
  document.querySelectorAll(".choice").forEach(b => {
    b.disabled = false;
    b.classList.remove("correct-pick", "wrong-pick");
  });
  $("feedback").classList.remove("show");
  $("feedback").innerHTML = "";

  updateTimerUI();
  updateStatsUI();

  // 启动动画
  let start = null;
  const DURATION = 2400;
  cancelAnimationFrame(state.animRAF);
  const step = ts => {
    if (start === null) start = ts;
    let p = Math.min((ts - start) / DURATION, 1);
    state.progress = p;
    drawScene(ev, p);
    if (p < 1) {
      state.animRAF = requestAnimationFrame(step);
    } else {
      // 动画结束后保持轻微脉动（高亮元素）——用低频重绘
      state.animRAF = requestAnimationFrame(idleStep);
    }
  };
  const idleStep = () => {
    drawScene(ev, 1);
    if (!state.answered) state.animRAF = requestAnimationFrame(idleStep);
  };
  state.animRAF = requestAnimationFrame(step);

  // 倒计时
  clearInterval(state.timerId);
  state.timerId = setInterval(tick, 100);

  // 弹幕
  clearInterval(state.dmkId);
  state.dmkId = setInterval(() => {
    if (!state.answered) spawnDanmaku(danmakuPool[Math.floor(Math.random() * danmakuPool.length)]);
  }, 1100);
}

function tick() {
  if (state.answered) return;
  state.timeLeft -= 0.1;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    updateTimerUI();
    handleTimeout();
    return;
  }
  updateTimerUI();
}

function updateTimerUI() {
  const t = $("timer");
  t.textContent = state.timeLeft.toFixed(1);
  if (state.timeLeft <= 3) t.classList.add("warn");
  else t.classList.remove("warn");
}

function updateStatsUI() {
  $("stCorrect").textContent = state.correct;
  // 准确率：按已作答回合计算
  const answered = state.answered ? state.round + 1 : state.round;
  const acc = answered > 0 ? Math.round((state.correct / answered) * 100) : 0;
  $("stAcc").textContent = acc + "%";
  $("stPress").textContent = state.pressure;
  $("stCont").textContent = state.controversy;
  $("pressBar").style.width = state.pressure + "%";
  $("contBar").style.width = state.controversy + "%";
}

/* =========================================================
   判罚处理
   ========================================================= */
function handleAnswer(choice) {
  if (state.answered) return;
  state.answered = true;
  clearInterval(state.timerId);
  clearInterval(state.dmkId);
  cancelAnimationFrame(state.animRAF);

  const ev = events[state.round];
  const isRight = choice === ev.correctAnswer;

  // 高亮玩家选择
  document.querySelectorAll(".choice").forEach(b => {
    b.disabled = true;
    if (b.dataset.choice === ev.correctAnswer) b.classList.add("correct-pick");
    if (b.dataset.choice === choice && !isRight) b.classList.add("wrong-pick");
  });

  // 数值更新
  if (isRight) {
    state.correct++;
    state.pressure = clamp(state.pressure - 8, 0, 100);
    state.controversy = clamp(state.controversy + ev.controversyImpact, 0, 100);
  } else {
    state.pressure = clamp(state.pressure + 15, 0, 100);
    state.controversy = clamp(state.controversy + 15, 0, 100);
  }
  updateStatsUI();

  // 闪烁效果
  flash(isRight ? "green" : "red");

  // 弹幕反应
  spawnDanmaku(ev.crowdReaction.split("：")[1] || ev.crowdReaction);

  showFeedback(isRight, ev, false);
}

function handleTimeout() {
  state.answered = true;
  clearInterval(state.timerId);
  clearInterval(state.dmkId);
  cancelAnimationFrame(state.animRAF);

  const ev = events[state.round];
  // 超时算错误，压力与争议明显上升
  state.pressure = clamp(state.pressure + 20, 0, 100);
  state.controversy = clamp(state.controversy + 20, 0, 100);

  document.querySelectorAll(".choice").forEach(b => {
    b.disabled = true;
    if (b.dataset.choice === ev.correctAnswer) b.classList.add("correct-pick");
  });

  updateStatsUI();
  flash("red");
  spawnDanmaku("时间到了！判罚超时！");
  showFeedback(false, ev, true);
}

function flash(color) {
  const f = $("flash");
  f.classList.remove("green", "red");
  // 触发重绘动画
  void f.offsetWidth;
  f.classList.add(color);
}

function showFeedback(isRight, ev, isTimeout) {
  const fb = $("feedback");
  const verdict = isTimeout
    ? "⏱ 超时未判罚 — 算作错误"
    : (isRight ? "✅ 判罚正确" : "❌ 判罚错误");
  const verdictClass = isRight ? "ok" : "no";

  const correctAns = ev.correctAnswer;
  const nextLabel = state.round >= events.length - 1 ? "查看最终结果" : "下一回合";

  fb.innerHTML = `
    <div class="fb-verdict ${verdictClass}">${verdict}</div>
    <div class="fb-block"><span class="lbl">正确答案：</span>${correctAns}</div>
    <div class="fb-block"><span class="lbl">规则解释：</span>${ev.explanation}</div>
    <div class="fb-block"><span class="lbl">球迷反应：</span>${ev.crowdReaction}</div>
    <div class="fb-block"><span class="lbl">教练反应：</span>${ev.coachReaction}</div>
    <div class="fb-block"><span class="lbl">媒体标题：</span>${ev.mediaHeadline}</div>
    <button class="next-btn" id="nextBtn">${nextLabel}</button>
  `;
  fb.classList.add("show");
  $("nextBtn").addEventListener("click", nextRound);
}

function nextRound() {
  state.round++;
  if (state.round >= events.length) {
    showEnd();
  } else {
    startRound();
  }
}

/* =========================================================
   弹幕
   ========================================================= */
function spawnDanmaku(text) {
  const layer = $("danmaku");
  const span = document.createElement("span");
  span.textContent = text;
  const top = 8 + Math.random() * 70; // 百分比
  span.style.top = top + "%";
  const dur = 5 + Math.random() * 3;
  span.style.animationDuration = dur + "s";
  layer.appendChild(span);
  setTimeout(() => span.remove(), dur * 1000 + 200);
}

/* =========================================================
   结束页
   ========================================================= */
function showEnd() {
  $("gameScreen").hidden = true;
  $("endScreen").hidden = false;

  const c = state.correct;
  const acc = Math.round((c / events.length) * 100);
  let rating, summary;
  if (c >= 9) {
    rating = "世界级 VAR 裁判";
    summary = "VAR 房间为你预留了 C 位，解说员都准备给你鼓掌了。";
  } else if (c >= 7) {
    rating = "可靠的裁判";
    summary = "稳如老狗，教练组偷偷记下了你的名字。";
  } else if (c >= 5) {
    rating = "争议制造机";
    summary = "赛后热搜第一：\"又是这个裁判\"，建议今晚关闭手机。";
  } else if (c >= 3) {
    rating = "赛后道歉声明预备役";
    summary = "道歉声明草稿已为你生成三版，记得挑一个真诚的。";
  } else {
    rating = "建议远离 VAR 房间";
    summary = "请离 VAR 房间远一点，越远越好，谢谢配合。";
  }

  $("endRating").textContent = rating;
  $("endSummary").textContent = summary;
  $("endCorrect").textContent = c;
  $("endAcc").textContent = acc + "%";
  $("endPress").textContent = state.pressure;
  $("endCont").textContent = state.controversy;
}

/* =========================================================
   启动 / 重启
   ========================================================= */
function startGame() {
  state.round = 0;
  state.correct = 0;
  state.pressure = 0;
  state.controversy = 0;
  $("startScreen").hidden = true;
  $("endScreen").hidden = true;
  $("gameScreen").hidden = false;
  startRound();
}

// 事件绑定
$("startBtn").addEventListener("click", startGame);
$("restartBtn").addEventListener("click", startGame);
document.querySelectorAll(".choice").forEach(b => {
  b.addEventListener("click", () => handleAnswer(b.dataset.choice));
});

// 首次绘制一个静态预览球场（开始页背景一致感）
drawPitch();
