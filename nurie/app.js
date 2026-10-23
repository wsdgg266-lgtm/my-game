// いろいろぬりえ 本体
'use strict';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* =========================================================
 * 設定・保存
 * ======================================================= */
const store = {
  get(k, d) { try { const v = localStorage.getItem('nurie.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('nurie.' + k, JSON.stringify(v)); } catch { /* 保存できなくても動かす */ } },
};

const DB = {
  _p: null,
  open() {
    if (!this._p) {
      this._p = new Promise((res, rej) => {
        const r = indexedDB.open('nurie', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('works', { keyPath: 'id' });
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
    }
    return this._p;
  },
  async run(mode, fn) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const t = db.transaction('works', mode);
      const req = fn(t.objectStore('works'));
      t.oncomplete = () => res(req.result);
      t.onerror = () => rej(t.error);
    });
  },
  put(w) { return this.run('readwrite', s => s.put(w)); },
  get(id) { return this.run('readonly', s => s.get(id)); },
  del(id) { return this.run('readwrite', s => s.delete(id)); },
  all() { return this.run('readonly', s => s.getAll()); },
};

/* =========================================================
 * 色
 * ======================================================= */
const BASE_COLORS = [
  '#E53935', '#FB8C00', '#FFE135', '#9CCC3C', '#2E9E4F', '#4FC3F7',
  '#1E5BD8', '#8E44AD', '#FF8FB8', '#8D5A3B', '#FFFFFF', '#222222',
];
const hexToRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgbToHex = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();

// 絵の具っぽい色まぜ。RGB を RYB(あか・きいろ・あお)にして混ぜる。
// 「きいろ+あお=みどり」「あか+あお=むらさき」になる。
function rgb2ryb(r, g, b) {
  const w = Math.min(r, g, b); r -= w; g -= w; b -= w;
  const mg = Math.max(r, g, b);
  let y = Math.min(r, g); r -= y; g -= y;
  if (b > 0 && g > 0) { b /= 2; g /= 2; }
  y += g; b += g;
  const my = Math.max(r, y, b);
  if (my > 0) { const n = mg / my; r *= n; y *= n; b *= n; }
  return [r + w, y + w, b + w];
}
function ryb2rgb(r, y, b) {
  const w = Math.min(r, y, b); r -= w; y -= w; b -= w;
  const my = Math.max(r, y, b);
  let g = Math.min(y, b); y -= g; b -= g;
  if (b > 0 && g > 0) { b *= 2; g *= 2; }
  r += y; g += y;
  const mg = Math.max(r, g, b);
  if (mg > 0) { const n = my / mg; r *= n; g *= n; b *= n; }
  return [r + w, g + w, b + w];
}
// 絵の具を「白っぽさ」と「色み」に分けておく
function pigment(hex) {
  const [r, g, b] = hexToRgb(hex).map(v => v / 255);
  const k = rgb2ryb(r, g, b);
  const w = Math.min(...k);
  const ch = k.map(v => v - w);
  return { w, ch, cmax: Math.max(...ch) };
}
// pigs: pigment の配列, ws: 量
function mixPigments(pigs, ws) {
  let T = 0, W = 0, tgt = 0; const C = [0, 0, 0];
  for (let i = 0; i < pigs.length; i++) {
    const a = ws[i]; if (a <= 0) continue;
    const p = pigs[i];
    T += a; W += p.w * a; tgt += p.cmax * a;
    C[0] += p.ch[0] * a; C[1] += p.ch[1] * a; C[2] += p.ch[2] * a;
  }
  if (T <= 0) return null;
  W /= T; tgt /= T; C[0] /= T; C[1] /= T; C[2] /= T;
  const m = Math.max(C[0], C[1], C[2]);
  if (m > 1e-4) { const f = Math.pow(tgt / m, 0.7); C[0] *= f; C[1] *= f; C[2] *= f; }
  const out = ryb2rgb(Math.min(1, C[0] + W), Math.min(1, C[1] + W), Math.min(1, C[2] + W));
  return out.map(v => Math.max(0, Math.min(255, v * 255)));
}
function darker(hex, k = 0.72) {
  const c = hexToRgb(hex);
  const lum = 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  if (lum > 235) return '#C9B79F';
  return rgbToHex(c.map(v => v * k));
}

/* =========================================================
 * おと(その場で作るので音声ファイルはいらない)
 * ======================================================= */
const Sound = {
  on: store.get('sound', true),
  ctx: null,
  ac() {
    if (!this.ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      this.ctx = new C();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  tone(f0, f1, dur, type = 'sine', vol = 0.2, delay = 0) {
    const a = this.ac(); if (!a) return;
    const t = a.currentTime + delay;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t); o.stop(t + dur + 0.02);
  },
  play(name) {
    if (!this.on) return;
    switch (name) {
      case 'pop': this.tone(320, 760, 0.13, 'sine', 0.28); break;
      case 'stamp': this.tone(520, 980, 0.07, 'triangle', 0.18); this.tone(980, 640, 0.1, 'sine', 0.14, 0.06); break;
      case 'tap': this.tone(660, 700, 0.05, 'sine', 0.08); break;
      case 'drop': this.tone(1100, 280, 0.18, 'sine', 0.22); break;
      case 'mixed': [660, 880, 1320].forEach((f, i) => this.tone(f, f, 0.14, 'triangle', 0.13, i * 0.08)); break;
      case 'undo': this.tone(600, 360, 0.1, 'sine', 0.12); break;
      case 'done': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, f * 1.01, 0.22, 'triangle', 0.16, i * 0.11)); break;
    }
  },
};

/* =========================================================
 * 画面きりかえ・トースト・ダイアログ
 * ======================================================= */
function show(id) {
  $$('.screen').forEach(s => s.classList.toggle('on', s.id === id));
  if (id === 'paint') requestAnimationFrame(() => Paint.layout(true));
}
let toastTimer = 0;
function toast(msg, ms = 2200) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), ms);
}
function confirmDlg(msg) {
  return new Promise(res => {
    $('#dlgMsg').textContent = msg;
    const d = $('#dlg'); d.classList.add('on');
    const done = v => { d.classList.remove('on'); $('#dlgYes').onclick = $('#dlgNo').onclick = null; res(v); };
    $('#dlgYes').onclick = () => done(true);
    $('#dlgNo').onclick = () => done(false);
  });
}
const canvasToBuf = (cv, type, q) => new Promise(res => cv.toBlob(b => res(b ? b.arrayBuffer() : null), type, q)).then(p => p);
function bufToImage(buf, type) {
  const url = URL.createObjectURL(new Blob([buf], { type }));
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => { URL.revokeObjectURL(url); res(im); };
    im.onerror = e => { URL.revokeObjectURL(url); rej(e); };
    im.src = url;
  });
}
function loadImage(src) {
  return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
}

/* =========================================================
 * すたんぷ
 * ======================================================= */
