const $ = (id) => document.getElementById(id);

const aimStage = $('aimStage');
const target = $('target');
const targetEnv = target.querySelector('.envelope');
const arrow = $('arrow');
const bow = $('bow');
const nockEl = $('nock');
const hintText = $('hintText');
const win = $('window');
const content = $('content');
const title = $('title');
const catCanvas = $('cat');
const buttons = $('buttons');
const yesBtn = $('yesBtn');
const noBtn = $('noBtn');
const finalText = $('final');
const closeBtn = $('closeBtn');
const confettiBox = $('confetti');
const rainBox = $('rain');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const QUESTION_HTML = 'Happy 1 Month, Elahe<br />Still love me?';
const DEFAULT_HINT = 'Hold to draw the bow — release to shoot ♡';
const ARROW_LEN = 56;
const MAX_DRAW = 34;

const PAL = {
  k: '#221d1c',
  w: '#fdfdfd',
  p: '#15110f',
  r: '#e23b4e',
  d: '#b22a3b',
  n: '#ff8fa3',
  c: '#ffb3c1',
};

const CAT_IDLE = [
  '..k..........k..',
  '.kkk........kkk.',
  'kkkk........kkkk',
  'kkkkkkkkkkkkkkkk',
  'kwwwwkkkkkkwwwwk',
  'kwppwkkkkkkwppwk',
  'kwppwkkkkkkwppwk',
  'kcckkkknnkkkkcck',
  '.kkkkkkkkkkkkkk.',
  'kkkkkkrrkrrkkkkk',
  'kkkkkrrrrrrrkkkk',
  'kkkkkrrrrrrrkkkk',
  '.kkkkkrrrrrkkkk.',
  '..kkkkkrrrkkkk..',
  '....kk..r.kk....',
  '................',
];

const CAT_HAPPY = [
  '..k..........k..',
  '.kkk........kkk.',
  'kkkk........kkkk',
  'kkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkk',
  'kwkkwkkkkkkwkkwk',
  'kkwwkkkkkkkkwwkk',
  'kcckkkknnkkkkcck',
  '.kkkkkkkkkkkkkk.',
  'kkkkkkrrkrrkkkkk',
  'kkkkkrrrrrrrkkkk',
  'kkkkkrrrrrrrkkkk',
  '.kkkkkrrrrrkkkk.',
  '..kkkkkrrrkkkk..',
  '....kk..r.kk....',
  '................',
];

const CAT_BLINK = [
  '..k..........k..',
  '.kkk........kkk.',
  'kkkk........kkkk',
  'kkkkkkkkkkkkkkkk',
  'kkkkkkkkkkkkkkkk',
  'kwwwwkkkkkkwwwwk',
  'kkkkkkkkkkkkkkkk',
  'kcckkkknnkkkkcck',
  '.kkkkkkkkkkkkkk.',
  'kkkkkkrrkrrkkkkk',
  'kkkkkrrrrrrrkkkk',
  'kkkkkrrrrrrrkkkk',
  '.kkkkkrrrrrkkkk.',
  '..kkkkkrrrkkkk..',
  '....kk..r.kk....',
  '................',
];

