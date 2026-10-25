// なぞモン モンスターの絵の部品
// 絵はすべて 200×200 の SVG をその場で組み立てる。
// 体のつくり(chibi・dragon・quad・bird・turtle・golem・plant・human・fish・ghost・jelly・serpent・whale・tree・biped)ごとに
// lv(0=あかちゃん … 3=さいしゅう)に合わせて描き分ける。けいとうごとの ちがいは o(オプション)で わたす
(function () {
  let uid = 0;
  const nid = () => ++uid;

  /* ---------- きほんの どうぐ ---------- */
  const st = (c, w = 4) => `stroke="${c.dark}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const shadow = (w = 56, op = 0.12) => `<ellipse cx="100" cy="186" rx="${w}" ry="8" fill="#000" opacity="${op}"/>`;
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mixc = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
  const MIR = s => `<g transform="matrix(-1 0 0 1 200 0)">${s}</g>`;
  const both = s => s + MIR(s);
  const wrap = (sc, s, cx = 100, cy = 186) => sc === 1 ? s : `<g transform="translate(${cx} ${cy}) scale(${sc}) translate(${-cx} ${-cy})">${s}</g>`;
  const grad = (id, col) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mixc(col, '#ffffff', 0.3)}"/><stop offset=".55" stop-color="${col}"/><stop offset="1" stop-color="${mixc(col, '#000000', 0.22)}"/></linearGradient></defs>`;
  const aura = (id, col) => `<defs><radialGradient id="au${id}"><stop offset="0" stop-color="${col}" stop-opacity=".6"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs><circle cx="100" cy="104" r="98" fill="url(#au${id})"/>`;
  function starPath(cx, cy, R, r, n = 5, rot = -90) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = (rot + i * 180 / n) * Math.PI / 180, rr = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
    }
    return d + 'Z';
  }
  const star = (c, x, y, R, col, w = 3) => `<path d="${starPath(x, y, R, R * 0.48)}" fill="${col || c.acc}" ${w ? st(c, w) : ''}/>`;
  const sparkle = (x, y, r, col = '#fff') => `<path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z" fill="${col}"/>`;
  const flame = (c, x, y, s = 1, col) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -30 C10 -20 16 -10 12 0 C10 8 4 12 0 12 C-4 12 -10 8 -12 0 C-14 -8 -8 -14 -6 -22 C-2 -16 0 -20 0 -30Z" fill="${col || c.acc}" ${st(c, 4 / s)}/><path transform="translate(${x} ${y}) scale(${s})" d="M0 -12 C5 -6 6 0 3 5 C1 7 -1 7 -3 5 C-6 1 -3 -5 0 -12Z" fill="#FFF3B0"/>`;
  const bolt = (c, x, y, s = 1, col) => `<path transform="translate(${x} ${y}) scale(${s})" d="M4 -22 L-10 2 L-1 2 L-5 22 L10 -4 L1 -4 Z" fill="${col || c.acc}" ${st(c, 3 / s)}/>`;
  const leaf = (c, x, y, rot, s = 1, col) => `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 0 C10 -10 10 -30 0 -40 C-10 -30 -10 -10 0 0Z" fill="${col || c.main}" ${st(c, 3.5 / s)}/><path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 -4 L0 -32" ${st(c, 2.5 / s)} fill="none"/>`;
  const crystal = (c, x, y, h, rot = 0, col) => `<path transform="translate(${x} ${y}) rotate(${rot})" d="M0 ${-h} L${h * 0.32} ${-h * 0.45} L${h * 0.22} 0 L${-h * 0.22} 0 L${-h * 0.32} ${-h * 0.45}Z" fill="${col || '#E6FAFF'}" ${st(c, 3)}/><path transform="translate(${x} ${y}) rotate(${rot})" d="M0 ${-h * 0.92} L0 ${-h * 0.1}" stroke="#fff" stroke-width="2" opacity=".8"/>`;
  const tube = (c, d, w, col) => `<path d="${d}" ${st(c, w)} fill="none"/><path d="${d}" stroke="${col || c.main}" stroke-width="${w - 7}" fill="none" stroke-linecap="round"/>`;
  const tailCurl = (c, x, y, s, w, col) => tube(c, `M${x} ${y} C${x + 30 * s} ${y + 4 * s} ${x + 40 * s} ${y - 30 * s} ${x + 24 * s} ${y - 44 * s} C${x + 12 * s} ${y - 54 * s} ${x + 2 * s} ${y - 40 * s} ${x + 14 * s} ${y - 34 * s}`, w, col);
  const gear = (c, x, y, r, col = '#FFB020') => `<path d="${starPath(x, y, r, r * 0.78, 8, -90)}" fill="${col}" ${st(c, 2.5)}/><circle cx="${x}" cy="${y}" r="${r * 0.35}" fill="${c.dark}"/>`;
  const crown = (c, x, y, s = 1, col = '#FFD84D', gem = '#FF5D8F') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 0 L-24 -22 L-11 -10 L0 -28 L11 -10 L24 -22 L22 0Z" fill="${col}" ${st(c, 3.5 / s)}/><circle cx="0" cy="-8" r="4" fill="${gem}"/></g>`;
  // くもの ような かたまり(はっぱ・くも)。ふちを まとめて かく
  const cloud = (c, list, col, line) => `<g fill="${line || c.dark}">${list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 3.5}"/>`).join('')}</g>` +
    `<g fill="${col}">${list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>` +
    `<g fill="#fff" opacity=".22">${list.map(([x, y, r]) => `<circle cx="${x - r * 0.25}" cy="${y - r * 0.3}" r="${r * 0.5}"/>`).join('')}</g>`;

  /* ---------- かお ---------- */
  function cuteFace(c, cx, cy, s = 1, o = {}) {
    let h = '';
    for (const d of [-1, 1]) {
      const x = cx + d * 17 * s;
      h += `<ellipse cx="${x}" cy="${cy}" rx="${6 * s}" ry="${8 * s}" fill="#2B2340"/>`;
      h += `<circle cx="${x - 2 * s}" cy="${cy - 3.5 * s}" r="${2.6 * s}" fill="#fff"/>`;
      h += `<circle cx="${x + 2.2 * s}" cy="${cy + 3 * s}" r="${1.2 * s}" fill="#fff" opacity=".8"/>`;
      h += `<ellipse cx="${cx + d * 30 * s}" cy="${cy + 11 * s}" rx="${6.5 * s}" ry="${4 * s}" fill="#FF7F9E" opacity=".55"/>`;
    }
    if (!o.noMouth) h += `<path d="M${cx - 6 * s} ${cy + 10 * s} Q${cx} ${cy + 17 * s} ${cx + 6 * s} ${cy + 10 * s}" ${st(c, 3 * s)} fill="none"/>`;
    return h;
  }
  const eyeOne = (c, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">` +
    `<path d="M-10 1 L-9 -3 Q1 -6 13 -10 Q12 3 2 6 Q-6 7 -10 1Z" fill="#fff" ${st(c, 2.2)}/>` +
    `<circle cx="1.8" cy="0.2" r="4.6" fill="${c.iris}"/><ellipse cx="1.8" cy="0.2" rx="1.5" ry="4" fill="#1A1424"/>` +
    `<circle cx="3.6" cy="-1.8" r="1.4" fill="#fff"/><path d="M-13 -1 Q0 -8 16 -14" ${st(c, 4.2)} fill="none"/></g>`;
  const coolEyes = (c, cx, cy, s) => eyeOne(c, cx + 16 * s, cy, s) + `<g transform="translate(${2 * cx} 0) scale(-1 1)">${eyeOne(c, cx + 16 * s, cy, s)}</g>`;
  function mouth(c, cx, my, s, kind) {
    if (kind === 'roar') {
      return `<path d="M${cx - 13 * s} ${my - 3 * s} Q${cx} ${my - 6 * s} ${cx + 13 * s} ${my - 3 * s} Q${cx + 9 * s} ${my + 14 * s} ${cx} ${my + 14 * s} Q${cx - 9 * s} ${my + 14 * s} ${cx - 13 * s} ${my - 3 * s}Z" fill="#6E1F2E" ${st(c, 3 * s)}/>` +
        `<ellipse cx="${cx}" cy="${my + 9 * s}" rx="${6 * s}" ry="${3 * s}" fill="#E0566E"/>` +
        [-1, 1].map(d => `<path d="M${cx + d * 10 * s} ${my - 3.5 * s} L${cx + d * 7.5 * s} ${my + 5 * s} L${cx + d * 5 * s} ${my - 4.2 * s}Z" fill="#fff"/>` +
          `<path d="M${cx + d * 7 * s} ${my + 12.5 * s} L${cx + d * 5.5 * s} ${my + 7 * s} L${cx + d * 4 * s} ${my + 13 * s}Z" fill="#fff"/>`).join('');
    }
    if (kind === 'shark') {
      let t = '';
      for (let k = 0; k < 6; k++) { const x = cx - 11 * s + k * 4.4 * s; t += `<path d="M${x} ${my - 0.5 * s} L${x + 2.2 * s} ${my + 4 * s} L${x + 4.4 * s} ${my}Z" fill="#fff"/>`; }
      return `<path d="M${cx - 15 * s} ${my - 3 * s} Q${cx} ${my + 13 * s} ${cx + 15 * s} ${my - 3 * s} Q${cx} ${my + 1 * s} ${cx - 15 * s} ${my - 3 * s}Z" fill="#6E1F2E" ${st(c, 3 * s)}/>` + t;
    }
    return `<path d="M${cx - 11 * s} ${my} Q${cx} ${my + 6 * s} ${cx + 11 * s} ${my - 3 * s}" ${st(c, 3 * s)} fill="none"/>` +
      `<path d="M${cx + 3 * s} ${my + 2.4 * s} L${cx + 5 * s} ${my + 7.5 * s} L${cx + 7.2 * s} ${my + 1.4 * s}Z" fill="#fff" ${st(c, 1.6 * s)}/>`;
  }
  const faceFor = (c, lv, cx, cy, s, my, kind) => lv === 0 ? cuteFace(c, cx, cy, s) : coolEyes(c, cx, cy, s) + mouth(c, cx, my, s * 0.9, kind || (lv === 3 ? 'roar' : 'grin'));
  const X = (o, c, id, lv) => (o.x ? o.x(c, id, lv) : {}) || {};

  /* ---------- あかちゃん(まるい からだ) ---------- */
  function chibi(c, id, o = {}) {
    const g = 'g' + id, F = `url(#${g})`;
    let back = '', mid = '', top = '';
    const T = {
      dragon: tube(c, 'M136 158 C158 162 172 150 174 132', 11) + `<path d="M174 134 L164 124 L182 120Z" fill="${c.acc}" ${st(c, 2.5)}/>`,
      fluffy: `<path d="M132 164 C156 168 174 150 170 120 C164 130 158 134 150 136 C156 126 156 116 152 108 C146 128 136 144 128 152Z" fill="${o.tailCol || F}" ${st(c)}/>`,
      cat: tailCurl(c, 134, 160, 0.9, 11),
      flame: tube(c, 'M136 158 C158 162 170 150 172 134', 11) + flame(c, 172, 128, 0.6, o.flameCol),
      lion: tube(c, 'M134 160 C156 166 170 156 170 138', 9) + `<circle cx="170" cy="134" r="7" fill="${o.mane || c.acc}" ${st(c, 3)}/>`,
      feather: `<path d="M134 156 C150 160 164 156 174 146 C168 160 160 168 146 170Z" fill="${c.acc}" ${st(c, 3)}/>`,
    };
    if (o.tail) back += T[o.tail];
    if (o.wings === 'bat') back += both(`<path d="M66 118 C52 100 40 96 30 100 C36 106 36 112 34 118 C42 116 46 122 44 128 C52 124 58 128 62 134Z" fill="${o.wingCol || c.dark}" ${st(c, 3)}/>`);
    if (o.wings === 'bird') mid += both(`<path d="M58 124 C44 128 40 146 48 158 C54 150 60 142 64 132Z" fill="${o.wingCol || F}" ${st(c, 3)}/>`);
    const E = {
      pointed: both(`<path d="M72 106 L62 74 L90 96Z" fill="${F}" ${st(c)}/><path d="M72 100 L67 82 L84 96Z" fill="${o.earIn || c.belly}"/>`),
      round: both(`<circle cx="70" cy="98" r="12" fill="${F}" ${st(c)}/><circle cx="70" cy="98" r="5" fill="${c.belly}"/>`),
      deer: both(`<path d="M66 106 C52 96 40 98 34 104 C42 112 56 114 68 112Z" fill="${F}" ${st(c)}/>`),
      horn: both(`<path d="M80 98 C74 88 74 78 80 70 C84 80 88 86 92 92Z" fill="${o.hornCol || c.belly}" ${st(c, 3)}/>`),
      fin: both(`<path d="M60 116 L40 104 L48 128Z" fill="${c.acc}" ${st(c, 3)}/>`),
    };
    if (o.ears) back += E[o.ears];
    const C = {
      flame: flame(c, 100, 92, 0.8, o.crestCol),
      plume: [-1, 0, 1].map(k => `<path d="M${100 + k * 7} 94 C${100 + k * 14} 82 ${100 + k * 16} 74 ${100 + k * 12} 66 C${100 + k * 6} 74 ${100 + k * 2} 84 ${100 + k} 94Z" fill="${o.crestCol || c.acc}" ${st(c, 2.5)}/>`).join(''),
      bolt: bolt(c, 100, 80, 0.55, o.crestCol),
      crystal: crystal(c, 90, 96, 16, -18) + crystal(c, 110, 96, 16, 18) + crystal(c, 100, 94, 22),
      tuft: `<path d="M90 96 C90 82 96 78 100 70 C104 78 110 82 110 96Z" fill="${o.mane || c.acc}" ${st(c, 3)}/>`,
      orb: `<path d="M100 92 Q104 82 100 74" ${st(c, 3.5)} fill="none"/><circle cx="100" cy="70" r="7" fill="${c.acc}" ${st(c, 2.5)}/>`,
      gear: gear(c, 100, 88, 11, c.acc),
      horn1: `<path d="M94 94 L100 70 L106 94Z" fill="${o.hornCol || c.belly}" ${st(c, 3)}/>`,
      antler: both(`<path d="M86 94 L82 78 M83 84 L76 80" ${st(c, 5)} fill="none"/><path d="M86 94 L82 78 M83 84 L76 80" stroke="#E8D3A8" stroke-width="2" fill="none" stroke-linecap="round"/>`),
    };
    if (o.crest) top += C[o.crest];
    let spots = '';
    if (o.spots) spots = [[74, 122], [128, 126], [84, 112], [120, 108]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="none" stroke="${o.spotCol || c.dark}" stroke-width="2.4" opacity=".7"/>`).join('');
    if (o.dots) spots = [[74, 118], [128, 120], [88, 108], [114, 106], [70, 136]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff" opacity=".85"/>`).join('');
    const beak = o.beak ? `<path d="M92 136 L108 136 L100 147Z" fill="${o.beak}" ${st(c, 2.5)}/>` : '';
    const feet = both(`<ellipse cx="80" cy="172" rx="13" ry="8" fill="${F}" ${st(c)}/>`);
    return grad(g, c.main) + shadow(44) + back + feet +
      `<ellipse cx="100" cy="132" rx="46" ry="42" fill="${F}" ${st(c)}/><ellipse cx="100" cy="146" rx="26" ry="20" fill="${c.belly}"/>` +
      spots + mid + top + cuteFace(c, 100, 128, 1, { noMouth: !!o.beak }) + beak + (o.extra || '');
  }

  /* ---------- 2ほんあしで たつ からだ ---------- */
  function biped(c, id, o, lv) {
    const g = 'bp' + id, F = `url(#${g})`;
    const sc = o.sc || [0, 0.8, 0.9, 0.95][lv], hs = o.hs || [0, 1.2, 1.06, 1][lv];
    const leg = `<path d="M72 142 C60 150 58 166 64 176 L57 184 L67 181 L72 186 L77 181 L87 184 L83 172 C89 162 90 150 86 142Z" fill="${F}" ${st(c)}/>` +
      `<path d="M57 184 L60 178 M72 186 L72 180 M87 184 L84 178" stroke="#FFF6E0" stroke-width="3" stroke-linecap="round"/>`;
    const arm = `<path d="M66 100 C50 102 42 118 44 134 C45 142 50 146 56 145 C62 144 66 138 66 130 C66 120 72 112 78 108Z" fill="${F}" ${st(c)}/>` +
      `<path d="M46 141 L44 150 L50 144Z M51 145 L51 154 L55 146Z M57 145 L59 153 L61 144Z" fill="#FFF6E0" ${st(c, 2)}/>`;
    const torso = `<path d="M64 98 C54 112 58 140 72 154 C84 162 116 162 128 154 C142 140 146 112 136 98 C122 88 78 88 64 98Z" fill="${F}" ${st(c)}/>`;
    const pl = mixc(c.belly, c.dark, 0.3);
    const bellyP = `<path d="M84 104 C78 122 82 142 90 152 C96 156 104 156 110 152 C118 142 122 122 116 104 C108 99 92 99 84 104Z" fill="${c.belly}"/>` +
      `<path d="M85 118 Q100 123 115 118 M83 132 Q100 137 117 132 M87 145 Q100 150 113 145" stroke="${pl}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    const head = `<path d="M68 72 C64 52 80 36 100 36 C120 36 136 52 132 72 C130 90 116 100 100 100 C84 100 70 90 68 72Z" fill="${F}" ${st(c)}/>`;
    const muzzle = o.muzzle ? `<ellipse cx="100" cy="86" rx="17" ry="11" fill="${c.belly}"/>` +
      (o.muzzle === 'snout' ? `<ellipse cx="94" cy="82" rx="2.2" ry="1.6" fill="${c.dark}"/><ellipse cx="106" cy="82" rx="2.2" ry="1.6" fill="${c.dark}"/>` : `<ellipse cx="100" cy="80" rx="4.5" ry="3" fill="${c.dark}"/>`) : '';
    const headAll = (o.headBack || '') + head + muzzle + (o.head || '') + coolEyes(c, 100, 66, 1.1) +
      mouth(c, 100, o.muzzle ? 90 : 85, 1.1, o.mouth || (lv === 3 ? 'roar' : 'grin')) + (o.headTop || '');
    const all = (o.back || '') + both(leg) + torso + bellyP + (o.body || '') + both(arm) + (o.arms || '') +
      `<g transform="translate(100 98) scale(${hs}) translate(-100 -98)">${headAll}</g>` + (o.front || '');
    return grad(g, c.main) + (o.aura || '') + shadow(62 * sc) + wrap(sc, all) + (o.over || '');
  }

  /* ---------- りゅう ---------- */
  const WING = 'M68 104 C44 68 18 52 2 60 C12 68 14 78 10 88 C22 84 28 92 24 104 C36 98 44 106 42 118 C52 110 60 112 68 118Z';
  function dragon(c, id, o, lv) {
    if (lv === 0) return chibi(c, id, o.baby);
    const x = X(o, c, id, lv);
    const hk = [0, 0.7, 0.9, 1.1][lv], hc = o.hornCol || c.belly;
    const H = {
      curve: `<path d="M80 46 C66 38 60 22 66 6 C72 22 82 30 92 36Z" fill="${hc}" ${st(c, 3.5)}/>`,
      straight: `<path d="M82 44 L70 6 L92 38Z" fill="${hc}" ${st(c, 3.5)}/>`,
      spike: `<path d="M80 44 L60 12 L76 24 L72 2 L92 36Z" fill="${hc}" ${st(c, 3.5)}/>`,
      crystal: crystal(c, 82, 46, 38, -24, hc),
    };
    const horns = both(`<g transform="translate(86 44) scale(${hk}) translate(-86 -44)">${H[o.horn || 'curve']}</g>`);
    const wk = [0, 0.5, 0.85, 1.05][lv], wc = o.wingCol || c.dark, wm = mixc(wc, '#ffffff', 0.38);
    const wing = both(`<g transform="translate(68 110) scale(${wk}) translate(-68 -110)"><path d="${WING}" fill="${wc}" ${st(c, 4 / wk)}/>` +
      `<path d="M66 106 L12 64 M66 110 L22 90 M66 114 L36 104" stroke="${wm}" stroke-width="${2.5 / wk}" fill="none" stroke-linecap="round"/></g>`);
    const tw = [0, 13, 16, 18][lv];
    const TIP = {
      flame: flame(c, 178, 98, 0.8 + lv * 0.15, o.tipCol),
      fin: `<path d="M178 104 L164 88 L190 90Z" fill="${c.acc}" ${st(c, 3)}/>`,
      spike: `<path d="M178 104 L168 84 L190 90Z" fill="${o.tipCol || c.belly}" ${st(c, 3)}/>`,
      crystal: crystal(c, 178, 106, 18 + lv * 4, 10),
      orb: `<circle cx="178" cy="100" r="${6 + lv * 2}" fill="${c.acc}" ${st(c, 3)}/><circle cx="178" cy="100" r="${12 + lv * 3}" fill="${c.acc}" opacity=".25"/>`,
    };
    const tail = tube(c, 'M122 150 C156 158 180 136 178 104', tw) + TIP[o.tip || 'spike'];
    const spikes = lv >= 2 ? both(`<path d="M62 96 L46 86 L54 102Z" fill="${o.spikeCol || c.acc}" ${st(c, 3)}/>`) : '';
    return biped(c, id, {
      muzzle: 'snout', aura: lv === 3 ? aura(id, o.aura || c.acc) : '',
      back: (x.back0 || '') + (lv >= 1 ? wing : '') + tail + (x.back || ''),
      body: x.body, arms: spikes + (x.arms || ''), headBack: (x.headBack || '') + horns, head: x.head, headTop: x.headTop,
      front: x.front, over: x.over,
    }, lv);
  }

  /* ---------- 4ほんあしの けもの(すわった すがた) ---------- */
  function quad(c, id, o, lv) {
    if (lv === 0) return chibi(c, id, o.baby);
    const g = 'q' + id, F = `url(#${g})`;
    const sc = [0, 0.8, 0.9, 0.96][lv], hs = [0, 1.22, 1.08, 1][lv];
    const x = X(o, c, id, lv), mane = o.mane || c.acc;
    const TAIL = {
      bushy: `<path d="M128 172 C162 174 186 150 180 110 C172 120 166 126 156 128 C166 116 168 104 164 92 C152 116 136 142 122 158Z" fill="${o.tailCol || F}" ${st(c)}/>`,
      lion: tube(c, 'M130 172 C162 178 180 158 176 128', 10) + `<path d="M176 130 C164 126 164 110 176 102 C188 110 188 126 176 130Z" fill="${mane}" ${st(c, 3)}/>`,
      cat: tailCurl(c, 128, 174, 1.25, 12),
      deer: `<path d="M132 160 C140 150 146 146 150 148 C150 156 144 162 136 166Z" fill="${c.belly}" ${st(c, 3)}/>`,
      long: tube(c, 'M128 174 C170 182 192 150 180 116 C174 102 182 92 190 96', 16),
    };
    const HEAD = {
      canine: 'M70 68 C68 48 82 36 100 36 C118 36 132 48 130 68 C130 84 120 94 112 98 L100 106 L88 98 C80 94 70 84 70 68Z',
      feline: 'M66 72 C64 50 80 40 100 40 C120 40 136 50 134 72 C132 90 118 100 100 100 C82 100 68 90 66 72Z',
      deer: 'M76 64 C76 46 88 38 100 38 C112 38 124 46 124 64 C124 82 112 104 100 106 C88 104 76 82 76 64Z',
    };
    const ht = o.head || 'canine';
    const EARS = {
      pointed: both(`<path d="M76 54 L64 14 L94 40Z" fill="${F}" ${st(c)}/><path d="M76 47 L69 24 L88 40Z" fill="${o.earIn || c.belly}"/>`),
      round: both(`<circle cx="72" cy="50" r="13" fill="${F}" ${st(c)}/><circle cx="72" cy="50" r="6" fill="${c.belly}"/>`),
      deer: both(`<path d="M80 56 C64 46 52 48 44 54 C52 64 66 66 82 62Z" fill="${F}" ${st(c)}/><path d="M76 57 C66 52 58 53 52 56 C60 61 68 61 77 60Z" fill="${c.belly}"/>`),
    };
    const MUZ = {
      canine: `<ellipse cx="100" cy="88" rx="15" ry="12" fill="${c.belly}"/><ellipse cx="100" cy="81" rx="6" ry="4" fill="${c.dark}"/>`,
      feline: `<circle cx="93" cy="87" r="8" fill="${c.belly}"/><circle cx="107" cy="87" r="8" fill="${c.belly}"/><path d="M96 80 L104 80 L100 85Z" fill="${c.dark}"/>` +
        both(`<path d="M84 86 L68 82 M84 90 L68 92" stroke="${c.dark}" stroke-width="2" stroke-linecap="round"/>`),
      deer: `<ellipse cx="100" cy="96" rx="11" ry="8" fill="${c.belly}"/><ellipse cx="100" cy="92" rx="5" ry="3.2" fill="${c.dark}"/>`,
    };
    const ey = { canine: 64, feline: 68, deer: 64 }[ht], my = { canine: 95, feline: 95, deer: 103 }[ht], es = ht === 'deer' ? 0.9 : 1;
    let maneS = '';
    if (o.lion) {
      const R = [0, 46, 58, 66][lv];
      maneS = `<path d="${starPath(100, 70, R, R * 0.72, 14)}" fill="${mane}" ${st(c)}/>` + (lv >= 2 ? `<path d="${starPath(100, 70, R * 0.8, R * 0.6, 14, -77)}" fill="${mixc(mane, '#ffffff', 0.25)}"/>` : '');
    }
    const ruff = o.ruff ? `<path d="M66 84 L58 100 L72 98 L68 114 L84 106 L88 120 L100 110 L112 120 L116 106 L132 114 L128 98 L142 100 L134 84Z" fill="${o.ruff}" ${st(c, 3)}/>` : '';
    let ant = '';
    if (o.antler) {
      const k = [0, 0.45, 0.8, 1.15][lv], ac = o.antlerCol || '#E8D3A8';
      const d = 'M86 42 C80 28 72 18 60 12 M76 26 C70 24 62 26 56 32 M68 18 C66 10 68 4 72 0';
      ant = both(`<g transform="translate(86 42) scale(${k}) translate(-86 -42)"><path d="${d}" stroke="${c.dark}" stroke-width="${9 / k}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${ac}" stroke-width="${5 / k}" stroke-linecap="round" fill="none"/></g>`);
    }
    const haunch = `<ellipse cx="66" cy="160" rx="27" ry="23" fill="${F}" ${st(c)}/><ellipse cx="56" cy="181" rx="14" ry="6" fill="${F}" ${st(c, 3)}/>`;
    const chest = `<path d="M74 100 C62 122 64 152 76 174 L124 174 C136 152 138 122 126 100Z" fill="${F}" ${st(c)}/>` +
      `<path d="M86 100 C80 122 82 146 90 164 L110 164 C118 146 120 122 114 100Z" fill="${c.belly}"/>`;
    const leg = `<path d="M78 126 C75 148 75 168 77 182 L97 182 C98 168 98 146 96 126Z" fill="${F}" ${st(c)}/>` +
      `<path d="M84 182 L84 176 M90 182 L90 176" stroke="${c.dark}" stroke-width="2.5" stroke-linecap="round"/>` +
      (lv >= 2 ? `<path d="M80 182 L79 187 L84 183Z M86 182 L86 187 L90 183Z M92 182 L93 187 L96 182Z" fill="#FFF6E0" ${st(c, 1.5)}/>` : '');
    const headAll = (x.headBack || '') + maneS + ant + EARS[o.ears || 'pointed'] + `<path d="${HEAD[ht]}" fill="${F}" ${st(c)}/>` + MUZ[ht] + (x.head || '') +
      coolEyes(c, 100, ey, es) + mouth(c, 100, my, ht === 'deer' ? 0.65 : 0.8, lv === 3 ? 'roar' : 'grin') + (x.headTop || '');
    const all = (x.back || '') + (TAIL[o.tail || 'bushy']) + both(haunch) + chest + (x.body || '') + both(leg) + ruff +
      `<g transform="translate(100 104) scale(${hs}) translate(-100 -104)">${headAll}</g>`;
    return grad(g, c.main) + (lv === 3 ? aura(id, o.aura || c.acc) : '') + shadow(62 * sc) + wrap(sc, all) + (x.front || '');
  }

  /* ---------- とり ---------- */
  function bird(c, id, o, lv) {
    if (lv === 0) return chibi(c, id, o.baby);
    const g = 'b' + id, F = `url(#${g})`;
    const sc = [0, 0.8, 0.9, 0.96][lv], hs = [0, 1.25, 1.08, 1][lv];
    const x = X(o, c, id, lv), wc = o.wingCol || F, wl = mixc(c.dark, '#ffffff', 0.35);
    const open = k => both(`<g transform="translate(74 112) scale(${k}) translate(-74 -112)"><path d="M76 104 C54 82 28 70 4 72 C14 80 16 86 12 92 C26 92 32 98 28 106 C40 106 46 112 42 122 C54 118 64 120 72 128Z" fill="${wc}" ${st(c, 4 / k)}/>` +
      `<path d="M70 110 L18 80 M70 116 L30 100 M70 122 L44 114" stroke="${wl}" stroke-width="${2.5 / k}" fill="none" stroke-linecap="round"/></g>`);
    const fold = both(`<path d="M66 106 C50 116 48 146 60 164 C68 152 72 130 74 110Z" fill="${wc}" ${st(c)}/>`);
    const tc = o.tailCol || wc;
    const tail = lv === 1 ? `<path d="M94 162 L100 184 L106 162Z" fill="${tc}" ${st(c, 3)}/>` :
      both(`<path d="M94 158 C86 174 76 184 64 190 C82 192 96 184 102 170Z" fill="${tc}" ${st(c, 3)}/>`) + `<path d="M95 164 L100 196 L105 164Z" fill="${tc}" ${st(c, 3)}/>`;
    const lc = o.legCol || '#F2A93B';
    const legs = o.paws ? both(`<ellipse cx="84" cy="178" rx="13" ry="9" fill="${o.pawCol || c.main}" ${st(c)}/><path d="M78 186 L77 190 L81 186Z M84 187 L84 191 L87 187Z M90 186 L91 190 L93 185Z" fill="#FFF6E0" ${st(c, 1.5)}/>`) :
      both(`<path d="M88 166 L88 182" stroke="${c.dark}" stroke-width="9" stroke-linecap="round"/><path d="M88 166 L88 182" stroke="${lc}" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M78 186 L88 181 L98 186 M88 181 L88 188" stroke="${c.dark}" stroke-width="3" stroke-linecap="round" fill="none"/>`);
    const bl = mixc(c.belly, c.dark, 0.28);
    const body = `<path d="M100 74 C128 74 140 104 138 132 C136 160 120 174 100 174 C80 174 64 160 62 132 C60 104 72 74 100 74Z" fill="${F}" ${st(c)}/>` +
      `<path d="M100 98 C116 98 122 122 120 140 C118 158 110 166 100 166 C90 166 82 158 80 140 C78 122 84 98 100 98Z" fill="${c.belly}"/>` +
      `<path d="M86 118 q7 6 14 0 q7 6 14 0 M84 134 q8 6 16 0 q8 6 16 0 M88 150 q6 5 12 0 q6 5 12 0" stroke="${bl}" stroke-width="2" fill="none"/>`;
    const hc = o.headCol || F;
    const CREST = {
      plume: both(`<path d="M90 44 C84 28 76 20 66 16 C72 28 78 38 86 48Z" fill="${o.crestCol || c.acc}" ${st(c, 3)}/>`) + `<path d="M100 40 C98 24 102 14 108 6 C110 20 108 32 104 42Z" fill="${o.crestCol || c.acc}" ${st(c, 3)}/>`,
      flame: flame(c, 86, 46, 0.7, o.crestCol) + flame(c, 114, 46, 0.7, o.crestCol) + flame(c, 100, 40, 1, o.crestCol),
      bolt: bolt(c, 84, 40, 0.55, o.crestCol) + bolt(c, 116, 40, 0.55, o.crestCol) + bolt(c, 100, 32, 0.8, o.crestCol),
      tuft: both(`<path d="M80 52 C70 46 66 38 66 30 C74 36 82 40 88 44Z" fill="${hc}" ${st(c, 3)}/>`),
    };
    const beakC = o.beak || '#FFB43C';
    const headAll = (x.headBack || '') + (CREST[o.crest] || '') + `<circle cx="100" cy="64" r="28" fill="${hc}" ${st(c)}/>` + (x.head || '') +
      coolEyes(c, 100, 62, 0.85) + `<path d="M90 72 L110 72 L105 84 Q100 92 95 84Z" fill="${beakC}" ${st(c, 3)}/><path d="M92 76 L108 76" stroke="${mixc(beakC, '#000000', 0.3)}" stroke-width="2"/>`;
    const wings = lv === 1 ? '' : open(lv === 2 ? 0.85 : 1.05);
    const all = (x.back || '') + tail + wings + (o.paws && lv >= 2 ? tube(c, 'M130 166 C158 172 172 160 172 140', 9) + `<path d="M172 142 C162 138 162 124 172 118 C182 124 182 138 172 142Z" fill="${c.acc}" ${st(c, 3)}/>` : '') +
      legs + body + (x.body || '') + (lv === 1 ? fold : '') + `<g transform="translate(100 92) scale(${hs}) translate(-100 -92)">${headAll}</g>`;
    return grad(g, c.main) + (x.defs || '') + (lv === 3 ? aura(id, o.aura || c.acc) : '') + shadow(60 * sc) + wrap(sc, all) + (x.front || '');
  }

  /* ---------- かめ ---------- */
  function turtle(c, id, o, lv) {
    const g = 't' + id, F = `url(#${g})`, sg = 'ts' + id, S = `url(#${sg})`;
    const sc = [0.74, 0.86, 0.95, 1][lv], x = X(o, c, id, lv), shell = o.shell || c.acc;
    const all = (x.back || '') + both(`<ellipse cx="50" cy="164" rx="18" ry="14" fill="${F}" ${st(c)}/>`) +
      both(`<path d="M64 158 C60 170 60 180 62 186 L84 186 C84 178 84 168 82 158Z" fill="${F}" ${st(c)}/><path d="M68 186 L68 181 M74 186 L74 181 M80 186 L80 181" stroke="${c.dark}" stroke-width="2.5" stroke-linecap="round"/>`) +
      `<path d="M26 154 C26 96 60 64 100 64 C140 64 174 96 174 154Z" fill="${S}" ${st(c)}/>` +
      `<path d="M100 76 L124 88 L124 116 L100 128 L76 116 L76 88Z M76 88 L52 96 M124 88 L148 96 M76 116 L46 134 M124 116 L154 134 M100 128 L100 150 M100 76 L100 64" fill="none" stroke="${mixc(shell, '#000000', 0.35)}" stroke-width="3"/>` +
      (x.shellTop || '') +
      `<path d="M20 152 Q100 172 180 152 L180 160 Q100 180 20 160Z" fill="${c.belly}" ${st(c, 3)}/>` +
      `<ellipse cx="100" cy="152" rx="34" ry="28" fill="${F}" ${st(c)}/>` + (x.head || '') +
      (lv === 0 ? cuteFace(c, 100, 150, 1) : coolEyes(c, 100, 146, 1) + mouth(c, 100, 163, 0.9, lv === 3 ? 'roar' : 'grin'));
    return grad(g, c.main) + grad(sg, shell) + (lv === 3 ? aura(id, o.aura || c.acc) : '') + shadow(80 * sc) + wrap(sc, all) + (x.front || '');
  }

  /* ---------- ゴーレム ---------- */
  function golem(c, id, o, lv) {
    const g = 'gl' + id, F = `url(#${g})`, x = X(o, c, id, lv), fl = mixc(c.dark, c.main, 0.4);
    if (lv === 0) {
      return grad(g, c.main) + shadow(44) + (x.back || '') +
        both(`<path d="M68 166 L92 166 L90 180 L70 182Z" fill="${F}" ${st(c)}/>`) +
        `<path d="M58 132 L74 100 L100 92 L128 100 L144 130 L138 166 L100 176 L62 166Z" fill="${F}" ${st(c)}/>` +
        `<path d="M74 100 L86 126 L58 132 M128 100 L116 126 L144 130 M86 126 L116 126" stroke="${fl}" stroke-width="2.5" fill="none" opacity=".6"/>` +
        both(`<path d="M58 140 L44 146 L46 162 L60 158Z" fill="${F}" ${st(c)}/>`) + (x.body || '') + cuteFace(c, 100, 136, 1);
    }
    const sc = [0, 0.8, 0.9, 0.97][lv];
    const all = (x.back || '') + both(`<path d="M68 146 L94 146 L96 184 L62 184Z" fill="${F}" ${st(c)}/>`) +
      `<path d="M56 94 L144 94 L136 152 L64 152Z" fill="${F}" ${st(c)}/>` +
      `<path d="M56 94 L82 118 L64 152 M144 94 L118 118 L136 152 M82 118 L118 118" stroke="${fl}" stroke-width="2.5" fill="none" opacity=".6"/>` +
      `<circle cx="100" cy="124" r="${16 + lv * 3}" fill="${o.core}" opacity=".25"/><circle cx="100" cy="124" r="${7 + lv * 2}" fill="${o.core}" ${st(c, 3)}/><circle cx="${97 - lv}" cy="${121 - lv}" r="2.5" fill="#fff"/>` +
      (x.body || '') +
      both(`<path d="M42 116 L28 122 L24 146 L48 148 L56 124Z" fill="${F}" ${st(c)}/><path d="M20 146 L46 144 L52 166 L30 172 L16 162Z" fill="${F}" ${st(c)}/>` +
        `<path d="M58 90 L36 94 L26 112 L42 120 L62 110Z" fill="${F}" ${st(c)}/>`) + (x.arms || '') +
      (x.headBack || '') + `<path d="M80 54 L120 54 L128 72 L120 92 L80 92 L72 72Z" fill="${F}" ${st(c)}/>` +
      both(`<path d="M82 70 L96 74 L84 79Z" fill="${o.eye || c.acc}" ${st(c, 2)}/><path d="M80 65 L97 70" ${st(c, 4)}/>`) +
      (lv === 3 ? `<path d="M86 82 L92 87 L100 82 L108 87 L114 82" ${st(c, 3)} fill="none"/>` : `<path d="M90 84 L110 84" ${st(c, 3)}/>`) + (x.head || '');
    return grad(g, c.main) + (lv === 3 ? aura(id, o.aura || o.core) : '') + shadow(66 * sc) + wrap(sc, all) + (x.front || '');
  }

  /* ---------- はな・しょくぶつ ---------- */
  function plant(c, id, o, lv) {
    const g = 'p' + id, F = `url(#${g})`, x = X(o, c, id, lv);
    if (lv === 0) {
      const topS = o.bud ? `<path d="M100 104 L100 94" ${st(c, 4)}/><path d="M100 98 C88 90 88 74 100 62 C112 74 112 90 100 98Z" fill="${c.acc}" ${st(c, 3)}/>` + leaf(c, 100, 100, -60, 0.4) + leaf(c, 100, 100, 60, 0.4)
        : `<path d="M100 104 L100 86" ${st(c, 4)} fill="none"/>` + leaf(c, 100, 88, -55, 0.6) + leaf(c, 100, 88, 55, 0.6);
      return grad(g, c.main) + shadow(40) + both(`<path d="M80 172 L74 182 M86 174 L86 184" ${st(c, 4)}/>`) + topS +
        `<ellipse cx="100" cy="140" rx="40" ry="36" fill="${F}" ${st(c)}/><ellipse cx="100" cy="152" rx="22" ry="16" fill="${c.belly}"/>` + cuteFace(c, 100, 136, 0.95);
    }
    const sc = [0, 0.82, 0.92, 0.98][lv], R = [0, 24, 30, 34][lv];
    let head;
    if (o.trap) {
      let teeth = '';
      for (let k = 0; k < 7; k++) { const tx = 70 + k * 10; teeth += `<path d="M${tx} 84 L${tx + 4} 94 L${tx + 8} 84Z" fill="#fff" ${st(c, 1.5)}/><path d="M${tx + 2} 92 L${tx + 6} 84 L${tx + 10} 92Z" fill="#fff" opacity="0"/>`; }
      head = `<path d="M64 88 C70 120 130 120 136 88Z" fill="${c.acc}" ${st(c)}/><path d="M62 84 L138 84 L136 90 L64 90Z" fill="#4A1030"/>` +
        `<path d="M58 86 C56 50 144 50 142 86Z" fill="${c.acc}" ${st(c)}/>` + teeth +
        [[80, 62], [120, 62], [100, 56]].map(([sx, sy]) => `<circle cx="${sx}" cy="${sy}" r="4" fill="${mixc(c.acc, '#ffffff', 0.45)}"/>`).join('') +
        (lv >= 2 ? both(`<path d="M60 70 L46 62 L56 78Z" fill="${c.acc}" ${st(c, 3)}/>`) : '') +
        coolEyes(c, 100, 72, 0.8);
    } else {
      const n = o.petals || 8;
      let p = '';
      for (let k = 0; k < n; k++) p += `<ellipse cx="100" cy="${82 - R}" rx="${R * 0.42}" ry="${R * 0.62}" transform="rotate(${k * 360 / n + (o.twist || 0)} 100 82)" fill="${c.acc}" ${st(c, 3)}/>`;
      if (lv >= 2) for (let k = 0; k < n; k++) p += `<ellipse cx="100" cy="${82 - R * 0.75}" rx="${R * 0.28}" ry="${R * 0.42}" transform="rotate(${k * 360 / n + 180 / n} 100 82)" fill="${mixc(c.acc, '#ffffff', 0.4)}"/>`;
      head = p + `<circle cx="100" cy="82" r="${[0, 20, 22, 24][lv]}" fill="${o.disc || '#FFE48A'}" ${st(c, 3)}/>` + coolEyes(c, 100, 80, 0.75) + mouth(c, 100, 93, 0.7, 'grin');
    }
    const all = (x.back || '') + both(`<path d="M100 178 C80 178 54 172 36 156 C58 150 82 156 100 170Z" fill="${o.leafCol || c.main}" ${st(c)}/>`) +
      `<path d="M86 176 C82 152 86 128 92 110 L108 110 C114 128 118 152 114 176Z" fill="${F}" ${st(c)}/>` +
      both(leaf(c, 90, 136, -62, lv >= 2 ? 1.05 : 0.8, o.leafCol)) + (x.body || '') + head + (x.head || '');
    return grad(g, c.main) + (lv === 3 ? aura(id, o.aura || c.acc) : '') + shadow(54 * sc) + wrap(sc, all) + (x.front || '');
  }

  /* ---------- ひとの すがた(せいれい・にんぎょ・じょおう) ---------- */
  function human(c, id, o, lv) {
    const g = 'h' + id, F = `url(#${g})`, x = X(o, c, id, lv);
    const sc = [0, 0.92, 1.02, 1.08][lv], hs = [0, 1.18, 1.06, 1][lv];
    const skin = o.skin || '#FFE3D0', hair = o.hair || c.dark, H = s => `<g transform="translate(100 96) scale(${hs}) translate(-100 -96)">${s}</g>`;
    const WINGS = {
      petal: both(`<path d="M86 100 C64 72 36 70 28 86 C34 104 58 112 84 108Z" fill="${o.wingCol || c.acc}" fill-opacity=".85" ${st(c, 3)}/><path d="M86 110 C66 118 48 134 50 148 C66 150 80 134 88 118Z" fill="${o.wingCol || c.acc}" fill-opacity=".85" ${st(c, 3)}/>`),
      moth: both(`<path d="M86 100 C60 60 24 60 22 84 C24 106 56 112 84 108Z" fill="${o.wingCol || c.acc}" fill-opacity=".9" ${st(c, 3)}/><circle cx="46" cy="84" r="7" fill="${mixc(o.wingCol || c.acc, '#ffffff', 0.5)}"/>`),
    };
    const lower = o.tail ?
      `<path d="M88 108 C80 136 88 156 100 168 C112 156 120 136 112 108Z" fill="${F}" ${st(c)}/>` +
      `<path d="M92 124 q4 4 8 0 q4 4 8 0 M90 138 q5 4 10 0 q5 4 10 0 M94 152 q3 3 6 0 q3 3 6 0" stroke="${mixc(c.main, c.dark, 0.4)}" stroke-width="2" fill="none"/>` +
      `<path d="M100 164 C88 170 72 174 60 182 C78 190 92 186 100 174 C108 186 122 190 140 182 C128 174 112 170 100 164Z" fill="${c.acc}" ${st(c)}/>` :
      `<path d="M88 106 C80 128 66 158 52 182 C80 188 120 188 148 182 C134 158 120 128 112 106Z" fill="${F}" ${st(c)}/>` +
      `<path d="M58 176 C76 182 124 182 142 176" stroke="${mixc(c.main, '#ffffff', 0.45)}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    const arm = `<path d="M88 98 C80 104 76 116 78 128" stroke="${c.dark}" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M88 98 C80 104 76 116 78 128" stroke="${skin}" stroke-width="5.5" stroke-linecap="round" fill="none"/>`;
    const eye = `<ellipse cx="91" cy="72" rx="4.2" ry="5.4" fill="${c.iris}" ${st(c, 1.6)}/><ellipse cx="91" cy="73" rx="2" ry="3" fill="#1A1424"/><circle cx="92.4" cy="70" r="1.5" fill="#fff"/>` +
      `<path d="M85.5 66.5 Q91 63.5 96.5 66.5" stroke="${c.dark}" stroke-width="2.2" fill="none" stroke-linecap="round"/><ellipse cx="86" cy="80" rx="3.5" ry="2" fill="#FF8FA8" opacity=".5"/>`;
    const CROWN = {
      tiara: `<path d="M84 46 L88 36 L94 44 L100 30 L106 44 L112 36 L116 46Z" fill="#FFD84D" ${st(c, 2.5)}/><circle cx="100" cy="40" r="2.6" fill="${o.gem || c.acc}"/>`,
      flower: [0, 72, 144, 216, 288].map(a => `<ellipse cx="118" cy="44" rx="5" ry="8" transform="rotate(${a} 118 50)" fill="${o.flowerCol || c.acc}" ${st(c, 1.5)}/>`).join('') + `<circle cx="118" cy="50" r="3.5" fill="#FFE066"/>`,
      wreath: [-30, -15, 0, 15, 30].map(a => `<ellipse cx="100" cy="42" rx="5" ry="7.5" transform="rotate(${a} 100 92)" fill="${o.flowerCol || c.acc}" ${st(c, 1.5)}/>`).join(''),
      moon: `<path d="M90 38 A13 13 0 1 0 110 26 A10 10 0 1 1 90 38Z" fill="#FFE066" ${st(c, 2.5)}/>`,
      shell: `<path d="M110 48 L122 40 L126 54Z" fill="#FFF0E6" ${st(c, 2)}/>`,
    };
    const all = (x.back || '') + (WINGS[o.wings] || '') + H(`<path d="M74 66 C70 40 86 32 100 32 C114 32 130 40 126 66 C130 96 128 122 120 134 C112 128 88 128 80 134 C72 122 70 96 74 66Z" fill="${hair}" ${st(c)}/>`) +
      lower + `<path d="M88 94 C86 100 86 106 88 112 L112 112 C114 106 114 100 112 94Z" fill="${o.top || F}" ${st(c, 3)}/>` + both(arm) + (x.body || '') +
      H(`<rect x="96" y="86" width="8" height="10" fill="${skin}"/><circle cx="100" cy="68" r="22" fill="${skin}" ${st(c, 3)}/>` +
        `<path d="M77 66 C76 46 88 40 100 40 C112 40 124 46 123 66 C118 58 110 54 104 58 C100 52 92 52 88 58 C84 56 80 60 77 66Z" fill="${hair}" ${st(c, 3)}/>` +
        both(`<path d="M78 62 C74 76 76 90 82 98 C82 86 82 74 84 64Z" fill="${hair}" ${st(c, 2.5)}/>` + eye) +
        `<path d="M97 81 Q100 84 103 81" stroke="#B5455E" stroke-width="2" fill="none" stroke-linecap="round"/>` + (CROWN[o.crown] || '') + (x.head || ''));
    return grad(g, c.main) + (lv === 3 ? aura(id, o.aura || c.acc) : '') + shadow(46 * sc) + wrap(sc, all) + (x.front || '');
  }

  /* ---------- さかな(にんぎょの あかちゃん) ---------- */
  function fish(c, id, o) {
    const g = 'f' + id, F = `url(#${g})`;
    return grad(g, c.main) + shadow(40) +
      `<path d="M136 132 C150 120 160 112 174 110 C168 124 168 140 174 154 C160 152 150 144 136 132Z" fill="${c.acc}" ${st(c)}/>` +
      `<path d="M86 98 C94 82 112 80 122 88 C112 92 106 96 104 102Z" fill="${c.acc}" ${st(c)}/>` +
      `<ellipse cx="100" cy="132" rx="44" ry="38" fill="${F}" ${st(c)}/><ellipse cx="96" cy="148" rx="24" ry="14" fill="${c.belly}"/>` +
      `<path d="M120 136 C132 140 138 150 136 160 C128 154 122 148 118 142Z" fill="${c.acc}" ${st(c, 3)}/>` +
      cuteFace(c, 94, 128, 0.95) + `<circle cx="160" cy="84" r="6" fill="#fff" opacity=".8" ${st(c, 2)}/><circle cx="170" cy="66" r="4" fill="#fff" opacity=".8" ${st(c, 2)}/>`;
  }

  /* ---------- おばけ ---------- */
  function ghost(c, id, o, lv) {
    const g = 'gh' + id, F = `url(#${g})`, x = X(o, c, id, lv), sc = [0.72, 0.82, 0.9, 0.98][lv];
    const horns = lv >= 2 ? both(`<path d="M76 72 C64 58 60 42 64 30 C70 44 78 52 88 60Z" fill="${F}" ${st(c, 3.5)}/>`) : '';
    const cape = lv === 3 ? `<path d="M64 80 C30 110 22 150 20 176 L50 166 L64 180 L84 168 L100 182 L116 168 L136 180 L150 166 L180 176 C178 150 170 110 136 80Z" fill="${o.cape || c.dark}" ${st(c)}/>` : '';
    const arms = both(`<path d="M60 108 C46 108 38 116 36 128 C46 126 54 124 62 126Z" fill="${F}" ${st(c, 3)}/>` +
      (lv === 3 ? `<path d="M36 128 L30 134 M40 127 L36 136 M45 126 L43 134" ${st(c, 3)}/>` : ''));
    let face;
    if (lv === 0) face = cuteFace(c, 100, 104, 1);
    else {
      face = both(`<ellipse cx="86" cy="100" rx="8" ry="11" fill="#2A1A4A" transform="rotate(-14 86 100)"/><circle cx="87" cy="101" r="3.4" fill="${c.iris}"/><circle cx="87" cy="101" r="6" fill="${c.iris}" opacity=".3"/>`);
      face += lv === 1 ? `<path d="M90 120 q5 -4 10 0 q5 4 10 0" ${st(c, 3)} fill="none"/>` :
        `<path d="M84 116 Q100 112 116 116 Q112 134 100 136 Q88 134 84 116Z" fill="#2A1A4A"/><path d="M88 116 L91 122 L94 116 M106 116 L109 122 L112 116" fill="#fff"/>`;
    }
    const wisps = lv >= 2 ? flame(c, 34, 70, 0.55, c.acc) + flame(c, 168, 60, 0.5, c.acc) + (lv === 3 ? flame(c, 176, 130, 0.45, c.acc) + flame(c, 24, 140, 0.45, c.acc) : '') : '';
    const all = cape + horns + arms + `<path d="M58 150 C54 98 70 58 100 58 C130 58 146 98 142 150 L132 140 L122 156 L111 142 L100 158 L89 142 L78 156 L68 140Z" fill="${F}" ${st(c)}/>` +
      `<ellipse cx="80" cy="80" rx="8" ry="14" fill="#fff" opacity=".35" transform="rotate(20 80 80)"/>` + face + (lv === 3 ? crown(c, 100, 62, 0.9) : '') + (x.body || '');
    return grad(g, c.main) + (lv === 3 ? aura(id, o.aura || c.acc) : '') + shadow(40 * sc, 0.08) + `<g transform="translate(0 -8)">${wrap(sc, all)}</g>` + wisps;
  }

  /* ---------- クラゲ ---------- */
  function jelly(c, id, o, lv) {
    const g = 'j' + id, F = `url(#${g})`, sc = [0.72, 0.82, 0.9, 0.98][lv], n = [4, 5, 6, 8][lv];
    let ten = '';
    for (let k = 0; k < n; k++) {
      const tx = 62 + k * (76 / (n - 1)), d = `M${tx} 110 q7 12 0 24 t0 24${lv >= 1 ? ' t0 24' : ''}`;
      ten += `<path d="${d}" stroke="${c.dark}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${c.acc}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    }
    const arms = lv >= 1 ? `<path d="M90 108 C84 130 96 140 90 162 C100 156 104 146 102 136 C106 146 112 152 110 166 C116 146 108 128 110 108Z" fill="${c.belly}" fill-opacity=".9" ${st(c, 2.5)}/>` : '';
    const face = lv === 0 ? cuteFace(c, 100, 90, 1) : coolEyes(c, 100, 88, 0.9) + mouth(c, 100, 102, 0.8, lv === 3 ? 'roar' : 'grin');
    const all = ten + arms +
      `<path d="M50 110 C50 66 74 46 100 46 C126 46 150 66 150 110 C142 116 132 112 124 118 C116 112 108 116 100 120 C92 116 84 112 76 118 C68 112 58 116 50 110Z" fill="${F}" fill-opacity=".93" ${st(c)}/>` +
      `<ellipse cx="76" cy="70" rx="8" ry="14" fill="#fff" opacity=".45" transform="rotate(25 76 70)"/>` +
      [[104, 58], [124, 70], [90, 62]].map(([sx, sy]) => `<circle cx="${sx}" cy="${sy}" r="4" fill="${c.acc}" opacity=".7"/>`).join('') + face +
      (lv === 3 ? crown(c, 100, 50, 0.85, '#E8F7FF', c.acc) : '');
    const orbs = lv >= 2 ? [[30, 60], [170, 50], [178, 140], [22, 150]].slice(0, lv === 3 ? 4 : 2).map(([ox, oy]) => `<circle cx="${ox}" cy="${oy}" r="9" fill="${c.acc}" opacity=".35"/><circle cx="${ox}" cy="${oy}" r="4.5" fill="#fff"/>`).join('') : '';
    return grad(g, c.main) + (lv === 3 ? aura(id, o.aura || c.acc) : '') + shadow(40 * sc, 0.08) + `<g transform="translate(0 -6)">${wrap(sc, all)}</g>` + orbs;
  }

  /* ---------- へび・りゅう(とぐろ) ---------- */
  function serpent(c, id, o, lv) {
    const g = 's' + id, F = `url(#${g})`, x = X(o, c, id, lv), sc = [0.72, 0.84, 0.92, 1][lv], W = [18, 20, 24, 26][lv];
    const d = 'M40 174 C12 166 18 136 52 134 C96 130 152 146 154 114 C156 90 126 86 106 102';
    const bodyS = `<path d="${d}" stroke="${c.dark}" stroke-width="${W + 7}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${c.main}" stroke-width="${W}" fill="none" stroke-linecap="round"/>` +
      (o.rings ? `<path d="${d}" stroke="${c.dark}" stroke-width="${W}" fill="none" stroke-dasharray="2 10" opacity=".35"/>` :
        `<path d="${d}" stroke="${c.belly}" stroke-width="${W * 0.32}" fill="none" stroke-dasharray="7 4" transform="translate(0 ${W * 0.2})"/>`);
    const fins = lv >= 1 && o.fins ? [[54, 122], [96, 120], [140, 104]].map(([fx, fy]) => `<path d="M${fx - 7} ${fy + 4} L${fx} ${fy - 10 - lv * 3} L${fx + 7} ${fy + 4}Z" fill="${c.acc}" ${st(c, 3)}/>`).join('') : '';
    const tailFin = o.tailFin ? `<path d="M40 174 C30 166 20 166 10 172 C20 178 26 184 28 194 C36 186 42 180 40 174Z" fill="${c.acc}" ${st(c, 3)}/>` : '';
    const head = `<path d="M76 78 C74 60 86 50 100 50 C114 50 126 60 124 78 C122 94 112 102 100 102 C88 102 78 94 76 78Z" fill="${F}" ${st(c)}/>`;
    const snout = lv >= 1 ? `<ellipse cx="100" cy="90" rx="13" ry="9" fill="${c.belly}"/><ellipse cx="95" cy="86" rx="1.8" ry="1.3" fill="${c.dark}"/><ellipse cx="105" cy="86" rx="1.8" ry="1.3" fill="${c.dark}"/>` : '';
    const face = lv === 0 ? cuteFace(c, 100, 78, 0.85) : coolEyes(c, 100, 72, 0.9) + mouth(c, 100, 95, 0.75, lv === 3 ? 'roar' : 'grin');
    const all = (x.back || '') + tailFin + bodyS + fins + (x.headBack || '') + head + snout + (x.head || '') + face + (x.headTop || '');
    return grad(g, c.main) + (lv === 3 ? aura(id, o.aura || c.acc) : '') + shadow(70 * sc) + wrap(sc, all) + (x.front || '');
  }

  /* ---------- そらとぶ クジラ ---------- */
  function whale(c, id, o, lv) {
    const g = 'w' + id, F = `url(#${g})`, sc = [0.66, 0.78, 0.88, 0.98][lv];
    const wingD = 'M98 84 C102 52 132 30 170 24 C162 34 160 42 164 50 C150 52 144 60 146 68 C134 68 126 76 124 86Z';
    const wing = col => `<path d="${wingD}" fill="${col}" ${st(c)}/><path d="M112 76 L160 34 M120 80 L152 54 M128 84 L144 70" stroke="${mixc(c.dark, '#ffffff', 0.55)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    const clouds = lv >= 1 ? cloud(c, [[36, 178, 13], [56, 172, 17], [80, 180, 11], [136, 180, 12], [158, 174, 16], [178, 180, 10]], '#FFFFFF', mixc(c.dark, '#ffffff', 0.4)) : '';
    const eye = lv === 0 ? `<ellipse cx="62" cy="112" rx="5" ry="6.5" fill="#2B2340"/><circle cx="60.5" cy="109.5" r="2" fill="#fff"/><ellipse cx="66" cy="126" rx="6" ry="3.5" fill="#FF7F9E" opacity=".5"/>` :
      `<g transform="translate(124 0) scale(-1 1)">${eyeOne(c, 62, 112, 0.95)}</g>`;
    const all = (lv >= 2 ? `<g transform="translate(-14 4)">${wing(mixc(c.belly, c.main, 0.3))}</g>` : '') + (lv >= 1 ? wing('#FFFFFF') : '') +
      `<path d="M164 114 C176 104 182 88 194 78 C182 78 176 82 170 90 C174 78 172 68 166 60 C158 74 158 96 158 108Z" fill="${F}" ${st(c)}/>` +
      `<path d="M24 122 C24 90 60 76 104 78 C146 80 170 98 172 118 C174 140 150 156 104 156 C60 156 24 150 24 122Z" fill="${F}" ${st(c)}/>` +
      `<path d="M30 128 C50 150 90 154 130 150 C150 148 164 140 170 128 C150 136 110 140 70 138 C50 136 38 132 30 128Z" fill="${c.belly}"/>` +
      `<path d="M50 140 L120 146 M60 146 L130 150" stroke="${mixc(c.belly, c.dark, 0.25)}" stroke-width="2" fill="none"/>` +
      `<path d="M86 146 C82 160 92 172 106 176 C104 162 102 152 100 146Z" fill="${F}" ${st(c)}/>` +
      (lv >= 2 ? [[90, 92], [110, 88], [130, 96], [100, 104]].map(([sx, sy]) => `<circle cx="${sx}" cy="${sy}" r="3" fill="#fff" opacity=".8"/>`).join('') : '') +
      eye + `<path d="M28 128 Q50 136 74 132" ${st(c, 3)} fill="none"/>` + (lv === 3 ? crown(c, 74, 82, 0.8) : '');
    return (lv === 3 ? aura(id, o.aura || c.acc) : '') + grad(g, c.main) + shadow(60 * sc, 0.08) + clouds + `<g transform="translate(0 ${lv === 0 ? 0 : -10})">${wrap(sc, all, 100, 150)}</g>` +
      (lv === 3 ? sparkle(30, 50, 8) + sparkle(178, 150, 7) : '');
  }

  /* ---------- き ---------- */
  function tree(c, id, o, lv) {
    const g = 'tr' + id, F = `url(#${g})`, x = X(o, c, id, lv), lc = c.acc;
    if (lv === 0) {
      return grad(g, c.main) + shadow(40) + `<path d="M100 104 L100 84" ${st(c, 4)} fill="none"/>` + leaf(c, 100, 88, -50, 0.65, lc) + leaf(c, 100, 88, 50, 0.65, lc) +
        both(`<path d="M80 168 C74 176 68 180 62 182" ${st(c, 5)} fill="none"/>`) +
        `<ellipse cx="100" cy="140" rx="38" ry="36" fill="${F}" ${st(c)}/><path d="M86 112 Q90 130 86 150 M114 112 Q110 130 114 150" stroke="${c.dark}" stroke-width="2" opacity=".3" fill="none"/>` + cuteFace(c, 100, 136, 0.95);
    }
    const sc = [0, 0.84, 0.94, 1][lv];
    const CAN = [null,
      [[100, 70, 30], [74, 84, 22], [126, 84, 22]],
      [[100, 52, 30], [70, 66, 26], [130, 66, 26], [56, 92, 20], [144, 92, 20], [100, 80, 26]],
      [[100, 44, 36], [64, 56, 30], [136, 56, 30], [36, 86, 24], [164, 86, 24], [100, 76, 30], [70, 92, 22], [130, 92, 22]]][lv];
    const branches = both(tube(c, 'M80 124 C64 118 52 106 46 92', lv >= 2 ? 12 : 10)) + both(cloud(c, [[44, 88, 10 + lv * 3]], lc));
    const roots = both(`<path d="M74 176 C64 180 52 184 42 186 L76 186Z" fill="${F}" ${st(c, 3)}/>`);
    const trunk = `<path d="M62 184 C70 158 72 130 70 104 L130 104 C128 130 130 158 138 184Z" fill="${F}" ${st(c)}/>` +
      `<path d="M84 112 Q88 140 82 172 M116 112 Q112 140 118 172 M100 158 L100 180" stroke="${c.dark}" stroke-width="2.5" opacity=".35" fill="none"/>`;
    const fruits = lv >= 2 ? CAN.slice(0, 5).map(([fx, fy, r], k) => `<circle cx="${fx + (k % 2 ? 8 : -8)}" cy="${fy + r * 0.3}" r="${4 + lv}" fill="${o.fruit || '#FF8FB8'}" ${st(c, 2)}/>`).join('') : '';
    const all = (x.back || '') + roots + trunk + branches + cloud(c, CAN, lc) + fruits + (x.body || '') +
      coolEyes(c, 100, 134, 1.05) + mouth(c, 100, 152, 0.95, lv === 3 ? 'roar' : 'grin') + (lv >= 2 ? `<path d="M86 162 C88 172 96 178 100 182 C104 178 112 172 114 162" fill="${mixc(lc, '#ffffff', 0.2)}" ${st(c, 2.5)}/>` : '') +
      (lv === 3 ? crown(c, 100, 30, 0.9) : '') + (x.head || '');
    return grad(g, c.main) + (lv === 3 ? aura(id, o.aura || lc) : '') + shadow(66 * sc) + wrap(sc, all) + (x.front || '');
  }

  /* ---------- たまご ---------- */
  const EGG = 'M100 36 C140 36 152 108 150 130 C148 160 128 176 100 176 C72 176 52 160 50 130 C48 108 60 36 100 36Z';
  function egg(c, pat, col) {
    const id = 'eg' + nid(), m = col || c.main, a = c.acc;
    const P = {
      wave: [96, 128, 156].map(y => `<path d="M40 ${y} Q55 ${y - 10} 70 ${y} T100 ${y} T130 ${y} T160 ${y}" stroke="${m}" stroke-width="8" fill="none" stroke-linecap="round"/>`).join(''),
      flame: `<path d="M40 122 L58 104 L70 120 L84 98 L100 120 L116 98 L130 120 L142 104 L160 122 L160 140 L40 140Z" fill="${m}"/><path d="M40 146 L160 146" stroke="${a}" stroke-width="8"/>`,
      crack: `<path d="M50 100 L70 110 L84 96 L100 112 L118 98 L130 112 L152 102" stroke="${m}" stroke-width="6" fill="none" stroke-linejoin="round"/><path d="M60 150 L80 140 L96 152 L114 138 L134 150" stroke="${a}" stroke-width="6" fill="none" stroke-linejoin="round"/>`,
      feather: [[78, 112, -30], [120, 100, 25], [100, 152, 5]].map(([x, y, r]) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M0 -22 C10 -10 10 10 0 22 C-10 10 -10 -10 0 -22Z" fill="${m}"/><path transform="translate(${x} ${y}) rotate(${r})" d="M0 -20 L0 20" stroke="${a}" stroke-width="2"/>`).join(''),
      swirl: `<path d="M100 104 m-30 0 a30 30 0 1 0 60 0 a22 22 0 1 0 -44 0 a14 14 0 1 0 28 0" stroke="${m}" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="72" cy="152" r="7" fill="${a}"/><circle cx="130" cy="60" r="5" fill="${a}"/>`,
      bolt: `<path d="M40 112 L70 96 L80 118 L112 98 L120 120 L160 100 L160 124 L122 144 L112 122 L82 142 L72 120 L40 136Z" fill="${m}"/>`,
      snow: [[76, 92, 12], [124, 118, 14], [88, 148, 10]].map(([x, y, r]) => [0, 60, 120].map(t => `<path d="M${x} ${y - r} L${x} ${y + r}" stroke="${m}" stroke-width="5" stroke-linecap="round" transform="rotate(${t} ${x} ${y})"/>`).join('')).join(''),
      leaf: [[78, 120, -30, 0.8], [122, 100, 25, 0.75], [104, 162, 10, 0.6]].map(([x, y, r, s]) => `<path transform="translate(${x} ${y}) rotate(${r}) scale(${s})" d="M0 0 C10 -10 10 -30 0 -40 C-10 -30 -10 -10 0 0Z" fill="${m}"/>`).join(''),
      dots: [[80, 80, 9], [120, 96, 12], [86, 124, 11], [126, 140, 9], [100, 160, 8], [70, 150, 6]].map(([x, y, r], k) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${k % 2 ? a : m}"/>`).join(''),
      gear: `<path d="${starPath(100, 112, 30, 23, 8)}" fill="${m}"/><circle cx="100" cy="112" r="10" fill="${c.egg}"/><path d="M50 76 L150 76 M50 150 L150 150" stroke="${a}" stroke-width="6"/>`,
      gem: `<path d="M100 70 L128 104 L100 150 L72 104Z" fill="${m}"/><path d="M100 70 L100 150 M72 104 L128 104" stroke="#fff" stroke-width="3" opacity=".7"/>`,
      moon: `<path d="M86 86 A30 30 0 1 0 124 70 A24 24 0 1 1 86 86Z" fill="${a}"/>` + [[70, 140], [130, 146], [110, 160]].map(([x, y]) => `<path d="${starPath(x, y, 7, 3.2)}" fill="${m}"/>`).join(''),
      star: [[80, 96, 13], [124, 124, 16], [90, 152, 10], [128, 76, 8]].map(([x, y, r], k) => `<path d="${starPath(x, y, r, r * 0.48)}" fill="${k % 2 ? m : a}"/>`).join(''),
    };
    return shadow(48) + `<defs><clipPath id="${id}"><path d="${EGG}"/></clipPath></defs>` +
      `<path d="${EGG}" fill="${c.egg}"/><g clip-path="url(#${id})">${P[pat] || P.dots}</g><path d="${EGG}" fill="none" ${st(c)}/>` +
      `<ellipse cx="80" cy="70" rx="9" ry="16" fill="#fff" opacity=".7" transform="rotate(20 80 70)"/>`;
  }

  window.MONPARTS = {
    nid, st, mixc, both, MIR, tube, flame, bolt, leaf, crystal, star, sparkle, gear, crown, cloud, starPath, aura,
    chibi, biped, dragon, quad, bird, turtle, golem, plant, human, fish, ghost, jelly, serpent, whale, tree, egg,
  };
})();