const STAMPS = ['star', 'heart', 'flower', 'note', 'moon', 'cloud', 'drop', 'crown', 'kira', 'dot'];
function stampPath(kind) {
  const p = new Path2D();
  const circ = (x, y, r) => { p.moveTo(x + r, y); p.arc(x, y, r, 0, Math.PI * 2); };
  switch (kind) {
    case 'star':
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 21 : 50, a = (-90 + i * 36) * Math.PI / 180;
        i ? p.lineTo(r * Math.cos(a), r * Math.sin(a) + 4) : p.moveTo(r * Math.cos(a), r * Math.sin(a) + 4);
      }
      p.closePath(); break;
    case 'heart': p.addPath(new Path2D('M0 42 C-70 0 -50 -62 0 -28 C50 -62 70 0 0 42 Z')); break;
    case 'flower':
      for (let i = 0; i < 5; i++) { const a = (-90 + i * 72) * Math.PI / 180; circ(27 * Math.cos(a), 27 * Math.sin(a), 22); }
      break;
    case 'note': p.addPath(new Path2D('M-2 -45 H10 Q14 -28 34 -20 Q44 -14 38 -4 Q28 -14 10 -16 V28 A22 17 -20 1 1 -2 22 Z')); break;
    case 'moon': p.addPath(new Path2D('M8 -46 A46 46 0 1 0 40 30 A36 36 0 1 1 8 -46 Z')); break;
    case 'cloud': circ(-24, 8, 22); circ(24, 8, 22); circ(-4, -12, 28); circ(20, -6, 20); p.rect(-24, 8, 48, 22); break;
    case 'drop': p.addPath(new Path2D('M0 -50 C20 -18 36 2 36 18 A36 36 0 0 1 -36 18 C-36 2 -20 -18 0 -50 Z')); break;
    case 'crown': p.addPath(new Path2D('M-46 32 L-48 -26 L-22 0 L0 -40 L22 0 L48 -26 L46 32 Z')); break;
    case 'kira': p.addPath(new Path2D('M0 -50 Q8 -8 50 0 Q8 8 0 50 Q-8 8 -50 0 Q-8 -8 0 -50 Z')); break;
    case 'dot': circ(0, 0, 44); break;
  }
  return p;
}
const STAMP_PATHS = Object.fromEntries(STAMPS.map(k => [k, stampPath(k)]));
function drawStamp(ctx, kind, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 100, size / 100);
  const p = STAMP_PATHS[kind];
  ctx.fillStyle = color;
  ctx.fill(p);
  if (kind === 'flower') {
    ctx.fillStyle = color === '#FFE135' ? '#FB8C00' : '#FFE135';
    ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.fill();
  }
  ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.strokeStyle = darker(color);
  ctx.stroke(p);
  ctx.globalAlpha = 0.55; ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(-16, -16, 9, 5, -0.7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/* =========================================================
 * 線画 → 「かべ」(バケツが越えない所)
 * ======================================================= */
// 線のアルファから、かべのマスクを作る(すき間を少しふさぐため 1px 太らせる)
function buildWall(img, W, H) {
  const d = img.data, m = new Uint8Array(W * H);
  for (let i = 0, j = 3; i < m.length; i++, j += 4) m[i] = d[j] > 90 ? 1 : 0;
  return dilate(m, W, H, 1);
}
function dilate(m, W, H, r) {
  const t = new Uint8Array(W * H), o = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    const row = y * W;
    let cnt = 0;
    for (let x = 0; x < Math.min(r, W); x++) cnt += m[row + x];
    for (let x = 0; x < W; x++) {
      if (x + r < W) cnt += m[row + x + r];
      if (x - r - 1 >= 0) cnt -= m[row + x - r - 1];
      t[row + x] = cnt > 0 ? 1 : 0;
    }
  }
  for (let x = 0; x < W; x++) {
    let cnt = 0;
    for (let y = 0; y < Math.min(r, H); y++) cnt += t[y * W + x];
    for (let y = 0; y < H; y++) {
      if (y + r < H) cnt += t[(y + r) * W + x];
      if (y - r - 1 >= 0) cnt -= t[(y - r - 1) * W + x];
      o[y * W + x] = cnt > 0 ? 1 : 0;
    }
  }
  return o;
}
// かべに囲まれた所を探す(スキャンライン塗りつぶし)
function floodRegion(wall, W, H, sx, sy) {
  const reg = new Uint8Array(W * H);
  let x0 = sx, x1 = sx, y0 = sy, y1 = sy;
  const stack = [sx, sy];
  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    let i = y * W + x;
    if (reg[i] || wall[i]) continue;
    let l = x, r = x;
    while (l > 0 && !wall[i - (x - l) - 1] && !reg[i - (x - l) - 1]) l--;
    while (r < W - 1 && !wall[i + (r - x) + 1] && !reg[i + (r - x) + 1]) r++;
    const row = y * W;
    for (let k = l; k <= r; k++) reg[row + k] = 1;
    if (l < x0) x0 = l; if (r > x1) x1 = r; if (y < y0) y0 = y; if (y > y1) y1 = y;
    for (const ny of [y - 1, y + 1]) {
      if (ny < 0 || ny >= H) continue;
      const nrow = ny * W;
      let inRun = false;
      for (let k = l; k <= r; k++) {
        const free = !wall[nrow + k] && !reg[nrow + k];
        if (free && !inRun) { stack.push(k, ny); inRun = true; }
        else if (!free) inRun = false;
      }
    }
  }
  return { reg, x0, y0, x1, y1 };
}

/* =========================================================
 * ぬる画面
 * ======================================================= */
