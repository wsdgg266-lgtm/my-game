// なぞモン 本体
(function () {
  const { LINES, svg } = window.MONSTERS;
  const QUIZ = window.QUIZ;
  const $ = id => document.getElementById(id);
  const KEY = 'nazomon-v1';
  const LV = {
    kantan: { label: 'かんたん', stars: '⭐', grade: '2ねんせい くらい', n: 3 },
    futsu: { label: 'ふつう', stars: '⭐⭐', grade: '3ねんせい くらい', n: 4 },
    muzu: { label: 'むずかしい', stars: '⭐⭐⭐', grade: '4ねんせい くらい', n: 4 },
  };
  const NEED = 2;          // しんかに ひつような マス
  const FINAL = 4;         // さいしゅう だんかい(0=たまご)

  /* ---------- ほぞん ---------- */
  let S = { sound: true, seen: {}, hist: [], seenQ: [], game: null };
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
  // モンスターの しゅるいが かわった ときは、しらない けいとうの きろくを すてる
  {
    const known = id => LINES.some(l => l.id === id);
    S.hist = (S.hist || []).filter(h => known(h.line));
    if (S.game && !S.game.players.every(p => known(p.line))) S.game = null;
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const lineOf = id => LINES.find(l => l.id === id);
  const species = p => lineOf(p.line).names[p.stage];
  const nick = (p, i) => p.stage === 0 ? `${i + 1}P の たまご` : (p.name || species(p));
  const markSeen = p => { S.seen[p.line + p.stage] = 1; };

  /* ---------- おと(Web Audio で つくる) ---------- */
  let ac = null;
  function audio() {
    if (!S.sound) return null;
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
    } catch (e) { return null; }
    return ac;
  }
  function tone(f, t, d, type = 'sine', v = 0.18) {
    const a = audio(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), s = a.currentTime + t;
    o.type = type; o.frequency.setValueAtTime(f, s);
    g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(v, s + 0.015); g.gain.exponentialRampToValueAtTime(0.001, s + d);
    o.connect(g).connect(a.destination); o.start(s); o.stop(s + d + 0.05);
  }
  const SND = {
    tap: () => tone(880, 0, 0.06, 'triangle', 0.08),
    ok: () => { tone(1047, 0, 0.18, 'triangle'); tone(1319, 0.14, 0.4, 'triangle'); },
    ng: () => { tone(330, 0, 0.18, 'square', 0.06); tone(262, 0.16, 0.3, 'square', 0.06); },
    hint: () => { tone(660, 0, 0.12, 'sine', 0.1); tone(880, 0.1, 0.18, 'sine', 0.1); },
    grow: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.07, 0.15, 'triangle', 0.1)),
    tick: f => tone(f, 0, 0.08, 'sine', 0.08),
    evolve: () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.11, i === 6 ? 0.7 : 0.16, 'triangle', 0.16)),
    crack: () => { tone(1500, 0, 0.05, 'square', 0.06); tone(1100, 0.06, 0.05, 'square', 0.06); },
    clear: () => [523, 523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, [0, .15, .3, .45, .75, 1.05, 1.2, 1.4][i], i === 7 ? 0.9 : 0.2, 'triangle', 0.16)),
  };

  /* ---------- がめん ---------- */
  let cur = 'home';
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id));
    cur = id;
    if (id === 'home') renderHome();
    if (id === 'zukan') renderZukan();
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b) SND.tap();
    const go = e.target.closest('[data-go]');
    if (go) show(go.dataset.go);
  });
  const setP = (el, i) => { el.classList.remove('p0', 'p1'); el.classList.add('p' + i); };
  const monEl = (line, stage, cls = '') => `<div class="mon ${cls}">${svg(line, stage)}</div>`;

  /* ---------- ホーム ---------- */
  function renderHome() {
    $('homeSound').textContent = S.sound ? '🔊' : '🔇';
    $('btnResume').hidden = !S.game;
    const picks = LINES.slice().sort(() => Math.random() - 0.5).slice(0, 4).map((l, i) => [l.id, [2, 3, 4, 3][i]]);
    $('parade').innerHTML = picks.map(([l, s]) => monEl(l, s)).join('');
  }
  $('homeSound').onclick = () => { S.sound = !S.sound; save(); renderHome(); };
  $('btnZukan').onclick = () => show('zukan');
  $('btnResume').onclick = () => resume();
  $('btnPlay').onclick = () => {
    if (S.game) {
      modal(`<h3>あたらしく はじめる?</h3><p>とちゅうの ゲームは きえちゃうよ</p>
        <button class="btn" data-act="new">はじめる</button><button class="btn sub" data-act="close">やめる</button>`, {
        new: () => { S.game = null; save(); closeModal(); openLevel(); },
      });
    } else openLevel();
  };

  /* ---------- むずかしさ ---------- */
  const lvPick = [null, null];
  function openLevel() {
    document.querySelectorAll('.lv-row').forEach(row => {
      const p = +row.dataset.p;
      row.innerHTML = Object.entries(LV).map(([k, v]) =>
        `<button data-lv="${k}" class="${lvPick[p] === k ? 'sel' : ''}"><b>${v.stars}</b>${v.label}</button>`).join('');
    });
    $('btnLvOk').disabled = !(lvPick[0] && lvPick[1]);
    show('level');
  }
  document.querySelectorAll('.lv-row').forEach(row => row.addEventListener('click', e => {
    const b = e.target.closest('[data-lv]'); if (!b) return;
    lvPick[+row.dataset.p] = b.dataset.lv;
    row.querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
    $('btnLvOk').disabled = !(lvPick[0] && lvPick[1]);
  }));
  $('btnLvOk').onclick = () => {
    const ids = LINES.map(l => l.id).sort(() => Math.random() - 0.5);
    S.game = {
      players: [0, 1].map(i => ({ lv: lvPick[i], line: ids[i], stage: 0, gauge: 0, name: '' })),
      turn: 0, used: [], pending: null,
    };
    S.game.players.forEach(markSeen);
    save();
    $('eggPair').innerHTML = S.game.players.map((p, i) =>
      `<div class="p${i}">${monEl(p.line, 0)}<span class="tag">${i + 1}P</span><p class="note" style="margin-top:6px">${LV[p.lv].stars} ${LV[p.lv].label}</p></div>`).join('');
    show('eggs');
  };
  $('btnStart').onclick = () => openTurn();

  /* ---------- こうたい ---------- */
  const G = () => S.game;
  const isFinal = p => p.stage >= FINAL;
  function openTurn() {
    const g = G(), i = g.turn, p = g.players[i], o = g.players[1 - i];
    setP($('turn'), i);
    $('turnMon').innerHTML = svg(p.line, p.stage);
    $('turnWho').innerHTML = p.stage === 0 ? `つぎは <span>${i + 1}P</span> の ばん!` : `つぎは <span>${i + 1}P</span><br><span>${esc(nick(p, i))}</span> の ばん!`;
    const ch = $('turnCheer');
    ch.hidden = !isFinal(p);
    if (isFinal(p)) ch.innerHTML = `📣 おうえん モード!<br>せいかいすると <b>${esc(nick(o, 1 - i))}</b> が そだつよ`;
    show('turn');
  }
  $('btnTurn').onclick = () => openQuiz();
  function resume() {
    const g = G(); if (!g) return;
    if (g.pending) return startEvolve();
    if (g.players.every(isFinal)) return openClear();
    openTurn();
  }

  /* ---------- もんだい ---------- */
  let q = null, tries = 0, lock = false;
  function pickQuiz(lv) {
    const g = G(), pool = QUIZ[lv];
    let cand = pool.filter(x => !g.used.includes(x.id) && !S.seenQ.includes(x.id));
    if (!cand.length) {   // ぜんぶ でたら その むずかしさの きろくを リセット
      S.seenQ = S.seenQ.filter(id => !pool.some(x => x.id === id));
      cand = pool.filter(x => !g.used.includes(x.id));
    }
    if (!cand.length) { g.used = g.used.filter(id => !pool.some(x => x.id === id)); cand = pool.slice(); }
    const x = cand[Math.floor(Math.random() * cand.length)];
    g.used.push(x.id); S.seenQ.push(x.id);
    return x;
  }
  function renderStatus() {
    const g = G();
    $('status').innerHTML = g.players.map((p, i) => {
      const fin = isFinal(p);
      const stars = [0, 1, 2, 3, 4].map(s => `<i class="${s <= p.stage ? 'on' : ''}">★</i>`).join('');
      const gauge = [0, 1].map(k => `<i class="${fin || k < p.gauge ? 'on' : ''}"></i>`).join('');
      return `<div class="pl p${i} ${i === g.turn ? 'now' : ''}">${monEl(p.line, p.stage)}
        <div class="info"><div class="nm">${esc(nick(p, i))}</div><div class="stars">${stars}</div><div class="gauge ${fin ? 'max' : ''}">${gauge}</div></div></div>`;
    }).join('');
  }
  function openQuiz() {
    const g = G(), p = g.players[g.turn];
    q = pickQuiz(p.lv); tries = 0; lock = false; save();
    setP($('quiz'), g.turn);
    renderStatus();
    $('qlv').textContent = `${g.turn + 1}P ・ ${LV[p.lv].stars} ${LV[p.lv].label}`;
    $('qtext').textContent = q.q;
    $('hint').className = 'hint'; $('hint').textContent = '';
    const opts = [q.a, ...q.wrong.slice(0, LV[p.lv].n - 1)].sort(() => Math.random() - 0.5);
    $('choices').innerHTML = opts.map(o => `<button class="choice">${esc(o)}</button>`).join('');
    $('choices').querySelectorAll('.choice').forEach((b, k) => { b.onclick = () => answer(b, opts[k]); });
    show('quiz');
  }
  function answer(btn, val) {
    if (lock) return;
    const g = G();
    if (val === q.a) {
      lock = true;
      btn.classList.add('ok'); SND.ok();
      const gain = tries === 0 ? 2 : 1;
      const me = g.players[g.turn], ti = isFinal(me) ? 1 - g.turn : g.turn, t = g.players[ti];
      const before = t.stage;
      t.gauge += gain;
      if (t.gauge >= NEED && t.stage < FINAL) {
        t.gauge -= NEED; t.stage++;
        if (t.stage === FINAL) t.gauge = 0;
        g.pending = { p: ti, from: before, to: t.stage };
        markSeen(t);
        if (t.stage === FINAL) S.hist.unshift({ line: t.line, name: t.name || species(t), d: Date.now() });
        S.hist = S.hist.slice(0, 30);
      }
      save();
      setTimeout(() => {
        renderStatus();
        const who = ti === g.turn ? '' : `<br>📣 おうえん パワーで ${esc(nick(t, ti))} が そだったよ!`;
        sheet(tries === 0 ? 'せいかい!' : 'せいかい!<small>ヒントで とけたね</small>', 'ok',
          `${monEl(t.line, Math.min(before, t.stage))} せいちょう +${gain}${who}`, q.why);
        if (g.pending) setTimeout(SND.grow, 300);
      }, 500);
    } else if (tries === 0) {
      tries = 1;
      btn.classList.add('ng'); btn.disabled = true; SND.ng();
      setTimeout(SND.hint, 400);
      $('hint').innerHTML = `💡 ヒント:${esc(q.hint)}`;
      $('hint').className = 'hint on';
    } else {
      lock = true;
      btn.classList.add('ng'); SND.ng();
      $('choices').querySelectorAll('.choice').forEach(b => { if (b.textContent === q.a) b.classList.add('ok'); });
      save();
      setTimeout(() => sheet(`ざんねん!<small>こたえは「${esc(q.a)}」</small>`, 'ng', 'つぎは がんばろう!', q.why), 700);
    }
  }
  function sheet(big, cls, gain, why) {
    $('shBig').innerHTML = big; $('shBig').className = 'big ' + cls;
    $('shGain').innerHTML = gain; $('shWhy').textContent = why;
    $('sheet').classList.add('on');
  }
  $('btnNext').onclick = () => {
    $('sheet').classList.remove('on');
    const g = G();
    if (g.pending) return startEvolve();
    nextTurn();
  };
  function nextTurn() {
    const g = G();
    if (g.players.every(isFinal)) return openClear();
    g.turn = 1 - g.turn; save();
    openTurn();
  }
  $('btnPause').onclick = () => modal(`<h3>ひとやすみ</h3>
    <button class="btn" data-act="close">つづける</button>
    <button class="btn sub" data-act="snd">${S.sound ? '🔊 おと オン' : '🔇 おと オフ'}</button>
    <button class="btn sub" data-act="home">🏠 ホームに もどる</button>
    <p class="note">ゲームは ほぞん されるよ。「つづきから」で また あそべるよ</p>`, {
    snd: b => { S.sound = !S.sound; save(); b.textContent = S.sound ? '🔊 おと オン' : '🔇 おと オフ'; },
    home: () => { closeModal(); show('home'); },
  });

  /* ---------- しんか ---------- */
  function startEvolve() {
    const g = G(), ev = g.pending, p = g.players[ev.p];
    setP($('evolve'), ev.p);
    const A = $('evoA'), B = $('evoB'), st = $('evoStage');
    A.innerHTML = svg(p.line, ev.from); B.innerHTML = svg(p.line, ev.to);
    A.className = 'mon'; B.className = 'mon hide'; st.className = 'stage';
    $('btnEvoOk').classList.remove('on');
    const hatch = ev.from === 0;
    $('evoMsg').innerHTML = hatch ? 'あれ? たまごの ようすが…!' : `おや? ${esc(nick(p, ev.p))} の ようすが…!`;
    show('evolve');
    let t = 600;
    if (hatch) {
      setTimeout(() => { st.classList.add('shake'); SND.crack(); }, 500);
      setTimeout(SND.crack, 950); setTimeout(SND.crack, 1400);
      t = 1900;
    }
    // ひかりながら いれかわる(だんだん はやく)
    setTimeout(() => {
      st.classList.remove('shake');
      A.classList.add('sil'); B.classList.add('sil');
      let gap = 420, flip = false, f = 500;
      const step = () => {
        flip = !flip;
        A.classList.toggle('hide', flip); B.classList.toggle('hide', !flip);
        SND.tick(f); f += 30;
        gap *= 0.84;
        if (gap > 45) setTimeout(step, gap); else finish();
      };
      step();
    }, t);
    function finish() {
      $('flash').classList.remove('go'); void $('flash').offsetWidth; $('flash').classList.add('go');
      A.className = 'mon hide'; B.className = 'mon'; st.classList.add('reveal');
      SND.evolve(); sparks();
      const nm = species(p);
      $('evoMsg').innerHTML = hatch ? `たまごが かえった!<br>${esc(nm)} が うまれたよ!` :
        `${esc(nick(p, ev.p))} は<br>${esc(nm)} に しんかした!` + (ev.to === FINAL ? '<small>さいしゅう けいたいだ!</small>' : '');
      $('btnEvoOk').classList.add('on');
    }
  }
  function sparks() {
    const em = ['✨', '⭐', '💫', '🌟'];
    for (let k = 0; k < 16; k++) {
      const s = document.createElement('div');
      s.className = 'spark'; s.textContent = em[k % em.length];
      const a = k / 16 * Math.PI * 2, r = 120 + Math.random() * 80;
      s.style.left = '50%'; s.style.top = '42%';
      s.style.setProperty('--dx', Math.cos(a) * r + 'px'); s.style.setProperty('--dy', Math.sin(a) * r + 'px');
      document.body.appendChild(s); setTimeout(() => s.remove(), 1300);
    }
  }
  $('btnEvoOk').onclick = () => {
    const g = G(), ev = g.pending;
    if (ev.from === 0) return openName(ev.p);
    g.pending = null; save();
    nextTurn();
  };

  /* ---------- なまえ ---------- */
  function openName(i) {
    const p = G().players[i];
    setP($('name'), i);
    $('nameWho').textContent = `${i + 1}P の ${species(p)}`;
    $('nameMon').innerHTML = svg(p.line, p.stage);
    $('nameInput').value = ''; $('nameInput').placeholder = species(p);
    show('name');
  }
  function setName(n) {
    const g = G(), ev = g.pending, p = g.players[ev.p];
    p.name = (n || '').trim().slice(0, 6);   // からっぽなら しゅぞく名で よぶ(しんかで かわる)
    g.pending = null; save();
    $('nameInput').blur();
    nextTurn();
  }
  $('btnNameOk').onclick = () => setName($('nameInput').value);
  $('btnNameAuto').onclick = () => setName('');
  $('nameInput').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) setName($('nameInput').value); });

  /* ---------- クリア ---------- */
  function openClear() {
    const g = G();
    $('duo').innerHTML = g.players.map((p, i) => `<div class="p${i}">${monEl(p.line, p.stage)}
      <div class="nm"><span class="tag" style="font-size:14px;padding:2px 10px">${i + 1}P</span> ${esc(nick(p, i))}</div><div class="sp">${esc(species(p))}</div></div>`).join('');
    S.game = null; save();
    show('clear');
    SND.clear(); confetti();
  }
  function confetti() {
    const cols = ['#FF6B6B', '#4D96FF', '#FFC93C', '#6CC56A', '#B79CFF', '#FF9EC0'];
    for (let k = 0; k < 70; k++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = cols[k % cols.length];
      c.style.animationDuration = 2.5 + Math.random() * 2.5 + 's';
      c.style.animationDelay = Math.random() * 1.2 + 's';
      document.body.appendChild(c); setTimeout(() => c.remove(), 6500);
    }
  }
  $('btnAgain').onclick = () => openLevel();
  $('btnClearZukan').onclick = () => show('zukan');

  /* ---------- ずかん ---------- */
  function renderZukan() {
    const total = LINES.length * 5, got = LINES.reduce((n, l) => n + [0, 1, 2, 3, 4].filter(s => S.seen[l.id + s]).length, 0);
    $('zkCount').textContent = `みつけた モンスター ${got} / ${total}`;
    $('zkRows').innerHTML = LINES.map(l => `<div class="zk-row"><h3>${l.icon} ${l.label}</h3><div class="zk-cells">` +
      [0, 1, 2, 3, 4].map(s => `<button class="${S.seen[l.id + s] ? '' : 'no'}" data-l="${l.id}" data-s="${s}" aria-label="${S.seen[l.id + s] ? l.names[s] : 'まだ みつけて いない'}">${svg(l.id, s)}</button>`).join('') +
      '</div></div>').join('');
    $('zkHist').innerHTML = S.hist.length ? '<h3>🏆 そだてた モンスター</h3>' + S.hist.map(h => {
      const l = lineOf(h.line), d = new Date(h.d);
      return `<div class="item">${monEl(h.line, FINAL)}<div><b>${esc(h.name)}</b><span>${esc(l.names[FINAL])} ・ ${d.getMonth() + 1}がつ${d.getDate()}にち</span></div></div>`;
    }).join('') : '';
  }
  $('zkRows').addEventListener('click', e => {
    const b = e.target.closest('[data-l]'); if (!b) return;
    const l = lineOf(b.dataset.l), s = +b.dataset.s;
    if (!S.seen[l.id + s]) return modal(`<h3>???</h3><div class="mon" style="filter:brightness(0);opacity:.15">${svg(l.id, s)}</div><p>まだ みつけて いないよ。<br>なぞなぞで そだてて みよう!</p><button class="btn" data-act="close">とじる</button>`);
    modal(`<h3>${esc(l.names[s])}</h3>${monEl(l.id, s)}<p class="note">${l.icon} ${l.label} ・ だんかい ${s + 1}</p><p>${esc(l.notes[s])}</p><button class="btn" data-act="close">とじる</button>`);
  });

  /* ---------- ダイアログ ---------- */
  function modal(html, acts = {}) {
    $('modalBox').innerHTML = html; $('modal').classList.add('on');
    $('modalBox').onclick = e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'close') return closeModal();
      acts[b.dataset.act] && acts[b.dataset.act](b);
    };
  }
  function closeModal() { $('modal').classList.remove('on'); }
  $('modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });

  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  // テスト用に すこしだけ そとから さわれるように する
  window.NAZOMON = { state: () => S };
  show('home');
})();