function drawSprite(canvas, rows) {
  const height = rows.length;
  const width = rows[0].length;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = PAL[rows[y][x]];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

const CONFETTI_COLORS = ['#e8546a', '#f08aa0', '#d83a52', '#f6b3c2', '#c83048'];
const LOVE_COLORS = ['#e8546a', '#ff5d8f', '#d83a52', '#f08aa0', '#ff8fab', '#c83048', '#ff7eb3', '#c79bff', '#ff9e6b', '#ffd56b', '#f6b3c2'];
const PARALLAX = [];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

function spawnBackgroundHearts(scale = 1) {
  const layers = [
    { n: 22, factor: 7, min: 5, max: 9, blur: 1.6, op: 0.5 },
    { n: 24, factor: 16, min: 7, max: 13, blur: 0, op: 0.9 },
    { n: 18, factor: 30, min: 10, max: 18, blur: 0, op: 1 },
  ];

  for (const layerDef of layers) {
    const layer = document.createElement('div');
    layer.className = 'confetti__layer';
    if (layerDef.blur) layer.style.filter = `blur(${layerDef.blur}px)`;
    layer.style.opacity = layerDef.op;

    for (let i = 0; i < Math.round(layerDef.n * scale); i++) {
      const heart = document.createElement('span');
      heart.className = 'heart';
      const size = layerDef.min + Math.random() * (layerDef.max - layerDef.min);
      heart.style.width = heart.style.height = `${size}px`;
      heart.style.left = `${Math.random() * 100}vw`;
      heart.style.top = `${Math.random() * 100}vh`;
      heart.style.background = pick(CONFETTI_COLORS);
      heart.style.animationDuration = `${(3 + Math.random() * 5).toFixed(2)}s`;
      heart.style.animationDelay = `${(-Math.random() * 6).toFixed(2)}s`;
      layer.appendChild(heart);
    }

    confettiBox.appendChild(layer);
    PARALLAX.push({ el: layer, factor: layerDef.factor });
  }
}

let pX = 0;
let pY = 0;
let parallaxRAF = 0;
function applyParallax() {
  parallaxRAF = 0;
  for (const { el, factor } of PARALLAX) {
    el.style.transform = `translate(${-pX * factor}px, ${-pY * factor}px)`;
  }
  target.style.transform = `translateX(-50%) translate(${pX * 12}px, ${pY * 9}px)`;
}
function onParallax(event) {
  pX = (event.clientX / window.innerWidth - 0.5) * 2;
  pY = (event.clientY / window.innerHeight - 0.5) * 2;
  if (!parallaxRAF) parallaxRAF = requestAnimationFrame(applyParallax);
}

function metrics() {
  const s = aimStage.getBoundingClientRect();
  const n = nockEl.getBoundingClientRect();
  const e = targetEnv.getBoundingClientRect();
  return {
    w: s.width,
    h: s.height,
    left: s.left,
    top: s.top,
    nx: n.left + n.width / 2 - s.left,
    ny: n.top + n.height / 2 - s.top,
    tx: e.left + e.width / 2 - s.left,
    ty: e.top + e.height / 2 - s.top,
  };
}

function clampAngle(angle) {
  let degrees = angle * 180 / Math.PI;
  if (degrees >= 0) degrees = degrees <= 90 ? -10 : -170;
  if (degrees > -10) degrees = -10;
  if (degrees < -170) degrees = -170;
  return degrees * Math.PI / 180;
}

let angle = -Math.PI / 2;
let drawn = 0;
let aiming = false;
let flying = false;
let catState = 'idle';
let yesScale = 1;
let drawRAF = 0;
let drawStartT = 0;
let flightRAF = 0;
let confettiRAF = 0;
let confettiTimer = 0;

function renderBow(degrees, flex = 1) {
  bow.style.transform = `rotate(${degrees}deg) scaleX(${flex})`;
}

function renderAim(m = metrics()) {
  const degrees = angle * 180 / Math.PI;
  const tx = m.nx - Math.cos(angle) * drawn;
  const ty = m.ny - Math.sin(angle) * drawn;
  renderBow(degrees, 1 + (drawn / MAX_DRAW) * 0.12);
  arrow.style.transform = `translate(${tx}px, ${ty}px) rotate(${degrees}deg)`;
  arrow.classList.add('is-on');
}

function layoutAim() {
  if (flying) return;
  const m = metrics();
  angle = clampAngle(Math.atan2(m.ty - m.ny, m.tx - m.nx));
  drawn = 0;
  renderAim(m);
}

function updateAim(clientX, clientY) {
  const m = metrics();
  angle = clampAngle(Math.atan2(clientY - m.top - m.ny, clientX - m.left - m.nx));
  renderAim(m);
}

function startDraw() {
  if (flying) return;
  aiming = true;
  drawStartT = performance.now();
  cancelAnimationFrame(drawRAF);
  drawRAF = requestAnimationFrame(drawStep);
}

function drawStep(now) {
  if (!aiming || flying) return;
  const t = Math.min(1, (now - drawStartT) / 380);
  const eased = 1 - Math.pow(1 - t, 2.2);
  drawn = 6 + (MAX_DRAW - 6) * eased;
  if (t > 0.8) drawn += Math.sin(now / 38) * 0.7;
  renderAim(metrics());
  drawRAF = requestAnimationFrame(drawStep);
}

function release() {
  if (!aiming || flying) return;
  aiming = false;
  cancelAnimationFrame(drawRAF);
  fire();
}

function spawnTrail(x, y) {
  const t = document.createElement('span');
  t.className = 'heart trail';
  t.style.left = `${x - 5.5}px`;
  t.style.top = `${y - 5.5}px`;
  t.style.background = '#f4a9b8';
  t.addEventListener('animationend', () => t.remove());
  aimStage.appendChild(t);
}

function spawnBurst(parent, cx, cy, n = 18) {
  for (let i = 0; i < n; i++) {
    const h = document.createElement('span');
    h.className = 'heart burst';
    const size = 10 + Math.random() * 14;
    h.style.width = h.style.height = `${size}px`;
    h.style.left = `${cx - size / 2}px`;
    h.style.top = `${cy - size / 2}px`;
    h.style.background = pick(CONFETTI_COLORS);
    const a = Math.random() * Math.PI * 2;
    const d = 60 + Math.random() * 110;
    h.style.setProperty('--bx', `${Math.cos(a) * d}px`);
    h.style.setProperty('--by', `${Math.sin(a) * d - 40}px`);
    h.addEventListener('animationend', () => h.remove());
    parent.appendChild(h);
  }
}

function fire() {
  if (flying) return;
  flying = true;

  const m = metrics();
  const startX = m.nx - Math.cos(angle) * drawn;
  const startY = m.ny - Math.sin(angle) * drawn;
  const targetAngle = Math.atan2(m.ty - startY, m.tx - startX);
  const endX = m.tx - Math.cos(targetAngle) * ARROW_LEN;
  const endY = m.ty - Math.sin(targetAngle) * ARROW_LEN;
  const startTime = performance.now();
  const duration = reduceMotion ? 0 : 620;
  drawn = 0;
  hintText.textContent = 'Bullseye ♡';

  function step(now) {
    const t = duration ? Math.min(1, (now - startTime) / duration) : 1;
    const eased = 1 - Math.pow(1 - t, 3);
    const wobble = Math.sin(t * Math.PI) * 14;
    const x = startX + (endX - startX) * eased;
    const y = startY + (endY - startY) * eased + wobble;
    arrow.style.transform = `translate(${x}px, ${y}px) rotate(${targetAngle * 180 / Math.PI}deg)`;
    renderBow(angle * 180 / Math.PI, 1 + 0.12 * (1 - eased));

    if (!reduceMotion && t < 1 && Math.floor(t * 60) % 2 === 0) {
      spawnTrail(x + Math.cos(targetAngle) * ARROW_LEN * 0.5, y + Math.sin(targetAngle) * ARROW_LEN * 0.5);
    }

    if (t < 1) {
      flightRAF = requestAnimationFrame(step);
    } else {
      onHit(m, targetAngle);
    }
  }

  flightRAF = requestAnimationFrame(step);
}

function onHit(m, targetAngle) {
  cancelAnimationFrame(flightRAF);
  flying = false;
  const tailX = m.tx - Math.cos(targetAngle) * ARROW_LEN;
  const tailY = m.ty - Math.sin(targetAngle) * ARROW_LEN;
  arrow.style.transform = `translate(${tailX}px, ${tailY}px) rotate(${targetAngle * 180 / Math.PI}deg)`;
  target.classList.add('is-hit');
  if (!reduceMotion) spawnBurst(aimStage, m.tx, m.ty, 18);
  setTimeout(openLetter, reduceMotion ? 0 : 470);
}

function openLetter() {
  aimStage.classList.add('is-gone');
  win.classList.add('is-open');
  win.setAttribute('aria-hidden', 'false');
  setTimeout(() => yesBtn.focus({ preventScroll: true }), reduceMotion ? 0 : 420);
}

function closeLetter() {
  win.classList.remove('is-open');
  win.setAttribute('aria-hidden', 'true');
  aimStage.classList.remove('is-gone');
  reset();
  resetAim();
  setTimeout(() => aimStage.focus({ preventScroll: true }), reduceMotion ? 0 : 420);
}

function resetAim() {
  cancelAnimationFrame(flightRAF);
  cancelAnimationFrame(drawRAF);
  flying = false;
  aiming = false;
  drawn = 0;
  target.classList.remove('is-hit', 'is-pulse');
  hintText.textContent = DEFAULT_HINT;
  layoutAim();
}

function dodge(event) {
  if (event) event.preventDefault();

  const area = content.getBoundingClientRect();
  const b = noBtn.getBoundingClientRect();
  const pad = 10;

  if (getComputedStyle(noBtn).position !== 'absolute') {
    noBtn.style.position = 'absolute';
    noBtn.style.left = `${b.left - area.left}px`;
    noBtn.style.top = `${b.top - area.top}px`;
  }

  const yes = yesBtn.getBoundingClientRect();
  const margin = 16;
  const yesL = yes.left - area.left - margin;
  const yesR = yes.right - area.left + margin;
  const yesT = yes.top - area.top - margin;
  const yesB = yes.bottom - area.top + margin;

  const minY = area.height * 0.32;
  const maxX = Math.max(pad, area.width - b.width - pad);
  const maxY = Math.max(minY + pad, area.height - b.height - pad);

  let nx = pad;
  let ny = minY;
  for (let i = 0; i < 24; i++) {
    nx = pad + Math.random() * (maxX - pad);
    ny = minY + Math.random() * (maxY - minY);
    const hitsYes = nx < yesR && nx + b.width > yesL && ny < yesB && ny + b.height > yesT;
    if (!hitsYes) break;
  }

  noBtn.style.left = `${nx}px`;
  noBtn.style.top = `${ny}px`;
  yesScale = Math.min(1.8, yesScale + 0.07);
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.classList.add('is-tempting');
}

const confetti = [];
function addConfetti(x, y, vx, vy, size) {
  const el = document.createElement('span');
  el.className = 'heart confetti-heart';
  el.style.width = el.style.height = `${size.toFixed(0)}px`;
  el.style.background = pick(LOVE_COLORS);
  rainBox.appendChild(el);
  confetti.push({ el, x, y, vx, vy, rot: rand(0, 360), vrot: rand(-7, 7), age: 0, life: rand(2.6, 3.6) });
}
function popper(x, y, ang, n) {
  const scale = Math.max(0.5, Math.min(1.15, Math.min(innerWidth, innerHeight) / 900));
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-0.42, 0.42);
    const sp = rand(14, 21) * scale;
    addConfetti(x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(48, 96) * scale);
  }
}
function confettiBurst() {
  const w = innerWidth;
  const h = innerHeight;
  const n = Math.min(innerWidth, innerHeight) < 630 ? 4 : 5;
  popper(-14, h + 14, -Math.PI * 0.34, n);
  popper(w + 14, h + 14, -Math.PI * 0.66, n);
  popper(w / 2, h + 14, -Math.PI * 0.5, n);
}
function confettiTick() {
  confettiRAF = 0;
  for (let i = confetti.length - 1; i >= 0; i--) {
    const p = confetti[i];
    p.vy += 0.2;
    p.vx *= 0.993;
    p.vy *= 0.993;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vrot;
    p.age += 1 / 60;
    const opacity = p.age < 0.1 ? p.age / 0.1 : Math.max(0, 1 - (p.age - 0.1) / p.life);
    p.el.style.opacity = opacity.toFixed(2);
    p.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${p.rot | 0}deg)`;
    if (opacity <= 0 || p.y > innerHeight + 120) {
      p.el.remove();
      confetti.splice(i, 1);
    }
  }
  if (confetti.length) confettiRAF = requestAnimationFrame(confettiTick);
}
function celebrate() {
  clearInterval(confettiTimer);
  confettiBurst();
  let elapsed = 0;
  confettiTimer = setInterval(() => {
    elapsed += 360;
    confettiBurst();
    if (elapsed >= 2700) {
      clearInterval(confettiTimer);
      confettiTimer = 0;
    }
  }, 360);
  if (!confettiRAF) confettiRAF = requestAnimationFrame(confettiTick);
}
function stopCelebrate() {
  clearInterval(confettiTimer);
  confettiTimer = 0;
  cancelAnimationFrame(confettiRAF);
  confettiRAF = 0;
  confetti.length = 0;
}

function sayYes() {
  catState = 'happy';
  title.textContent = 'Yayyy! I love you ♡';
  drawSprite(catCanvas, CAT_HAPPY);
  catCanvas.setAttribute('aria-label', 'A happy cat with a heart');
  buttons.hidden = true;
  finalText.hidden = false;
  requestAnimationFrame(() => finalText.classList.add('is-show'));

  const floatingHeart = document.createElement('span');
  floatingHeart.className = 'heart cat-heart';
  floatingHeart.style.left = '50%';
  floatingHeart.style.top = '60px';
  floatingHeart.style.transform = 'translateX(-50%)';
  content.appendChild(floatingHeart);

  content.classList.add('is-won');
  win.classList.add('is-celebrate');
  if (!reduceMotion) {
    spawnBurst(content, catCanvas.offsetLeft + catCanvas.offsetWidth / 2, catCanvas.offsetTop + catCanvas.offsetHeight / 2, 22);
    celebrate();
  }
}

function reset() {
  catState = 'idle';
  title.innerHTML = QUESTION_HTML;
  drawSprite(catCanvas, CAT_IDLE);
  catCanvas.setAttribute('aria-label', 'A little cat holding a heart');
  buttons.hidden = false;
  finalText.hidden = true;
  finalText.classList.remove('is-show');
  content.classList.remove('is-won');
  win.classList.remove('is-celebrate');
  content.querySelectorAll('.cat-heart, .burst').forEach((el) => el.remove());
  stopCelebrate();
  rainBox.replaceChildren();
  yesScale = 1;
  yesBtn.style.transform = '';
  yesBtn.classList.remove('is-tempting');
  noBtn.style.position = '';
  noBtn.style.left = '';
  noBtn.style.top = '';
}

function blink() {
  if (catState !== 'idle') return;
  drawSprite(catCanvas, CAT_BLINK);
  setTimeout(() => {
    if (catState === 'idle') drawSprite(catCanvas, CAT_IDLE);
  }, 140);
}

closeBtn.addEventListener('click', closeLetter);
yesBtn.addEventListener('click', sayYes);
noBtn.addEventListener('pointerenter', dodge);
noBtn.addEventListener('pointerdown', dodge);
noBtn.addEventListener('click', dodge);
noBtn.addEventListener('focus', dodge);

aimStage.addEventListener('pointermove', (event) => {
  if (!flying) updateAim(event.clientX, event.clientY);
});
aimStage.addEventListener('pointerdown', (event) => {
  if (flying) return;
  updateAim(event.clientX, event.clientY);
  startDraw();
});
window.addEventListener('pointerup', release);
aimStage.addEventListener('keydown', (event) => {
  if (event.key !== ' ' && event.key !== 'Enter') return;
  event.preventDefault();
  if (flying || aiming) return;
  layoutAim();
  startDraw();
  setTimeout(release, reduceMotion ? 0 : 440);
});
window.addEventListener('resize', layoutAim);

reset();
spawnBackgroundHearts(reduceMotion ? 0.5 : 1);
if (!reduceMotion) {
  window.addEventListener('pointermove', onParallax, { passive: true });
  setInterval(blink, 3600);
}
requestAnimationFrame(layoutAim);
window.addEventListener('load', layoutAim);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutAim);