const SIZES = {
  pen: [10, 24, 48], kira: [14, 28, 52], eraser: [18, 40, 80], stamp: [60, 100, 160],
};
const Paint = {
  W: 0, H: 0, work: null, wall: null, dirty: false, undo: [],
  tool: 'bucket', color: store.get('color', '#E53935'), size: 1, stamp: 'star',
  lastColorTool: 'bucket',
  z: 1, tx: 0, ty: 0, fit: 1, ox: 0, oy: 0,
  pointers: new Map(), act: null, pinch: null, gestureLock: false,

  init() {
    this.stage = $('#stage'); this.board = $('#board');
    // 下から「バケツの いろ」「ぺん・すたんぷ」「せん」の3まい重ね
    this.fillCv = $('#fillCv'); this.drawCv = $('#drawCv'); this.lineCv = $('#lineCv');
    this.fctx = this.fillCv.getContext('2d', { willReadFrequently: true });
    this.dctx = this.drawCv.getContext('2d', { willReadFrequently: true });
    this.lctx = this.lineCv.getContext('2d', { willReadFrequently: true });
    $$('#tools .tool[data-tool]').forEach(b => b.onclick = () => this.setTool(b.dataset.tool));
    $$('#sizes button').forEach(b => b.onclick = () => { this.size = +b.dataset.size; this.syncUi(); Sound.play('tap'); });
    $('#undoBtn').onclick = () => this.doUndo();
    $('#zoomReset').onclick = () => { this.z = 1; this.tx = this.ty = 0; this.applyView(); };
    $('#paintHome').onclick = async () => { await this.save(); this.close(); show('home'); };
    $('#doneBtn').onclick = () => this.finish();
    $('#soundBtn').onclick = () => { Sound.on = !Sound.on; store.set('sound', Sound.on); this.syncUi(); Sound.play('tap'); };
    $('#mixBtn').onclick = () => Mix.open();
    // いろ
    const base = $('#baseCols');
    for (const c of BASE_COLORS) base.appendChild(this.swatch(c));
    // すたんぷ
    const sb = $('#stamps');
    for (const k of STAMPS) {
      const b = document.createElement('button'); b.dataset.stamp = k;
      const cv = document.createElement('canvas'); cv.width = cv.height = 80; cv.style.width = cv.style.height = '40px';
      b.appendChild(cv);
      b.onclick = () => { this.stamp = k; this.syncUi(); Sound.play('tap'); };
      sb.appendChild(b);
    }
    this.renderMyColors();
    this.bindPointer();
    window.addEventListener('resize', () => { if ($('#paint').classList.contains('on')) this.layout(false); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.save(); });
    setInterval(() => { if ($('#paint').classList.contains('on')) this.save(); }, 15000);
    this.syncUi();
  },
  swatch(c) {
    const b = document.createElement('button');
    b.className = 'sw'; b.style.background = c; b.dataset.color = c;
    b.onclick = () => this.setColor(c);
    return b;
  },
  renderMyColors() {
    const box = $('#myCols'); box.innerHTML = '';
    const my = store.get('myColors', []);
    for (let i = 0; i < 8; i++) {
      if (my[i]) box.appendChild(this.swatch(my[i]));
      else { const e = document.createElement('div'); e.className = 'sw empty'; box.appendChild(e); }
    }
    this.syncUi();
  },
  setColor(c) {
    this.color = c; store.set('color', c);
    if (this.tool === 'eraser' || this.tool === 'kira') this.tool = this.lastColorTool;
    Sound.play('tap');
    this.syncUi();
  },
  setTool(t) {
    this.tool = t;
    if (t === 'bucket' || t === 'pen' || t === 'stamp') this.lastColorTool = t;
    Sound.play('tap');
    this.syncUi();
  },
  syncUi() {
    $$('#tools .tool[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === this.tool));
    $$('#pal .sw[data-color]').forEach(b => b.classList.toggle('on', b.dataset.color === this.color && this.tool !== 'eraser' && this.tool !== 'kira'));
    const hasSize = this.tool !== 'bucket';
    $('#sizes').style.visibility = hasSize ? 'visible' : 'hidden';
    $$('#sizes button').forEach(b => b.classList.toggle('on', +b.dataset.size === this.size));
    const stampOn = this.tool === 'stamp';
    if ($('#stamps').classList.contains('on') !== stampOn) {
      $('#stamps').classList.toggle('on', stampOn);
      if (this.W && $('#paint').classList.contains('on')) this.layout(false);
    }
    $$('#stamps button').forEach(b => {
      b.classList.toggle('on', b.dataset.stamp === this.stamp);
      const cv = $('canvas', b), x = cv.getContext('2d');
      x.clearRect(0, 0, 80, 80); drawStamp(x, b.dataset.stamp, 40, 42, 64, this.color);
    });
    $('#undoBtn').disabled = !this.undo.length;
    $('#soundBtn').firstChild.textContent = Sound.on ? '🔊' : '🔇';
  },

  /* ---------- ひらく・とじる ---------- */
  setup(W, H, title) {
    this.W = W; this.H = H;
    for (const cv of [this.fillCv, this.drawCv, this.lineCv]) { cv.width = W; cv.height = H; }
    this.undo = []; this.dirty = false;
    this.z = 1; this.tx = this.ty = 0;
    $('#paintTitle').textContent = title;
    show('paint');
    this.syncUi();
  },
  setLines(img) {   // img: 白い紙に黒い線の ImageData → 線だけのレイヤーにする
    const d = img.data;
    for (let j = 0; j < d.length; j += 4) {
      const lum = 0.3 * d[j] + 0.59 * d[j + 1] + 0.11 * d[j + 2];
      d[j + 3] = Math.max(0, Math.min(255, (255 - lum) * 1.15));
      d[j] = 40; d[j + 1] = 34; d[j + 2] = 30;
    }
    this.lctx.putImageData(img, 0, 0);
    this.wall = buildWall(img, this.W, this.H);
  },
  async templateLines(p, S) {
    const im = await loadImage(pictureUrl(p, S));
    const cv = document.createElement('canvas'); cv.width = cv.height = S;
    const x = cv.getContext('2d', { willReadFrequently: true });
    x.fillStyle = '#fff'; x.fillRect(0, 0, S, S); x.drawImage(im, 0, 0, S, S);
    return x.getImageData(0, 0, S, S);
  },
  async openTemplate(id) {
    const p = PICTURES[id], S = 1200;
    this.work = { id: 'w' + Date.now(), kind: 'tpl', tplId: id, created: Date.now() };
    this.setup(S, S, p.name);
    this.setLines(await this.templateLines(p, S));
  },
  openPhoto(lineImg) {
    this.work = { id: 'w' + Date.now(), kind: 'photo', created: Date.now() };
    this.setup(lineImg.width, lineImg.height, 'しゃしん');
    this.lctx.putImageData(lineImg, 0, 0);
    this.wall = buildWall(lineImg, this.W, this.H);
  },
  async openWork(rec) {
    this.work = { id: rec.id, kind: rec.kind, tplId: rec.tplId, created: rec.created, line: rec.line };
    const title = rec.kind === 'tpl' ? (PICTURES[rec.tplId] || {}).name || '' : 'しゃしん';
    this.setup(rec.W, rec.H, title);
    if (rec.kind === 'tpl') this.setLines(await this.templateLines(PICTURES[rec.tplId], rec.W));
    else {
      const im = await bufToImage(rec.line, 'image/png');
      this.lctx.drawImage(im, 0, 0);
      this.wall = buildWall(this.lctx.getImageData(0, 0, this.W, this.H), this.W, this.H);
    }
    this.fctx.drawImage(await bufToImage(rec.paint, 'image/png'), 0, 0);
    if (rec.draw) this.dctx.drawImage(await bufToImage(rec.draw, 'image/png'), 0, 0);
  },
  close() { this.work = null; this.wall = null; this.undo = []; },
  thumb(max = 360) {
    const s = max / Math.max(this.W, this.H);
    const cv = document.createElement('canvas');
    cv.width = Math.round(this.W * s); cv.height = Math.round(this.H * s);
    const x = cv.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height);
    x.drawImage(this.fillCv, 0, 0, cv.width, cv.height);
    x.drawImage(this.drawCv, 0, 0, cv.width, cv.height);
    x.drawImage(this.lineCv, 0, 0, cv.width, cv.height);
    return cv;
  },
  async save(force = false) {
    if (!this.work || (!this.dirty && !force) || this.saving) return;
    this.saving = true; this.dirty = false;
    try {
      const rec = {
        id: this.work.id, kind: this.work.kind, tplId: this.work.tplId, created: this.work.created,
        W: this.W, H: this.H, updated: Date.now(),
        paint: await canvasToBuf(this.fillCv, 'image/png'),
        draw: await canvasToBuf(this.drawCv, 'image/png'),
        thumb: await canvasToBuf(this.thumb(), 'image/jpeg', 0.85),
      };
      if (this.work.kind === 'photo') {
        if (!this.work.line) this.work.line = await canvasToBuf(this.lineCv, 'image/png');
        rec.line = this.work.line;
      }
      await DB.put(rec);
    } catch (e) {
      this.dirty = true;
      console.warn('save failed', e);
    } finally { this.saving = false; }
  },
  async finish() {
    Sound.play('done');
    confetti();
    await this.save(true);
    setTimeout(() => { this.close(); Gallery.open(); }, 1500);
  },

  /* ---------- 表示(かくだい・いどう) ---------- */
  layout(reset) {
    const r = this.stage.getBoundingClientRect();
    if (!r.width || !this.W) return;
    this.sw = r.width; this.sh = r.height;
    this.reserve = this.tool === 'stamp' ? 76 : 0;   // すたんぷの ならびの ぶん
    this.fit = Math.min((r.width - 16) / this.W, (r.height - 16 - this.reserve) / this.H);
    const bw = this.W * this.fit, bh = this.H * this.fit;
    this.board.style.width = bw + 'px'; this.board.style.height = bh + 'px';
    this.ox = (r.width - bw) / 2; this.oy = (r.height - this.reserve - bh) / 2;
    if (reset) { this.z = 1; this.tx = this.ty = 0; }
    this.applyView();
  },
  applyView() {
    const bw = this.W * this.fit * this.z, bh = this.H * this.fit * this.z;
    // 絵が画面の外に出ていかないように
    this.tx = Math.min(this.sw * 0.75 - this.ox, Math.max(this.sw * 0.25 - this.ox - bw, this.tx));
    this.ty = Math.min(this.sh * 0.75 - this.oy, Math.max(this.sh * 0.25 - this.oy - bh, this.ty));
    this.board.style.transform = `translate(${this.ox + this.tx}px,${this.oy + this.ty}px) scale(${this.z})`;
    $('#zoomReset').classList.toggle('on', this.z > 1.02 || Math.abs(this.tx) > 2 || Math.abs(this.ty) > 2);
  },
  toArt(e) {
    const r = this.board.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * this.W, y: (e.clientY - r.top) / r.height * this.H };
  },

  /* ---------- ゆびの操作 ---------- */
  bindPointer() {
    const st = this.stage;
    st.addEventListener('pointerdown', e => {
      if (e.target.closest('#stamps,#zoomReset')) return;
      e.preventDefault();
      try { st.setPointerCapture(e.pointerId); } catch { }
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.pointers.size === 1 && !this.gestureLock) this.begin(e);
      else if (this.pointers.size === 2) { this.cancel(); this.beginPinch(); }
    });
    st.addEventListener('pointermove', e => {
      if (!this.pointers.has(e.pointerId)) return;
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.pinch) this.movePinch();
      else if (this.act) {
        const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
        for (const ev of (evs.length ? evs : [e])) this.move(ev);
      }
    });
    const up = e => {
      if (!this.pointers.has(e.pointerId)) return;
      this.pointers.delete(e.pointerId);
      if (this.act && e.type === 'pointerup') this.end(e);
      else if (this.act) this.cancel();
      if (this.pointers.size < 2) this.pinch = null;
      if (this.pointers.size === 0) this.gestureLock = false;
    };
    st.addEventListener('pointerup', up);
    st.addEventListener('pointercancel', up);
    st.addEventListener('contextmenu', e => e.preventDefault());
  },
  beginPinch() {
    this.gestureLock = true;
    const [a, b] = [...this.pointers.values()];
    const sr = this.stage.getBoundingClientRect();
    const m = { x: (a.x + b.x) / 2 - sr.left, y: (a.y + b.y) / 2 - sr.top };
    this.pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: this.z, bx: (m.x - this.ox - this.tx) / this.z, by: (m.y - this.oy - this.ty) / this.z };
  },
  movePinch() {
    const [a, b] = [...this.pointers.values()];
    const sr = this.stage.getBoundingClientRect();
    const m = { x: (a.x + b.x) / 2 - sr.left, y: (a.y + b.y) / 2 - sr.top };
    const p = this.pinch;
    this.z = Math.min(6, Math.max(1, p.z0 * Math.hypot(a.x - b.x, a.y - b.y) / p.d0));
    this.tx = m.x - this.ox - this.z * p.bx;
    this.ty = m.y - this.oy - this.z * p.by;
    this.applyView();
  },
  begin(e) {
    if (!this.work) return;
    const p = this.toArt(e);
    const t = this.tool;
    this.act = { tool: t, start: p, last: p, sx: e.clientX, sy: e.clientY, moved: 0 };
    if (t === 'pen' || t === 'eraser' || t === 'kira') {
      this.act.layers = t === 'eraser' ? [this.fctx, this.dctx] : [this.dctx];
      this.act.snaps = this.act.layers.map(c => c.getImageData(0, 0, this.W, this.H));
      this.act.box = [p.x, p.y, p.x, p.y];
      this.act.hue = Math.random() * 360; this.act.dist = 0;
      this.strokeSeg(p, p);
    }
  },
  move(e) {
    const a = this.act; if (!a) return;
    const p = this.toArt(e);
    a.moved = Math.max(a.moved, Math.hypot(e.clientX - a.sx, e.clientY - a.sy));
    if (a.snaps) {
      const d = Math.hypot(p.x - a.last.x, p.y - a.last.y);
      if (d < 1.5) return;
      this.strokeSeg(a.last, p);
      a.last = p;
    }
  },
  strokeSeg(p0, p1) {
    const a = this.act, w = SIZES[a.tool][this.size];
    for (const x of a.layers) this.strokeOn(x, a, w, p0, p1);
    const b = a.box, m = w * 1.2;
    b[0] = Math.min(b[0], p1.x - m, p0.x - m); b[1] = Math.min(b[1], p1.y - m, p0.y - m);
    b[2] = Math.max(b[2], p1.x + m, p0.x + m); b[3] = Math.max(b[3], p1.y + m, p0.y + m);
  },
  strokeOn(x, a, w, p0, p1) {
    x.save();
    x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = w;
    if (a.tool === 'eraser') { x.globalCompositeOperation = 'destination-out'; x.strokeStyle = '#000'; }
    else if (a.tool === 'kira') {
      a.dist += Math.hypot(p1.x - p0.x, p1.y - p0.y);
      x.strokeStyle = `hsl(${(a.hue + a.dist * 0.6) % 360},95%,62%)`;
    } else x.strokeStyle = this.color;
    x.beginPath(); x.moveTo(p0.x, p0.y); x.lineTo(p1.x + 0.01, p1.y); x.stroke();
    if (a.tool === 'kira') {
      // きらきらの つぶ
      const n = Math.max(1, Math.round(Math.hypot(p1.x - p0.x, p1.y - p0.y) / 14));
      for (let i = 0; i < n; i++) {
        if (Math.random() < 0.55) continue;
        const t = Math.random(), r = w * 0.9;
        const sx = p0.x + (p1.x - p0.x) * t + (Math.random() - 0.5) * r * 1.6;
        const sy = p0.y + (p1.y - p0.y) * t + (Math.random() - 0.5) * r * 1.6;
        const s = w * (0.15 + Math.random() * 0.25);
        x.fillStyle = Math.random() < 0.6 ? '#fff' : '#FFF59D';
        x.beginPath();
        x.moveTo(sx, sy - s); x.quadraticCurveTo(sx, sy, sx + s, sy); x.quadraticCurveTo(sx, sy, sx, sy + s);
        x.quadraticCurveTo(sx, sy, sx - s, sy); x.quadraticCurveTo(sx, sy, sx, sy - s); x.fill();
      }
    }
    x.restore();
  },
  end(e) {
    const a = this.act; this.act = null;
    if (!a) return;
    if (a.snaps) {
      const patches = a.layers.map((c, i) => this.cropSnap(c, a.snaps[i], a.box)).filter(Boolean);
      if (patches.length) this.pushUndo(patches);
      return;
    }
    if (a.moved > 24) return;   // ずらしたときは なにもしない
    const p = this.toArt(e);
    if (a.tool === 'bucket') this.fill(p.x, p.y);
    else if (a.tool === 'stamp') this.putStamp(p.x, p.y);
  },
  cancel() {
    const a = this.act; this.act = null;
    if (a && a.snaps) a.layers.forEach((c, i) => c.putImageData(a.snaps[i], 0, 0));
  },
  cropSnap(ctx, snap, box) {
    const x0 = Math.max(0, Math.floor(box[0])), y0 = Math.max(0, Math.floor(box[1]));
    const x1 = Math.min(this.W, Math.ceil(box[2])), y1 = Math.min(this.H, Math.ceil(box[3]));
    if (x1 <= x0 || y1 <= y0) return null;
    const w = x1 - x0, h = y1 - y0, patch = new ImageData(w, h);
    for (let y = 0; y < h; y++) {
      const s = ((y0 + y) * this.W + x0) * 4;
      patch.data.set(snap.data.subarray(s, s + w * 4), y * w * 4);
    }
    return { ctx, x: x0, y: y0, img: patch };
  },
  pushUndo(u) {   // u: [{ctx, x, y, img}] 1かいぶんの もとの え
    this.undo.push(u);
    if (this.undo.length > 30) this.undo.shift();
    this.dirty = true;
    $('#undoBtn').disabled = false;
  },
  doUndo() {
    const u = this.undo.pop();
    if (u) { for (const p of u) p.ctx.putImageData(p.img, p.x, p.y); this.dirty = true; Sound.play('undo'); }
    $('#undoBtn').disabled = !this.undo.length;
  },
  fill(fx, fy) {
    const W = this.W, H = this.H, wall = this.wall;
    let sx = Math.round(fx), sy = Math.round(fy);
    if (sx < 0 || sy < 0 || sx >= W || sy >= H) return;
    if (wall[sy * W + sx]) {   // 線の上をタップしたら、近くのすき間をさがす
      let best = null;
      for (let r = 1; r <= 10 && !best; r++) {
        for (let dy = -r; dy <= r && !best; dy++) for (let dx = -r; dx <= r; dx++) {
          const x = sx + dx, y = sy + dy;
          if (x >= 0 && y >= 0 && x < W && y < H && !wall[y * W + x]) { best = [x, y]; break; }
        }
      }
      if (!best) return;
      [sx, sy] = best;
    }
    const { reg, x0, y0, x1, y1 } = floodRegion(wall, W, H, sx, sy);
    // 線の下まで少しはみ出してぬる(白いすき間を残さない)
    const G = 4;
    const bx0 = Math.max(0, x0 - G), by0 = Math.max(0, y0 - G), bx1 = Math.min(W - 1, x1 + G), by1 = Math.min(H - 1, y1 + G);
    for (let g = 1; g <= G; g++) {
      for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
        const i = y * W + x;
        if (reg[i] || !wall[i]) continue;
        if ((x > 0 && reg[i - 1] && reg[i - 1] <= g) || (x < W - 1 && reg[i + 1] && reg[i + 1] <= g) ||
          (y > 0 && reg[i - W] && reg[i - W] <= g) || (y < H - 1 && reg[i + W] && reg[i + W] <= g)) reg[i] = g + 1;
      }
    }
    const bw = bx1 - bx0 + 1, bh = by1 - by0 + 1;
    const img = this.fctx.getImageData(bx0, by0, bw, bh);
    const before = new ImageData(new Uint8ClampedArray(img.data), bw, bh);
    const [r, g, b] = hexToRgb(this.color), d = img.data;
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      if (!reg[(by0 + y) * W + bx0 + x]) continue;
      const j = (y * bw + x) * 4;
      d[j] = r; d[j + 1] = g; d[j + 2] = b; d[j + 3] = 255;
    }
    this.fctx.putImageData(img, bx0, by0);
    this.pushUndo([{ ctx: this.fctx, x: bx0, y: by0, img: before }]);
    Sound.play('pop');
    ripple(fx, fy);
  },
  putStamp(x, y) {
    const s = SIZES.stamp[this.size], m = s * 0.6;
    const x0 = Math.max(0, Math.floor(x - m)), y0 = Math.max(0, Math.floor(y - m));
    const x1 = Math.min(this.W, Math.ceil(x + m)), y1 = Math.min(this.H, Math.ceil(y + m));
    if (x1 <= x0 || y1 <= y0) return;
    const before = this.dctx.getImageData(x0, y0, x1 - x0, y1 - y0);
    drawStamp(this.dctx, this.stamp, x, y, s, this.color);
    this.pushUndo([{ ctx: this.dctx, x: x0, y: y0, img: before }]);
    Sound.play('stamp');
  },
};

