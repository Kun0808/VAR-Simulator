/* =========================================================
   VAR Simulator：裁判压力室 — 游戏逻辑
   依赖：js/data.js（events、danmakuPool、danmakuPoolHigh、pressQuestions、ROUND_TIME）
   ========================================================= */

// ---------- 游戏状态 ----------
const state = {
  round: 0,
  correct: 0,
  pressure: 0,
  controversy: 0,
  timeLeft: ROUND_TIME,
  answered: false,
  streak: 0,          // 连续判对数
  streakWrong: 0,     // 连续判错数
  progress: 1,
  animRAF: null,
  timerId: null,
  dmkId: null,
  opinion: 50,        // 发布会舆论分（0-100）
  pressIndex: 0,      // 发布会当前问题索引
  blackoutLock: false // 压力爆炸过场锁
};

// ---------- DOM ----------
const $ = id => document.getElementById(id);
const canvas = $("pitch");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;

// ---------- 工具函数 ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

const COLORS = { att: "#ff5252", def: "#3aa0ff", gk: "#ffc83a" };

// ---------- localStorage 排行榜 ----------
const LB_KEY = "var_sim_leaderboard";

function loadLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(LB_KEY)) || [];
  } catch { return []; }
}

function saveLeaderboard(entry) {
  const list = loadLeaderboard();
  list.push(entry);
  // 按正确数降序排，保留前 5
  list.sort((a, b) => b.score - a.score);
  const top5 = list.slice(0, 5);
  try { localStorage.setItem(LB_KEY, JSON.stringify(top5)); } catch {}
  return top5;
}

function renderLeaderboard() {
  const box = $("leaderboard");
  if (!box) return;
  const list = loadLeaderboard();
  if (list.length === 0) {
    box.innerHTML = `<h3>LOCAL LEADERBOARD</h3><div class="leaderboard-empty">还没有记录，来当第一个懂球帝</div>`;
    return;
  }
  const rankClass = ["gold", "silver", "bronze"];
  box.innerHTML = `<h3>LOCAL LEADERBOARD</h3>` + list.map((e, i) => `
    <div class="lb-item">
      <span class="rank ${rankClass[i] || ''}">${i + 1}</span>
      <span class="lb-rating">${e.rating}</span>
      <span class="lb-score">${e.score}/10</span>
      <span class="lb-date">${e.date}</span>
    </div>
  `).join("");
}

/* =========================================================
   绘制：球场 + 场景元素
   ========================================================= */
function drawPitch() {
  ctx.fillStyle = "#2d8a3e";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,.04)";
  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) ctx.fillRect(i * 64, 0, 64, H);
  }

  ctx.strokeStyle = "rgba(255,255,255,.85)";
  ctx.lineWidth = 2;
  const m = 18;
  ctx.strokeRect(m, m, W - m * 2, H - m * 2);
  ctx.beginPath();
  ctx.moveTo(W / 2, m); ctx.lineTo(W / 2, H - m);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 48, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 3, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();

  ctx.strokeRect(520, 70, W - m - 520, 330 - 70);
  ctx.strokeRect(575, 135, W - m - 575, 265 - 135);
  ctx.beginPath(); ctx.arc(560, 200, 3, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W - m, 165); ctx.lineTo(W - m + 10, 165);
  ctx.lineTo(W - m + 10, 235); ctx.lineTo(W - m, 235);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.25)";
  ctx.lineWidth = 1;
  for (let y = 168; y <= 232; y += 8) {
    ctx.beginPath(); ctx.moveTo(W - m, y); ctx.lineTo(W - m + 10, y); ctx.stroke();
  }
  ctx.lineWidth = 2;
}