// バケツでぬった所に ふわっと わっか
function ripple(ax, ay) {
  const r = Paint.board.getBoundingClientRect();
  const x = r.left + ax / Paint.W * r.width, y = r.top + ay / Paint.H * r.height;
  FX.add({ type: 'ring', x, y, t: 0, color: Paint.color });
}

/* =========================================================
 * いろまぜ(えのぐの おさら)
 * ======================================================= */
const MIX_NEED = 260;   // まざるまでに こする きょり(おさらの ます目で)
const Mix = {
  N: 72, slots: [], pigs: [], w: null, tmp: null, last: null, mixedOnce: false, rubbed: 0,
  init() {
    this.cv = $('#dish'); this.ctx = this.cv.getContext('2d');
    this.off = document.createElement('canvas'); this.off.width = this.off.height = this.N;
    this.octx = this.off.getContext('2d');
    this.w = new Float32Array(this.N * this.N * 3); this.tmp = new Float32Array(this.w.length);
    const box = $('#mixCols');
    for (const c of BASE_COLORS) {
      const b = document.createElement('button'); b.className = 'sw'; b.style.background = c;
      b.onclick = () => this.drop(c); box.appendChild(b);
    }
    $('#washBtn').onclick = () => { this.wash(); Sound.play('drop'); };
    $('#mixClose').onclick = () => this.close();
    $('#mixDone').onclick = () => this.done();
    const cv = this.cv;
    cv.addEventListener('pointerdown', e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch { } this.last = this.toCell(e); });
    cv.addEventListener('pointermove', e => {
      if (!this.last) return;
      const p = this.toCell(e);
      this.rub(this.last, p); this.last = p;
    });
    const up = () => { this.last = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  },
  open() {
    $('#mix').classList.add('on');
    const s = Math.round(this.cv.getBoundingClientRect().width * Math.min(2, devicePixelRatio || 1));
    this.cv.width = this.cv.height = s;
    this.render(); this.updateSide();
  },
  close() { $('#mix').classList.remove('on'); },
  wash() { this.w.fill(0); this.slots = []; this.pigs = []; this.mixedOnce = false; this.rubbed = 0; this.render(); this.updateSide(); },
  toCell(e) {
    const r = this.cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * this.N, y: (e.clientY - r.top) / r.height * this.N };
  },
  inDish(x, y) { const c = this.N / 2, R = this.N / 2 - 3; return (x - c) ** 2 + (y - c) ** 2 < R * R; },
  drop(hex) {
    let k = this.slots.indexOf(hex);
    if (k < 0) {
      if (this.slots.length >= 3) { toast('いろは 3つ までだよ'); return; }
      this.slots.push(hex); this.pigs.push(pigment(hex)); k = this.slots.length - 1;
    }
    // 色ごとに きまった ばしょ(まんなかの まわり)に ぽとん。まざるまでの じかんが そろう
    const N = this.N, c = N / 2, ang = k * Math.PI * 2 / 3 - Math.PI / 2 + (Math.random() - 0.5) * 0.5, rr = N * (0.13 + Math.random() * 0.04);
    const cx = c + Math.cos(ang) * rr, cy = c + Math.sin(ang) * rr, R = N * 0.13;
    for (let y = Math.floor(cy - R); y <= cy + R; y++) for (let x = Math.floor(cx - R); x <= cx + R; x++) {
      if (!this.inDish(x, y)) continue;
      const d = Math.hypot(x - cx, y - cy) / R;
      if (d >= 1) continue;
      this.w[(y * N + x) * 3 + k] += 1.1 * (1 - d * d);
    }
    this.mixedOnce = false; this.rubbed *= 0.3;   // 足したら また まぜなおし
    Sound.play('drop');
    this.render(); this.updateSide();
  },
  rub(p0, p1) {
    const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    const steps = Math.max(1, Math.ceil(dist / 1.2));
    // 絵の具の上を こすった ぶんだけ メーターが たまる
    const N = this.N, cx = Math.round(p1.x), cy = Math.round(p1.y);
    if (cx >= 0 && cy >= 0 && cx < N && cy < N) {
      const i = (cy * N + cx) * 3;
      if (this.w[i] + this.w[i + 1] + this.w[i + 2] > 0.1) this.rubbed += Math.min(dist, 6);
    }
    for (let s = 1; s <= steps; s++) {
      const t0 = (s - 1) / steps, t1 = s / steps;
      const ax = p0.x + (p1.x - p0.x) * t0, ay = p0.y + (p1.y - p0.y) * t0;
      const bx = p0.x + (p1.x - p0.x) * t1, by = p0.y + (p1.y - p0.y) * t1;
      this.smear(bx, by, bx - ax, by - ay);
    }
    this.render(); this.updateSide();
  },
  smear(px, py, dx, dy) {
    const N = this.N, R = 9, w = this.w, src = this.tmp;
    src.set(w);
    const sample = (x, y, k) => {
      const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
      const g = (xx, yy) => (xx < 0 || yy < 0 || xx >= N || yy >= N) ? 0 : src[(yy * N + xx) * 3 + k];
      return g(x0, y0) * (1 - fx) * (1 - fy) + g(x0 + 1, y0) * fx * (1 - fy) + g(x0, y0 + 1) * (1 - fx) * fy + g(x0 + 1, y0 + 1) * fx * fy;
    };
    for (let y = Math.max(1, Math.floor(py - R)); y <= Math.min(N - 2, py + R); y++) {
      for (let x = Math.max(1, Math.floor(px - R)); x <= Math.min(N - 2, px + R); x++) {
        if (!this.inDish(x, y)) continue;
        const d = Math.hypot(x - px, y - py);
        if (d >= R) continue;
        const f = 1 - d / R;
        for (let k = 0; k < 3; k++) {
          const i = (y * N + x) * 3 + k;
          const s = sample(x - dx * 1.6, y - dy * 1.6, k);
          const a = (src[i - 3] + src[i + 3] + src[i - N * 3] + src[i + N * 3] + src[i] +
            src[i - N * 3 - 3] + src[i - N * 3 + 3] + src[i + N * 3 - 3] + src[i + N * 3 + 3]) / 9;
          w[i] = w[i] * (1 - f) + (s * 0.4 + a * 0.6) * f;
        }
      }
    }
  },
  // まざりぐあい 0〜1(こすった りょう で きまる)
  stats() {
    const N = this.N, w = this.w, tot = [0, 0, 0];
    let T = 0;
    for (let i = 0; i < N * N; i++) { const a = w[i * 3], b = w[i * 3 + 1], c = w[i * 3 + 2]; tot[0] += a; tot[1] += b; tot[2] += c; }
    T = tot[0] + tot[1] + tot[2];
    if (T <= 0) return { mixed: 0, tot };
    return { mixed: Math.min(1, this.rubbed / MIX_NEED), tot };
  },
  // まざりきったら、おさら ぜんたいを ゆっくり 同じ色に
  settle() {
    const N = this.N, w = this.w, { tot } = this.stats();
    const T = tot[0] + tot[1] + tot[2]; if (T <= 0) return;
    const P = tot.map(v => v / T);
    let n = 0;
    const step = () => {
      if (!this.mixedOnce) return;   // とちゅうで あらった・足した
      for (let i = 0; i < N * N; i++) {
        const s = w[i * 3] + w[i * 3 + 1] + w[i * 3 + 2];
        if (s <= 0) continue;
        for (let k = 0; k < 3; k++) w[i * 3 + k] += (s * P[k] - w[i * 3 + k]) * 0.18;
      }
      this.render();
      if (++n < 24) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },
  render() {
    const N = this.N, img = this.octx.createImageData(N, N), d = img.data, w = this.w;
    const cache = new Map();
    for (let i = 0; i < N * N; i++) {
      const a = w[i * 3], b = w[i * 3 + 1], c = w[i * 3 + 2], s = a + b + c;
      const j = i * 4;
      if (s < 0.02) { d[j] = 250; d[j + 1] = 248; d[j + 2] = 243; d[j + 3] = 255; continue; }
      // 色の計算は おもいので、だいたい同じ わりあいは使いまわす
      const key = Math.round(a / s * 40) * 1681 + Math.round(b / s * 40) * 41 + Math.round(c / s * 40);
      let col = cache.get(key);
      if (!col) { col = mixPigments(this.pigs, [a / s, b / s, c / s]); cache.set(key, col); }
      const al = Math.min(1, s / 0.12);
      d[j] = col[0] * al + 250 * (1 - al); d[j + 1] = col[1] * al + 248 * (1 - al); d[j + 2] = col[2] * al + 243 * (1 - al); d[j + 3] = 255;
    }
    this.octx.putImageData(img, 0, 0);
    const x = this.ctx, S = this.cv.width, c = S / 2;
    x.clearRect(0, 0, S, S);
    // おさら
    x.fillStyle = '#E9DCCB'; x.beginPath(); x.arc(c, c + S * 0.012, S * 0.49, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(c, c, S * 0.485, 0, Math.PI * 2); x.fill();
    x.save();
    x.beginPath(); x.arc(c, c, S * 0.46 - 3, 0, Math.PI * 2); x.clip();
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.drawImage(this.off, 0, 0, S, S);
    // つや
    const g = x.createRadialGradient(c * 0.7, c * 0.6, 0, c * 0.7, c * 0.6, S * 0.5);
    g.addColorStop(0, '#ffffff55'); g.addColorStop(1, '#ffffff00');
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    x.restore();
    x.strokeStyle = '#EADBC6'; x.lineWidth = S * 0.012; x.beginPath(); x.arc(c, c, S * 0.46, 0, Math.PI * 2); x.stroke();
  },
  updateSide() {
    const box = $('#mixIn'); box.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const e = document.createElement('i');
      if (this.slots[i]) e.style.background = this.slots[i]; else e.className = 'slot';
      box.appendChild(e);
    }
    const { mixed, tot } = this.stats();
    const has = tot[0] + tot[1] + tot[2] > 0.5;
    $('#dishHint').innerHTML = !has ? 'したの いろを おさらに いれてね'
      : (this.slots.length > 1 && mixed < 1) ? '<span class="hand">👆</span>ゆびで ぐるぐる まぜてね' : '';
    $('#mixMeter i').style.width = (has ? (this.slots.length > 1 ? mixed : 1) * 100 : 0) + '%';
    const ok = has && (this.slots.length === 1 || mixed >= 1);
    const res = $('#mixResult');
    if (ok) {
      this.result = rgbToHex(mixPigments(this.pigs, tot));
      res.style.background = this.result; res.textContent = '';
      if (!this.mixedOnce && this.slots.length > 1) { this.mixedOnce = true; Sound.play('mixed'); this.settle(); }
    } else { res.style.background = '#fff'; res.textContent = '?'; }
    $('#mixDone').disabled = !ok;
  },
  done() {
    const c = this.result;
    const my = store.get('myColors', []).filter(v => v !== c);
    my.unshift(c);
    store.set('myColors', my.slice(0, 8));
    Paint.renderMyColors();
    Paint.setColor(c);
    Sound.play('mixed');
    this.wash();
    this.close();
    toast('じぶんの いろが できたよ!');
  },
};

/* =========================================================
 * しゃしん → せんが
 * ======================================================= */
// s: ぼかし(大きいほど こまかい線が へる) / dens: 画面のうち 線にする わりあい / min: これより みじかい線は けす
const LEVELS = [
  { s: 3.0, dens: 0.012, min: 200, thick: 2 },
  { s: 2.2, dens: 0.025, min: 120, thick: 1 },
  { s: 1.7, dens: 0.045, min: 100, thick: 1 },
];
// 色のちがいも見て、ものの ふちを 1本の線にする(Canny 法)
function edgeLines(chans, W, H, L) {
  const bl = chans.map(c => gaussBlur(c, W, H, L.s));
  const mag = new Float32Array(W * H), dir = new Uint8Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    let best = 0, bx = 0, by = 0;
    for (const c of bl) {
      const gx = c[i - W + 1] + 2 * c[i + 1] + c[i + W + 1] - c[i - W - 1] - 2 * c[i - 1] - c[i + W - 1];
      const gy = c[i + W - 1] + 2 * c[i + W] + c[i + W + 1] - c[i - W - 1] - 2 * c[i - W] - c[i - W + 1];
      const m2 = gx * gx + gy * gy;
      if (m2 > best) { best = m2; bx = gx; by = gy; }
    }
    mag[i] = Math.sqrt(best);
    const ax = Math.abs(bx), ay = Math.abs(by);
    dir[i] = ay <= ax * 0.4142 ? 0 : ay >= ax * 2.4142 ? 2 : (bx * by > 0 ? 1 : 3);
  }
  const OFF = [1, W + 1, W, W - 1];
  const nm = new Float32Array(W * H), sample = [];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x, m = mag[i], o = OFF[dir[i]];
    if (m > 4 && m >= mag[i - o] && m > mag[i + o]) { nm[i] = m; if ((i & 3) === 0) sample.push(m); }
  }
  sample.sort((a, b) => a - b);
  // ざらざら(ノイズ)の多い しゃしんでは、まんなかの つよさより しっかり強い所だけ線にする
  const flat = [];   // 画面ぜんたいの ざらざら具合
  for (let i = 0; i < W * H; i += 7) flat.push(mag[i]);
  flat.sort((a, b) => a - b);
  const noise = flat[Math.floor(flat.length * 0.5)] || 0;
  const want = Math.floor(W * H / 4 * L.dens);   // つよい じゅんに この数だけ
  const byDens = sample.length > want ? sample[sample.length - 1 - want] : 0;
  const high = Math.max(24, byDens, noise * 3.5), low = high * 0.45;
  const m = new Uint8Array(W * H), stack = [];
  for (let i = 0; i < W * H; i++) if (nm[i] >= high && !m[i]) {
    m[i] = 1; stack.push(i);
    while (stack.length) {
      const j = stack.pop();
      for (const d of [-W - 1, -W, -W + 1, -1, 1, W - 1, W, W + 1]) {
        const k = j + d;
        if (k > 0 && k < W * H && !m[k] && nm[k] >= low) { m[k] = 1; stack.push(k); }
      }
    }
  }
  return m;
}
function gaussBlur(src, W, H, sigma) {
  const r = Math.max(1, Math.ceil(sigma * 2.5)), k = new Float32Array(r * 2 + 1);
  let sum = 0;
  for (let i = -r; i <= r; i++) { k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma)); sum += k[i + r]; }
  for (let i = 0; i < k.length; i++) k[i] /= sum;
  const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    const row = y * W;
    for (let x = 0; x < W; x++) {
      let v = 0;
      for (let i = -r; i <= r; i++) { const xx = x + i < 0 ? 0 : x + i >= W ? W - 1 : x + i; v += src[row + xx] * k[i + r]; }
      tmp[row + x] = v;
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let v = 0;
      for (let i = -r; i <= r; i++) { const yy = y + i < 0 ? 0 : y + i >= H ? H - 1 : y + i; v += tmp[yy * W + x] * k[i + r]; }
      out[y * W + x] = v;
    }
  }
  return out;
}
function removeSmall(m, W, H, min) {
  const seen = new Uint8Array(W * H), stack = [], comp = [];
  for (let i = 0; i < W * H; i++) {
    if (!m[i] || seen[i]) continue;
    stack.length = 0; comp.length = 0; stack.push(i); seen[i] = 1;
    while (stack.length) {
      const j = stack.pop(); comp.push(j);
      const x = j % W, y = (j / W) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const k = yy * W + xx;
        if (m[k] && !seen[k]) { seen[k] = 1; stack.push(k); }
      }
    }
    if (comp.length < min) for (const j of comp) m[j] = 0;
  }
}
const Photo = {
  gray: null, W: 0, H: 0, lv: 1, result: null,
  init() {
    $('#camBtn').onclick = () => $('#camIn').click();
    $('#albumBtn').onclick = () => $('#albumIn').click();
    for (const id of ['#camIn', '#albumIn']) $(id).onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) this.load(f); };
    $$('#levels button').forEach(b => b.onclick = () => { this.lv = +b.dataset.lv; this.syncLv(); this.convert(); });
    $('#photoRetry').onclick = () => this.reset();
    $('#photoGo').onclick = () => { if (this.result) { Paint.openPhoto(this.result); this.reset(); } };
  },
  open() { this.reset(); show('photo'); },
  reset() {
    this.gray = null; this.result = null;
    $('#photoStart').style.display = ''; $('#photoEdit').classList.remove('on'); $('#photoBusy').classList.remove('on');
  },
  syncLv() { $$('#levels button').forEach(b => b.classList.toggle('on', +b.dataset.lv === this.lv)); },
  async load(file) {
    $('#photoStart').style.display = 'none'; $('#photoBusy').classList.add('on');
    try {
      let src;
      try { src = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
      catch { const url = URL.createObjectURL(file); src = await loadImage(url); URL.revokeObjectURL(url); }
      const s = Math.min(1, 1200 / Math.max(src.width, src.height));
      const W = Math.round(src.width * s), H = Math.round(src.height * s);
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const x = cv.getContext('2d', { willReadFrequently: true });
      x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
      x.drawImage(src, 0, 0, W, H);
      const d = x.getImageData(0, 0, W, H).data, g = new Float32Array(W * H);
      const rg = new Float32Array(W * H), yb = new Float32Array(W * H);
      const hist = new Uint32Array(256);
      for (let i = 0; i < W * H; i++) {
        const r = d[i * 4], gg = d[i * 4 + 1], b = d[i * 4 + 2], v = 0.3 * r + 0.59 * gg + 0.11 * b;
        g[i] = v; hist[v | 0]++;
        rg[i] = (r - gg) * 0.6; yb[i] = ((r + gg) / 2 - b) * 0.6;   // あか⇔みどり、きいろ⇔あお の ちがい
      }
      // あかるさを そろえる
      let lo = 0, hi = 255, acc = 0;
      for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc > W * H * 0.02) { lo = v; break; } }
      acc = 0;
      for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc > W * H * 0.02) { hi = v; break; } }
      const span = Math.max(30, hi - lo);
      for (let i = 0; i < g.length; i++) g[i] = Math.max(0, Math.min(255, (g[i] - lo) / span * 255));
      this.gray = g; this.chans = [g, rg, yb]; this.W = W; this.H = H;
      await this.convert();
    } catch (e) {
      console.warn(e);
      toast('しゃしんが ひらけなかったよ');
      this.reset();
    }
  },
  async convert() {
    if (!this.gray) return;
    $('#photoBusy').classList.add('on'); $('#photoEdit').classList.remove('on');
    await new Promise(r => setTimeout(r, 30));   // 「かいているよ」を先に出す
    const { W, H } = this, L = LEVELS[this.lv];
    let m = edgeLines(this.chans, W, H, L);
    removeSmall(m, W, H, L.min);
    if (L.thick) m = dilate(m, W, H, L.thick);
    // わく
    const F = 6;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x < F || y < F || x >= W - F || y >= H - F) m[y * W + x] = 1;
    // ふちを なめらかに
    const img = new ImageData(W, H), d = img.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let s = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        s += m[yy * W + xx] * (dx || dy ? 1 : 4); n += dx || dy ? 1 : 4;
      }
      const j = (y * W + x) * 4;
      d[j] = 40; d[j + 1] = 34; d[j + 2] = 30; d[j + 3] = Math.round(s / n * 255);
    }
    this.result = img;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    const lc = document.createElement('canvas'); lc.width = W; lc.height = H; lc.getContext('2d').putImageData(img, 0, 0);
    x.drawImage(lc, 0, 0);
    $('#photoPrev').src = cv.toDataURL('image/jpeg', 0.85);
    $('#photoBusy').classList.remove('on'); $('#photoEdit').classList.add('on');
    this.syncLv();
  },
};