function drawPlayer(x, y, color, label) {
  ctx.beginPath();
  ctx.arc(x, y + 1, 9, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.fill();
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

function drawScene(ev, p) {
  const sc = ev.scene;
  drawPitch();

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

  sc.players.forEach(pl => {
    let x = pl.x, y = pl.y;
    if (pl.slideTo) {
      const t = clamp((p - 0.2) / 0.4, 0, 1);
      x = lerp(pl.x, pl.slideTo.x, t);
      y = lerp(pl.y, pl.slideTo.y, t);
    }
    drawPlayer(x, y, COLORS[pl.type], pl.type === "gk" ? "G" : "");
  });

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
  if (p > 0.15) {
    const dx = sc.attacker.x2 - sc.attacker.x1, dy = sc.attacker.y2 - sc.attacker.y1;
    const ang = Math.atan2(dy, dx);
    ctx.translate(ax, ay); ctx.rotate(ang);
    ctx.fillStyle = "rgba(255,82,82,.7)";
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-7, -4); ctx.lineTo(-7, 4); ctx.closePath(); ctx.fill();
    ctx.rotate(-ang); ctx.translate(-ax, -ay);
  }
  ctx.restore();

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

  if (sc.collision && p >= sc.collision.at) {
    const c = sc.collision;
    const cp = clamp((p - c.at) / 0.4, 0, 1);
    drawCollision(c.x, c.y, cp, c.kind);
  }

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

  ctx.beginPath();
  ctx.arc(bx, by + 1, 5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fill();
  ctx.beginPath();
  ctx.arc(bx, by, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#fff"; ctx.fill();
  ctx.lineWidth = 1; ctx.strokeStyle = "#222"; ctx.stroke();

  drawPlayer(ax, ay, COLORS.att, "");
}

function drawCollision(x, y, p, kind) {
  ctx.save();
  if (kind === "clean") {
    ctx.strokeStyle = "rgba(54,208,122,.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 8, y); ctx.lineTo(x - 2, y + 6); ctx.lineTo(x + 9, y - 7);
    ctx.stroke();
  } else {
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
   连击系统 UI
   ========================================================= */
function updateStreakUI() {
  const pill = $("roundPill");
  // 移除旧徽章
  const oldBadge = pill.querySelector(".streak-badge");
  if (oldBadge) oldBadge.remove();

  let badge = null;
  if (state.streak >= 5) {
    badge = `<span class="streak-badge god">VAR 之神 ${state.streak}连</span>`;
  } else if (state.streak >= 3) {
    badge = `<span class="streak-badge hot">火眼金睛 ${state.streak}连</span>`;
  } else if (state.streakWrong >= 3) {
    badge = `<span class="streak-badge cold">被质疑 ${state.streakWrong}连错</span>`;
  }
  if (badge) pill.insertAdjacentHTML("beforeend", badge);

  // VAR 之神金色边框
  const monitor = document.querySelector(".monitor");
  if (state.streak >= 5) monitor.classList.add("god-mode");
  else monitor.classList.remove("god-mode");
}

/* =========================================================
   压力系统视觉
   ========================================================= */
function updatePressureVisual() {
  const monitor = document.querySelector(".monitor");
  const pressStat = document.querySelector(".stat.press");

  if (state.pressure >= 80) {
    monitor.classList.add("high-pressure");
  } else {
    monitor.classList.remove("high-pressure");
  }

  if (state.pressure >= 90) {
    pressStat.classList.add("danger");
  } else {
    pressStat.classList.remove("danger");
  }
}

// 压力值达到 100 时触发爆炸过场
function triggerBlackout(callback) {
  if (state.blackoutLock) return;
  state.blackoutLock = true;
  const flash = $("flash");
  const monitor = document.querySelector(".monitor");
  // 创建文字层
  const text = document.createElement("div");
  text.className = "blackout-text";
  text.innerHTML = "压力爆表<br>你已被请出 VAR 房间";
  monitor.appendChild(text);
  flash.classList.remove("green", "red");
  void flash.offsetWidth;
  flash.classList.add("blackout");
  setTimeout(() => {
    flash.classList.remove("blackout");
    text.remove();
    // 压力值回落到 60
    state.pressure = 60;
    updateStatsUI();
    updatePressureVisual();
    state.blackoutLock = false;
    if (callback) callback();
  }, 2500);
}

/* =========================================================
   动画与回合控制
   ========================================================= */
function startRound() {
  const ev = events[state.round];
  state.answered = false;
  state.timeLeft = ROUND_TIME;
  state.progress = 0;

  // 连对 3 给 +2 秒 buff
  if (state.streak >= 3 && state.streak < 5) {
    state.timeLeft = ROUND_TIME + 2;
  }

  $("roundPill").innerHTML = `第 ${state.round + 1} / 10 回合`;
  $("evTitle").textContent = ev.title;
  $("evText").textContent = ev.description;

  document.querySelectorAll(".choice").forEach(b => {
    b.disabled = false;
    b.classList.remove("correct-pick", "wrong-pick");
  });
  $("feedback").classList.remove("show");
  $("feedback").innerHTML = "";

  updateTimerUI();
  updateStatsUI();
  updateStreakUI();
  updatePressureVisual();

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

  // 弹幕——根据压力选择弹幕池
  clearInterval(state.dmkId);
  const pool = state.pressure >= 80 ? danmakuPoolHigh : danmakuPool;
  state.dmkId = setInterval(() => {
    if (!state.answered) {
      const text = pool[Math.floor(Math.random() * pool.length)];
      spawnDanmaku(text, state.pressure >= 80);
    }
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
  if (state.timeLeft <= 5) t.classList.add("warn");
  else t.classList.remove("warn");
}

function updateStatsUI() {
  $("stCorrect").textContent = state.correct;
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

  document.querySelectorAll(".choice").forEach(b => {
    b.disabled = true;
    if (b.dataset.choice === ev.correctAnswer) b.classList.add("correct-pick");
    if (b.dataset.choice === choice && !isRight) b.classList.add("wrong-pick");
  });

  if (isRight) {
    state.correct++;
    state.pressure = clamp(state.pressure - 8, 0, 100);
    state.controversy = clamp(state.controversy + ev.controversyImpact, 0, 100);
    state.streak++;
    state.streakWrong = 0;
  } else {
    state.pressure = clamp(state.pressure + 15, 0, 100);
    state.controversy = clamp(state.controversy + 15, 0, 100);
    state.streak = 0;
    state.streakWrong++;
  }
  updateStatsUI();
  updateStreakUI();

  flash(isRight ? "green" : "red");

  const crowdText = ev.crowdReaction.split("：")[1] || ev.crowdReaction;
  spawnDanmaku(crowdText, state.pressure >= 80);

  // 压力达到 100 触发爆炸过场，之后再显示反馈
  if (state.pressure >= 100) {
    triggerBlackout(() => {
      showFeedback(isRight, ev, false);
    });
  } else {
    showFeedback(isRight, ev, false);
  }
}

function handleTimeout() {
  state.answered = true;
  clearInterval(state.timerId);
  clearInterval(state.dmkId);
  cancelAnimationFrame(state.animRAF);

  const ev = events[state.round];
  state.pressure = clamp(state.pressure + 20, 0, 100);
  state.controversy = clamp(state.controversy + 20, 0, 100);
  state.streak = 0;
  state.streakWrong++;

  document.querySelectorAll(".choice").forEach(b => {
    b.disabled = true;
    if (b.dataset.choice === ev.correctAnswer) b.classList.add("correct-pick");
  });

  updateStatsUI();
  updateStreakUI();
  flash("red");
  spawnDanmaku("时间到了！判罚超时！", true);

  if (state.pressure >= 100) {
    triggerBlackout(() => {
      showFeedback(false, ev, true);
    });
  } else {
    showFeedback(false, ev, true);
  }
}

function flash(color) {
  const f = $("flash");
  f.classList.remove("green", "red", "blackout");
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

  // 连击提示文字
  let streakNote = "";
  if (isRight && state.streak === 3) streakNote = `<div class="fb-block"><span class="lbl">连击奖励：</span>火眼金睛！下一回合 +2 秒。</div>`;
  else if (isRight && state.streak === 5) streakNote = `<div class="fb-block"><span class="lbl">连击奖励：</span>VAR 之神！金色光环加身。</div>`;
  else if (!isRight && state.streakWrong === 3) streakNote = `<div class="fb-block"><span class="lbl">连击警告：</span>三连错！教练组正在围攻 VAR 房间。</div>`;

  fb.innerHTML = `
    <div class="fb-verdict ${verdictClass}">${verdict}</div>
    <div class="fb-block"><span class="lbl">正确答案：</span>${correctAns}</div>
    <div class="fb-block"><span class="lbl">规则解释：</span>${ev.explanation}</div>
    <div class="fb-block"><span class="lbl">球迷反应：</span>${ev.crowdReaction}</div>
    <div class="fb-block"><span class="lbl">教练反应：</span>${ev.coachReaction}</div>
    <div class="fb-block"><span class="lbl">媒体标题：</span>${ev.mediaHeadline}</div>
    <div class="fb-linesman"><span class="lbl">边裁内心：</span>${ev.linesmanThought}</div>
    ${streakNote}
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
function spawnDanmaku(text, high = false) {
  const layer = $("danmaku");
  const span = document.createElement("span");
  span.textContent = text;
  if (high) span.classList.add("high");
  const top = 8 + Math.random() * 70;
  span.style.top = top + "%";
  const dur = 5 + Math.random() * 3;
  span.style.animationDuration = dur + "s";
  layer.appendChild(span);
  setTimeout(() => span.remove(), dur * 1000 + 200);
}

/* =========================================================
   结束页
   ========================================================= */
function getRating(c) {
  if (c >= 9) return { rating: "世界级 VAR 裁判", summary: "VAR 房间为你预留了 C 位，解说员都准备给你鼓掌了。" };
  if (c >= 7) return { rating: "可靠的裁判", summary: "稳如老狗，教练组偷偷记下了你的名字。" };
  if (c >= 5) return { rating: "争议制造机", summary: "赛后热搜第一：\"又是这个裁判\"，建议今晚关闭手机。" };
  if (c >= 3) return { rating: "赛后道歉声明预备役", summary: "道歉声明草稿已为你生成三版，记得挑一个真诚的。" };
  return { rating: "建议远离 VAR 房间", summary: "请离 VAR 房间远一点，越远越好，谢谢配合。" };
}

function showEnd() {
  $("gameScreen").hidden = true;
  $("endScreen").hidden = false;

  const c = state.correct;
  const acc = Math.round((c / events.length) * 100);
  const { rating, summary } = getRating(c);

  // 保存到排行榜
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}/${today.getDate()}`;
  saveLeaderboard({ score: c, rating, date: dateStr });

  $("endRating").textContent = rating;
  $("endSummary").textContent = summary;
  $("endCorrect").textContent = c;
  $("endAcc").textContent = acc + "%";
  $("endPress").textContent = state.pressure;
  $("endCont").textContent = state.controversy;
}

/* =========================================================
   赛后发布会
   ========================================================= */
function startPressConference() {
  $("endScreen").hidden = true;
  $("pressScreen").hidden = false;

  state.opinion = 50;
  state.pressIndex = 0;

  // 筛选符合条件的问题
  state.pressQuestions = pressQuestions.filter(q => q.when(state));
  showPressQuestion();
}

function showPressQuestion() {
  const qs = state.pressQuestions;
  if (state.pressIndex >= qs.length) {
    showPressFinalVerdict();
    return;
  }

  const q = qs[state.pressIndex];
  // 替换占位符
  const questionText = q.question
    .replace("{controversy}", state.controversy)
    .replace("{pressure}", state.pressure)
    .replace("{correct}", state.correct);

  const card = $("pressCard");
  card.innerHTML = `
    <div class="press-reporter">${q.reporter}</div>
    <div class="press-question">${questionText}</div>
    <div class="press-answers" id="pressAnswers">
      ${q.options.map((opt, i) => `
        <button class="press-answer" data-idx="${i}">
          ${opt.text}<span class="tag">[${opt.tag}]</span>
        </button>
      `).join("")}
    </div>
    <div class="press-opinion-bar"><i id="opinionBar" style="width:${state.opinion}%"></i></div>
    <div class="press-opinion-label">舆论分：${state.opinion} / 100</div>
  `;
  card.style.animation = "none";
  void card.offsetWidth;
  card.style.animation = "";

  // 绑定选项
  card.querySelectorAll(".press-answer").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx);
      const opt = q.options[idx];
      // 高亮选中
      card.querySelectorAll(".press-answer").forEach(b => { b.disabled = true; b.classList.remove("picked"); });
      btn.classList.add("picked");
      // 更新舆论分
      state.opinion = clamp(state.opinion + opt.opinion, 0, 100);
      $("opinionBar").style.width = state.opinion + "%";
      card.querySelector(".press-opinion-label").textContent = `舆论分：${state.opinion} / 100`;

      // 弹幕反应
      const pressDmk = opt.opinion >= 5 ? "说得不错！" : "这回答让人更生气了！";
      // 这里没有 danmaku 层（发布会页），用控制台模拟即可

      // 1 秒后进入下一题
      setTimeout(() => {
        state.pressIndex++;
        showPressQuestion();
      }, 1000);
    });
  });
}

function showPressFinalVerdict() {
  const op = state.opinion;
  let verdictRating, verdictText;
  if (op >= 80) {
    verdictRating = "舆论满分：危机公关大师";
    verdictText = "你的发布会表现堪称教科书级别，连最刁钻的记者都被你的话术折服。明天媒体头条可能会变成《VAR 裁判的嘴比判罚还准》。";
  } else if (op >= 60) {
    verdictRating = "稳住阵脚：及格的发言人";
    verdictText = "虽然几个问题有点尖锐，但你大体扛住了。记者们回去写稿时会加一句\"裁判态度尚可\"，算是给你留了面子。";
  } else if (op >= 40) {
    verdictRating = "勉强收场：发言略显尴尬";
    verdictText = "发布会现场气氛微妙，有几个回答让记者交换了\"你懂的\"眼神。好在没有直接翻车，明天还能继续上班。";
  } else if (op >= 20) {
    verdictRating = "公关灾难：建议闭麦";
    verdictText = "你的发言让现场记者集体沉默了三秒，然后爆发出更大的质疑声。建议接下来一周不要看社交媒体。";
  } else {
    verdictRating = "社死现场：已上热搜第一";
    verdictText = "发布会的视频已经被剪成鬼畜素材，标题是\"VAR 裁判发布会全程高能\"。你的裁判生涯可能需要重新规划了。";
  }

  $("pressCard").innerHTML = "";
  const fv = $("pressFinalVerdict");
  fv.innerHTML = `
    <div class="pfv-rating">${verdictRating}</div>
    <div class="pfv-text">${verdictText}</div>
    <div style="margin-top:14px;font-size:13px;color:var(--muted)">最终舆论分：${op} / 100</div>
  `;
  fv.classList.add("show");

  const restartBtn = $("pressRestartBtn");
  restartBtn.style.display = "inline-block";
}

/* =========================================================
   启动 / 重启
   ========================================================= */
function startGame() {
  state.round = 0;
  state.correct = 0;
  state.pressure = 0;
  state.controversy = 0;
  state.streak = 0;
  state.streakWrong = 0;
  state.opinion = 50;
  state.pressIndex = 0;
  state.blackoutLock = false;
  $("startScreen").hidden = true;
  $("endScreen").hidden = true;
  $("pressScreen").hidden = true;
  $("pressFinalVerdict").classList.remove("show");
  $("pressRestartBtn").style.display = "none";
  $("gameScreen").hidden = false;
  startRound();
}

// 事件绑定
$("startBtn").addEventListener("click", startGame);
$("restartBtn").addEventListener("click", startGame);
$("pressRestartBtn").addEventListener("click", () => {
  renderLeaderboard();
  startGame();
});
$("pressBtn").addEventListener("click", startPressConference);
document.querySelectorAll(".choice").forEach(b => {
  b.addEventListener("click", () => handleAnswer(b.dataset.choice));
});

// 初始化：绘制预览球场 + 渲染排行榜
drawPitch();
renderLeaderboard();