/* =========================================================
 * ぎゃらりー
 * ======================================================= */
const Gallery = {
  urls: [],
  async open() {
    show('gallery');
    const grid = $('#workGrid');
    this.urls.forEach(u => URL.revokeObjectURL(u)); this.urls = [];
    let list = [];
    try { list = await DB.all(); } catch (e) { console.warn(e); }
    list.sort((a, b) => b.updated - a.updated);
    grid.innerHTML = '';
    if (!list.length) {
      grid.innerHTML = '<div class="none">まだ えが ないよ<br>🖍️ ぬりえを してみよう!</div>';
      return;
    }
    for (const rec of list) {
      const card = document.createElement('div'); card.className = 'work';
      const img = document.createElement('img');
      const url = URL.createObjectURL(new Blob([rec.thumb], { type: 'image/jpeg' })); this.urls.push(url);
      img.src = url; card.appendChild(img);
      card.onclick = async e => {
        if (e.target.closest('.trash')) return;
        Sound.play('tap');
        await Paint.openWork(rec);
      };
      const tr = document.createElement('button'); tr.className = 'trash';
      tr.innerHTML = '<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="20"/></svg>🗑️';
      this.holdToDelete(tr, rec.id);
      card.appendChild(tr);
      grid.appendChild(card);
    }
  },
  // けすのは 3びょう ながおし(おうちのひと むけ)
  holdToDelete(btn, id) {
    let timer = 0, done = false;
    const start = e => {
      e.preventDefault(); e.stopPropagation();
      done = false; btn.classList.add('hold');
      timer = setTimeout(async () => {
        done = true; btn.classList.remove('hold');
        if (await confirmDlg('この えを けしますか?')) { await DB.del(id); Sound.play('undo'); this.open(); }
      }, 3000);
    };
    const stop = e => {
      if (!btn.classList.contains('hold')) return;
      clearTimeout(timer); btn.classList.remove('hold');
      if (!done && e.type === 'pointerup') toast('けすときは おうちのひとが 3びょう ながおし してね', 2800);
    };
    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', stop);
    btn.addEventListener('pointerleave', stop);
    btn.addEventListener('pointercancel', stop);
    btn.addEventListener('click', e => e.stopPropagation());
    btn.addEventListener('contextmenu', e => e.preventDefault());
  },
};

/* =========================================================
 * かみふぶき・わっか
 * ======================================================= */
const FX = {
  items: [], running: false,
  add(it) { this.items.push(it); if (!this.running) { this.running = true; requestAnimationFrame(t => this.tick(t)); } },
  tick() {
    const cv = $('#fx'), dpr = Math.min(2, devicePixelRatio || 1);
    if (cv.width !== innerWidth * dpr) { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
    const x = cv.getContext('2d');
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, innerWidth, innerHeight);
    this.items = this.items.filter(it => {
      it.t += 1 / 60;
      if (it.type === 'ring') {
        const k = it.t / 0.45; if (k >= 1) return false;
        x.globalAlpha = 1 - k; x.strokeStyle = it.color === '#FFFFFF' ? '#E3CDAF' : it.color; x.lineWidth = 6 * (1 - k) + 1;
        x.beginPath(); x.arc(it.x, it.y, 10 + 50 * k, 0, Math.PI * 2); x.stroke();
        return true;
      }
      // かみふぶき
      it.vy += 0.25; it.x += it.vx; it.y += it.vy; it.vx *= 0.99; it.rot += it.vr;
      if (it.t > 2.4 || it.y > innerHeight + 30) return false;
      x.globalAlpha = Math.min(1, (2.4 - it.t) * 2);
      x.save(); x.translate(it.x, it.y); x.rotate(it.rot); x.scale(1, Math.cos(it.t * 9 + it.vr * 30));
      x.fillStyle = it.color; x.fillRect(-6, -4, 12, 8); x.restore();
      return true;
    });
    x.globalAlpha = 1;
    if (this.items.length) requestAnimationFrame(t => this.tick(t));
    else { this.running = false; x.clearRect(0, 0, innerWidth, innerHeight); }
  },
};
function confetti() {
  const cols = ['#E53935', '#FB8C00', '#FFE135', '#3DBE6B', '#1E88E5', '#8E44AD', '#FF5D8F'];
  for (let i = 0; i < 140; i++) {
    const fromLeft = i % 2 === 0;
    FX.add({
      type: 'paper', t: Math.random() * 0.2,
      x: fromLeft ? -10 : innerWidth + 10, y: innerHeight * (0.55 + Math.random() * 0.3),
      vx: (fromLeft ? 1 : -1) * (5 + Math.random() * 9), vy: -(10 + Math.random() * 9),
      rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, color: cols[i % cols.length],
    });
  }
}

/* =========================================================
 * えらぶ画面・ホーム
 * ======================================================= */
const Picker = {
  cat: store.get('cat', 'animal'),
  init() {
    const tabs = $('#tabs');
    for (const c of CATEGORIES) {
      const b = document.createElement('button'); b.className = 'tab'; b.dataset.cat = c.id;
      b.textContent = c.icon + ' ' + c.name;
      b.onclick = () => { this.cat = c.id; store.set('cat', c.id); Sound.play('tap'); this.render(); };
      tabs.appendChild(b);
    }
  },
  open() { show('pick'); this.render(); },
  render() {
    $$('#tabs .tab').forEach(b => b.classList.toggle('on', b.dataset.cat === this.cat));
    const grid = $('#picGrid'); grid.innerHTML = '';
    const cat = CATEGORIES.find(c => c.id === this.cat) || CATEGORIES[0];
    for (const p of cat.list) {
      const b = document.createElement('button'); b.className = 'pic';
      b.innerHTML = `<span class="lv">${p.lv === 1 ? '⭐' : '⭐⭐'}</span><img alt="" src="${pictureUrl(p, 240)}"><span class="nm">${p.name}</span>`;
      b.onclick = () => { Sound.play('tap'); Paint.openTemplate(p.id); };
      grid.appendChild(b);
    }
    grid.scrollTop = 0;
  },
};

function init() {
  Paint.init(); Mix.init(); Photo.init(); Picker.init();
  $('#goPick').onclick = () => { Sound.play('tap'); Picker.open(); };
  $('#goPhoto').onclick = () => { Sound.play('tap'); Photo.open(); };
  $('#goGallery').onclick = () => { Sound.play('tap'); Gallery.open(); };
  $$('[data-home]').forEach(b => b.onclick = () => { Sound.play('tap'); show('home'); });
  // ダブルタップでの かくだい・ながおしメニューを ふせぐ
  document.addEventListener('dblclick', e => e.preventDefault());
  document.addEventListener('gesturestart', e => e.preventDefault());
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
}
init();
