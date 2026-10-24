// なぞモン モンスターデータと絵(SVG)
// 6けいとう × 5だんかい(0=たまご … 4=さいしゅう)。絵はすべて 200×200 の SVG をその場で組み立てる
(function () {
  const LINES = [
    { id: 'fire', label: 'ほのお', icon: '🔥', c: { main: '#FF7A45', dark: '#A8401E', belly: '#FFE2C2', acc: '#FFC93C', egg: '#FFE6D6', iris: '#FFD23F' },
      names: ['ほのおの たまご', 'ヒノピー', 'メラッコ', 'ボルケン', 'エンペラドン'],
      notes: ['ほんのり あったかい たまご。ときどき ぽっと ひかる', 'あたまの ひが ちいさな ろうそく くらい。ねる ときは ほそく なる', 'しっぽの ひで やきいもを やくのが とくい', 'つのと ツメは あつい てつも とかす。ほえると ひのこが まう', 'ひとふりの つばさで ほのおの あらしを おこす。ほのおの おうさま'] },
    { id: 'water', label: 'みず', icon: '💧', c: { main: '#4DA8F0', dark: '#1F5F99', belly: '#DDF1FF', acc: '#8FE0FF', egg: '#E2F2FF', iris: '#FF5E7A' },
      names: ['みずの たまご', 'シズクン', 'アワール', 'ナミザメ', 'カイリュード'],
      notes: ['さわると ひんやり。なかで ちゃぷちゃぷ おとが する', 'しずくの かたちの あかちゃん。あめの ひは ごきげん', 'あたまの ひれで あわを つくって あそぶ', 'うみで いちばん はやい ハンター。するどい キバで いわも くだく', 'うみを まもる りゅう。ひと ほえで おおなみを よぶ'] },
    { id: 'grass', label: 'くさ', icon: '🌱', c: { main: '#6CC56A', dark: '#2F7A36', belly: '#E8F8D8', acc: '#FF9EC0', egg: '#E6F7DC', iris: '#FFB020' },
      names: ['くさの たまご', 'メブキ', 'ハッパル', 'モリクマ', 'ジュカイオー'],
      notes: ['おひさまに あてると すこし おおきく なる たまご', 'あたまの めが いつか おおきな きに なる', 'みみの はっぱで かぜを かんじる', 'もりで いちばん ちからもち。きの かわの よろいで みを まもる', 'えだの つのを ひとふり すると もりが うごきだす。もりの おうさま'] },
    { id: 'elec', label: 'でんき', icon: '⚡', c: { main: '#FFD23F', dark: '#A3780A', belly: '#FFF6D0', acc: '#FF9A3C', egg: '#FFF4CC', iris: '#3FD7FF' },
      names: ['でんきの たまご', 'ビリリン', 'ピリネコ', 'イナズマル', 'ライトニオン'],
      notes: ['さわると ぴりっと する ふしぎな たまご', 'うれしいと からだから ぱちぱち ひばなが でる', 'しっぽの でんきで よるの みちを てらす', 'かみなりの ように すばやく はしり、ツメから でんげきを はなつ', 'いなずまの たてがみで そらを ひからせる。でんきの おうさま'] },
    { id: 'ice', label: 'こおり', icon: '❄', c: { main: '#A8E6F5', dark: '#3E8AA8', belly: '#FFFFFF', acc: '#D6C6FF', egg: '#EEF9FF', iris: '#3BA9FF' },
      names: ['こおりの たまご', 'ユキポ', 'ツララビ', 'ヒョウガロン', 'オーロラキング'],
      notes: ['ゆきの ように しろい たまご。なつは ちょっと にがて', 'ころころ ころがって ゆきだまを つくる', 'つららの みみは かたくて ぴかぴか', 'こおりの とげを まとった おおかみ。いきで なんでも こおらせる', 'オーロラの マントを なびかせる。こおりの おうさま'] },
    { id: 'star', label: 'ほし', icon: '⭐', c: { main: '#B79CFF', dark: '#5C3FA8', belly: '#F2ECFF', acc: '#FFE066', egg: '#F1EAFF', iris: '#FFE066' },
      names: ['ほしの たまご', 'キラリン', 'ホシモッチ', 'ギャラクシオ', 'コスモスター'],
      notes: ['よるに なると きらきら ひかる たまご', 'ながれぼしに のって やって きたらしい', 'もちもちの からだ。ねがいごとを きくのが すき', 'ほしの わっかで うちゅうを かけぬける。つのは みかづきの かたち', 'ほしぞらの マントで ながれぼしを あやつる。うちゅうの おうさま'] },
  ];

  let uid = 0;
  const st = (c, w = 4) => `stroke="${c.dark}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const shadow = (w = 56) => `<ellipse cx="100" cy="186" rx="${w}" ry="8" fill="#000" opacity=".12"/>`;
  function starPath(cx, cy, R, r, n = 5, rot = -90) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = (rot + i * 180 / n) * Math.PI / 180, rr = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
    }
    return d + 'Z';
  }
  function face(c, cx, cy, s = 1, o = {}) {
    const ex = 17 * s, er = 7 * s;
    let h = '';
    for (const d of [-1, 1]) {
      const x = cx + d * ex;
      h += `<ellipse cx="${x}" cy="${cy}" rx="${er * 0.85}" ry="${er * 1.15}" fill="#2B2340"/>`;
      h += `<circle cx="${x - 2 * s}" cy="${cy - 3.5 * s}" r="${2.6 * s}" fill="#fff"/>`;
      h += `<circle cx="${x + 2.2 * s}" cy="${cy + 3 * s}" r="${1.2 * s}" fill="#fff" opacity=".8"/>`;
      h += `<ellipse cx="${cx + d * 30 * s}" cy="${cy + 11 * s}" rx="${6.5 * s}" ry="${4 * s}" fill="#FF7F9E" opacity=".55"/>`;
      if (o.brow) h += `<path d="M${x - d * 9 * s} ${cy - 10 * s} L${x + d * 7 * s} ${cy - 15 * s}" ${st(c, 3.5 * s)} fill="none"/>`;
    }
    const my = cy + 10 * s;
    if (o.open) {
      h += `<path d="M${cx - 9 * s} ${my} Q${cx} ${my + 14 * s} ${cx + 9 * s} ${my} Z" fill="#7A2E3A" ${st(c, 3 * s)}/>`;
      h += `<path d="M${cx - 6 * s} ${my + 1} L${cx - 3.5 * s} ${my + 5 * s} L${cx - 1 * s} ${my + 1}Z" fill="#fff"/>`;
      h += `<path d="M${cx + 6 * s} ${my + 1} L${cx + 3.5 * s} ${my + 5 * s} L${cx + 1 * s} ${my + 1}Z" fill="#fff"/>`;
    } else {
      h += `<path d="M${cx - 6 * s} ${my} Q${cx} ${my + 7 * s} ${cx + 6 * s} ${my}" ${st(c, 3 * s)} fill="none"/>`;
    }
    return h;
  }
  const body = (c, cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c.main}" ${st(c)}/>`;
  const belly = (c, cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c.belly}"/>`;
  const feet = (c, y, gap = 24, rx = 15, ry = 9) => [-1, 1].map(d => `<ellipse cx="${100 + d * gap}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c.main}" ${st(c)}/>`).join('');
  const arms = (c, y, gap, rot = 30, rx = 10, ry = 16) => [-1, 1].map(d => `<ellipse cx="${100 + d * gap}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${-d * rot} ${100 + d * gap} ${y})" fill="${c.main}" ${st(c)}/>`).join('');
  const flame = (c, x, y, s = 1, col) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -30 C10 -20 16 -10 12 0 C10 8 4 12 0 12 C-4 12 -10 8 -12 0 C-14 -8 -8 -14 -6 -22 C-2 -16 0 -20 0 -30Z" fill="${col || c.acc}" ${st(c, 4 / s)}/><path transform="translate(${x} ${y}) scale(${s})" d="M0 -12 C5 -6 6 0 3 5 C1 7 -1 7 -3 5 C-6 1 -3 -5 0 -12Z" fill="#FFF3B0"/>`;
  const bolt = (c, x, y, s = 1, col) => `<path transform="translate(${x} ${y}) scale(${s})" d="M4 -22 L-10 2 L-1 2 L-5 22 L10 -4 L1 -4 Z" fill="${col || c.acc}" ${st(c, 3 / s)}/>`;
  const leaf = (c, x, y, rot, s = 1, col) => `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 0 C10 -10 10 -30 0 -40 C-10 -30 -10 -10 0 0Z" fill="${col || c.main}" ${st(c, 3.5 / s)}/><path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 -4 L0 -32" ${st(c, 2.5 / s)} fill="none"/>`;
  const tailCurl = (c, x, y, s, w) => { const d = `M${x} ${y} C${x + 30 * s} ${y + 4 * s} ${x + 40 * s} ${y - 30 * s} ${x + 24 * s} ${y - 44 * s} C${x + 12 * s} ${y - 54 * s} ${x + 2 * s} ${y - 40 * s} ${x + 14 * s} ${y - 34 * s}`; return `<path d="${d}" ${st(c, w)} fill="none"/><path d="${d}" stroke="${c.main}" stroke-width="${w - 7}" fill="none" stroke-linecap="round"/>`; };
  const crystal = (c, x, y, h, rot = 0, col) => `<path transform="translate(${x} ${y}) rotate(${rot})" d="M0 ${-h} L${h * 0.32} ${-h * 0.45} L${h * 0.22} 0 L${-h * 0.22} 0 L${-h * 0.32} ${-h * 0.45}Z" fill="${col || '#E6FAFF'}" ${st(c, 3)}/><path transform="translate(${x} ${y}) rotate(${rot})" d="M0 ${-h * 0.92} L0 ${-h * 0.1}" stroke="#fff" stroke-width="2" opacity=".8"/>`;
  const star = (c, x, y, R, col, w = 3) => `<path d="${starPath(x, y, R, R * 0.48)}" fill="${col || c.acc}" ${st(c, w)}/>`;
  const sparkle = (x, y, r, col = '#fff') => `<path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z" fill="${col}"/>`;
  const crown = (c, x, y, s = 1, col = '#FFD84D') => `<path transform="translate(${x} ${y}) scale(${s})" d="M-22 0 L-24 -22 L-11 -10 L0 -28 L11 -10 L24 -22 L22 0Z" fill="${col}" ${st(c, 3.5 / s)}/><circle transform="translate(${x} ${y}) scale(${s})" cx="0" cy="-8" r="4" fill="#FF5D8F"/>`;
  const aura = (id, col) => `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${col}" stop-opacity=".55"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs><circle cx="100" cy="105" r="98" fill="url(#${id})"/>`;

  /* ---------- たまご ---------- */
  const EGG = 'M100 36 C140 36 152 108 150 130 C148 160 128 176 100 176 C72 176 52 160 50 130 C48 108 60 36 100 36Z';
  function egg(L) {
    const c = L.c, id = 'eg' + (++uid);
    let pat = '';
    if (L.id === 'fire') pat = `<path d="M40 122 L58 104 L70 120 L84 98 L100 120 L116 98 L130 120 L142 104 L160 122 L160 140 L40 140Z" fill="${c.main}"/><path d="M40 140 L160 140" stroke="${c.main}" stroke-width="10"/>`;
    if (L.id === 'water') pat = [96, 128, 156].map(y => `<path d="M40 ${y} Q55 ${y - 10} 70 ${y} T100 ${y} T130 ${y} T160 ${y}" stroke="${c.main}" stroke-width="8" fill="none" stroke-linecap="round"/>`).join('');
    if (L.id === 'grass') pat = leaf(c, 78, 120, -30, 0.8) + leaf(c, 122, 100, 25, 0.75) + leaf(c, 104, 160, 10, 0.6);
    if (L.id === 'elec') pat = `<path d="M40 112 L70 96 L80 118 L112 98 L120 120 L160 100 L160 124 L122 144 L112 122 L82 142 L72 120 L40 136Z" fill="${c.acc}"/>`;
    if (L.id === 'ice') pat = [[76, 92, 12], [124, 118, 14], [88, 148, 10]].map(([x, y, r]) => [0, 60, 120].map(a => `<path d="M${x} ${y - r} L${x} ${y + r}" stroke="${c.main}" stroke-width="5" stroke-linecap="round" transform="rotate(${a} ${x} ${y})"/>`).join('')).join('');
    if (L.id === 'star') pat = star(c, 80, 96, 13, c.acc, 0) + star(c, 124, 124, 16, c.main, 0) + star(c, 90, 152, 10, c.acc, 0) + star(c, 128, 76, 8, c.main, 0);
    return shadow(48) + `<defs><clipPath id="${id}"><path d="${EGG}"/></clipPath></defs>` +
      `<path d="${EGG}" fill="${c.egg}"/><g clip-path="url(#${id})">${pat}</g><path d="${EGG}" fill="none" ${st(c)}/>` +
      `<ellipse cx="80" cy="70" rx="9" ry="16" fill="#fff" opacity=".7" transform="rotate(20 80 70)"/>`;
  }

  /* ---------- けいとうごとの すがた ---------- */
  const DRAW = {
    fire: [
      null,
      c => shadow(44) + feet(c, 172, 20, 13, 8) + flame(c, 100, 86, 0.9) + body(c, 100, 132, 46, 42) + belly(c, 100, 146, 26, 20) + face(c, 100, 128, 1),
      c => shadow(52) + `<path d="M140 150 C168 150 176 128 168 112" ${st(c, 14)} fill="none"/><path d="M140 150 C168 150 176 128 168 112" stroke="${c.main}" stroke-width="7" fill="none" stroke-linecap="round"/>` + flame(c, 168, 106, 0.8) +
        feet(c, 174) + [80, 100, 120].map((x, i) => `<path d="M${x - 9} ${86 + (i === 1 ? -2 : 4)} L${x} ${70 + (i === 1 ? -6 : 2)} L${x + 9} ${86 + (i === 1 ? -2 : 4)}Z" fill="${c.acc}" ${st(c, 3.5)}/>`).join('') +
        body(c, 100, 130, 52, 48) + belly(c, 100, 146, 30, 24) + coolFace(c, 100, 124, 1.05),
    ],
    water: [
      null,
      c => shadow(44) + `<path d="M100 74 C120 100 146 114 146 140 C146 166 126 178 100 178 C74 178 54 166 54 140 C54 114 80 100 100 74Z" fill="${c.main}" ${st(c)}/>` + belly(c, 100, 154, 24, 16) +
        `<ellipse cx="82" cy="112" rx="5" ry="10" fill="#fff" opacity=".6" transform="rotate(30 82 112)"/>` + face(c, 100, 140, 1),
      c => shadow(52) + `<path d="M50 150 C30 150 22 134 26 120 C36 130 44 132 54 130Z" fill="${c.acc}" ${st(c)}/>` +
        `<path d="M84 86 C86 64 104 56 118 62 C108 68 106 78 110 90Z" fill="${c.acc}" ${st(c)}/>` + feet(c, 174) +
        body(c, 100, 130, 52, 48) + belly(c, 100, 148, 30, 22) + coolFace(c, 100, 124, 1.05) +
        `<circle cx="150" cy="80" r="8" fill="#fff" opacity=".7" ${st(c, 2)}/><circle cx="162" cy="62" r="5" fill="#fff" opacity=".7" ${st(c, 2)}/>`,
    ],
    grass: [
      null,
      c => shadow(44) + feet(c, 172, 20, 13, 8) + `<path d="M100 92 L100 70" ${st(c, 4)} fill="none"/>` + leaf(c, 100, 72, -55, 0.6) + leaf(c, 100, 72, 55, 0.6) +
        body(c, 100, 132, 46, 42) + belly(c, 100, 146, 26, 20) + face(c, 100, 128, 1),
      c => shadow(52) + leaf(c, 62, 96, -50, 1) + leaf(c, 138, 96, 50, 1) + leaf(c, 150, 162, 70, 0.7) + feet(c, 174) +
        body(c, 100, 130, 52, 48) + belly(c, 100, 146, 30, 24) + coolFace(c, 100, 124, 1.05) +
        `<circle cx="72" cy="96" r="6" fill="${c.acc}" ${st(c, 2.5)}/>`,
    ],
    elec: [
      null,
      c => shadow(44) + feet(c, 172, 20, 13, 8) + `<path d="M70 104 L62 74 L88 94Z" fill="${c.main}" ${st(c)}/><path d="M130 104 L138 74 L112 94Z" fill="${c.main}" ${st(c)}/>` +
        body(c, 100, 132, 46, 42) + belly(c, 100, 146, 26, 20) + face(c, 100, 128, 1) +
        bolt(c, 156, 102, 0.6) + bolt(c, 44, 112, 0.5),
      c => shadow(52) + tailCurl(c, 142, 156, 1, 12) + bolt(c, 172, 100, 0.6) +
        `<path d="M64 102 L56 62 L92 88Z" fill="${c.main}" ${st(c)}/><path d="M136 102 L144 62 L108 88Z" fill="${c.main}" ${st(c)}/><path d="M66 94 L62 74 L80 88Z" fill="${c.acc}"/><path d="M134 94 L138 74 L120 88Z" fill="${c.acc}"/>` +
        feet(c, 174) + body(c, 100, 130, 52, 48) + belly(c, 100, 148, 30, 22) + bolt(c, 100, 98, 0.45) + coolFace(c, 100, 124, 1.05),
    ],
    ice: [
      null,
      c => shadow(44) + feet(c, 172, 20, 13, 8) + crystal(c, 86, 96, 20, -20) + crystal(c, 100, 92, 26) + crystal(c, 114, 96, 20, 20) +
        body(c, 100, 132, 46, 42) + belly(c, 100, 146, 26, 20) + face(c, 100, 128, 1),
      c => shadow(52) + [-1, 1].map(d => `<path d="M${100 + d * 22} ${96} C${100 + d * 20} ${60} ${100 + d * 28} ${34} ${100 + d * 36} ${26} C${100 + d * 44} ${44} ${100 + d * 42} ${72} ${100 + d * 38} ${100}Z" fill="#E6FAFF" ${st(c)}/><path d="M${100 + d * 30} ${90} C${100 + d * 30} ${68} ${100 + d * 33} ${50} ${100 + d * 36} ${42}" stroke="${c.acc}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('') +
        feet(c, 174) + body(c, 100, 130, 52, 48) + belly(c, 100, 148, 30, 22) + coolFace(c, 100, 124, 1.05) +
        `<circle cx="100" cy="150" r="1" fill="none"/>` + [0, 60, 120].map(a => `<path d="M100 141 L100 157" stroke="${c.main}" stroke-width="3" stroke-linecap="round" transform="rotate(${a} 100 149)"/>`).join(''),
    ],
    star: [
      null,
      c => shadow(44) + feet(c, 172, 20, 13, 8) + `<path d="M100 92 Q104 80 100 70" ${st(c, 4)} fill="none"/>` + star(c, 100, 62, 14) +
        body(c, 100, 132, 46, 42) + belly(c, 100, 146, 26, 20) + face(c, 100, 128, 1),
      c => shadow(56) + [-1, 1].map(d => `<path d="M${100 + d * 52} 120 C${100 + d * 76} 100 ${100 + d * 82} 120 ${100 + d * 74} 136 C${100 + d * 68} 130 ${100 + d * 60} 132 ${100 + d * 54} 138Z" fill="#fff" ${st(c, 3.5)}/>`).join('') +
        feet(c, 172, 26) + `<ellipse cx="100" cy="134" rx="60" ry="42" fill="${c.main}" ${st(c)}/>` + belly(c, 100, 150, 34, 20) + star(c, 100, 108, 11) + coolFace(c, 100, 130, 1.05),
    ],
  };

  /* ---------- つよい すがた(おとな・さいしゅう) ---------- */
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mixc = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
  const MIR = s => `<g transform="matrix(-1 0 0 1 200 0)">${s}</g>`;
  const both = s => s + MIR(s);
  const CLAW = '#FFF6E0';
  const tail = (c, d, w) => `<path d="${d}" ${st(c, w)} fill="none"/><path d="${d}" stroke="${c.main}" stroke-width="${w - 7}" fill="none" stroke-linecap="round"/>`;
  // きりっと した め(まゆが なかに むかって さがる)
  function coolEyes(c, cx, cy, s) {
    const one = `<g transform="translate(${cx + 16 * s} ${cy}) scale(${s})">` +
      `<path d="M-10 1 L-9 -3 Q1 -6 13 -10 Q12 3 2 6 Q-6 7 -10 1Z" fill="#fff" ${st(c, 2.2)}/>` +
      `<circle cx="1.8" cy="0.2" r="4.6" fill="${c.iris}"/><ellipse cx="1.8" cy="0.2" rx="1.5" ry="4" fill="#1A1424"/>` +
      `<circle cx="3.6" cy="-1.8" r="1.4" fill="#fff"/>` +
      `<path d="M-13 -1 Q0 -8 16 -14" ${st(c, 4.2)} fill="none"/></g>`;
    return one + `<g transform="translate(${2 * cx} 0) scale(-1 1)">${one}</g>`;
  }
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
  function coolFace(c, cx, cy, s) { return coolEyes(c, cx, cy, s * 0.95) + mouth(c, cx, cy + 14 * s, s * 0.9, 'grin'); }

  // 2ほんあしで たつ からだ。o の パーツを うしろ→まえ の じゅんに かさねる
  function beast(c, id, o) {
    const g = 'bg' + id, F = `url(#${g})`;
    const defs = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mixc(c.main, '#ffffff', 0.28)}"/><stop offset=".55" stop-color="${c.main}"/><stop offset="1" stop-color="${mixc(c.main, '#000000', 0.2)}"/></linearGradient></defs>`;
    const leg = `<path d="M72 142 C60 150 58 166 64 176 L57 184 L67 181 L72 186 L77 181 L87 184 L83 172 C89 162 90 150 86 142Z" fill="${F}" ${st(c)}/>` +
      `<path d="M57 184 L60 178 M72 186 L72 180 M87 184 L84 178" stroke="${CLAW}" stroke-width="3" stroke-linecap="round"/>`;
    const arm = `<path d="M66 100 C50 102 42 118 44 134 C45 142 50 146 56 145 C62 144 66 138 66 130 C66 120 72 112 78 108Z" fill="${F}" ${st(c)}/>` +
      `<path d="M46 141 L44 150 L50 144Z M51 145 L51 154 L55 146Z M57 145 L59 153 L61 144Z" fill="${CLAW}" ${st(c, 2)}/>`;
    const torso = `<path d="M64 98 C54 112 58 140 72 154 C84 162 116 162 128 154 C142 140 146 112 136 98 C122 88 78 88 64 98Z" fill="${F}" ${st(c)}/>`;
    const pl = mixc(c.belly, c.dark, 0.3);
    const bellyP = `<path d="M84 104 C78 122 82 142 90 152 C96 156 104 156 110 152 C118 142 122 122 116 104 C108 99 92 99 84 104Z" fill="${c.belly}"/>` +
      `<path d="M85 118 Q100 123 115 118 M83 132 Q100 137 117 132 M87 145 Q100 150 113 145" stroke="${pl}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    const head = `<path d="M68 72 C64 52 80 36 100 36 C120 36 136 52 132 72 C130 90 116 100 100 100 C84 100 70 90 68 72Z" fill="${F}" ${st(c)}/>`;
    const muzzle = o.muzzle ? `<ellipse cx="100" cy="86" rx="17" ry="11" fill="${c.belly}"/><ellipse cx="100" cy="80" rx="4.5" ry="3" fill="${c.dark}"/>` : '';
    const all = (o.back || '') + both(leg) + torso + bellyP + (o.body || '') + both(arm) + (o.arms || '') + (o.headBack || '') + head + muzzle + (o.head || '') +
      coolEyes(c, 100, 66, 1.1) + mouth(c, 100, o.muzzle ? 90 : 85, 1.1, o.mouth || 'grin') + (o.front || '');
    const sc = o.sc || 0.94;
    return defs + (o.aura || '') + shadow(sc < 0.92 ? 54 : 62) + (sc < 1 ? `<g transform="translate(100 186) scale(${sc}) translate(-100 -186)">${all}</g>` : all);
  }

  const wing = c => `<path d="M68 104 C44 68 18 52 2 60 C12 68 14 78 10 88 C22 84 28 92 24 104 C36 98 44 106 42 118 C52 110 60 112 68 118Z" fill="${c.dark}" ${st(c)}/>` +
    `<path d="M66 106 L12 64 M66 110 L22 90 M66 114 L36 104" stroke="${mixc(c.dark, '#ffffff', 0.35)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  const fur = (c, x, y, col) => `<path d="M${x} ${y} L${x - 16} ${y - 2} L${x - 4} ${y + 6} L${x - 15} ${y + 13} L${x + 2} ${y + 14}Z" fill="${col || c.main}" ${st(c, 3)}/>`;
  const stripe = c => `<path d="M62 112 L76 117 L66 123 L80 128" stroke="${c.dark}" stroke-width="4.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
  const ringBack = (c, w) => `<path d="M17 133 A84 20 -10 0 1 183 103" stroke="${c.dark}" stroke-width="${w}" fill="none"/><path d="M17 133 A84 20 -10 0 1 183 103" stroke="${c.acc}" stroke-width="${w - 7}" fill="none"/>`;
  const ringFront = (c, w) => `<path d="M183 103 A84 20 -10 0 1 17 133" stroke="${c.dark}" stroke-width="${w}" fill="none"/><path d="M183 103 A84 20 -10 0 1 17 133" stroke="${c.acc}" stroke-width="${w - 7}" fill="none"/>`;
  const night = (c, id) => `<defs><linearGradient id="nt${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2F7A"/><stop offset="1" stop-color="#17123A"/></linearGradient></defs>`;

  const STRONG = {
    fire: [
      (c, id) => beast(c, id, { sc: 0.9,
        back: tail(c, 'M122 150 C156 156 178 134 176 104', 16) + flame(c, 176, 98, 1.05, '#FF4D3A'),
        arms: both(`<path d="M62 96 L46 86 L54 102Z" fill="${c.acc}" ${st(c, 3)}/>`),
        headBack: both(`<path d="M78 48 C66 40 60 24 66 10 C72 24 82 32 90 38Z" fill="#FFF0D6" ${st(c, 3.5)}/>`) + flame(c, 100, 40, 1.1, '#FF4D3A'),
        head: both(`<path d="M70 76 L56 80 L70 86Z" fill="${c.main}" ${st(c, 3)}/>`),
      }),
      (c, id) => beast(c, id, { mouth: 'roar', aura: aura('a' + id, '#FF8A3C'),
        back: both(wing(c)) + tail(c, 'M124 152 C164 160 190 134 186 100', 18) + flame(c, 186, 94, 1.25, '#FF4D3A'),
        arms: both(`<path d="M62 96 L42 84 L54 104Z" fill="${c.acc}" ${st(c, 3)}/><path d="M68 92 L56 74 L72 88Z" fill="${c.acc}" ${st(c, 3)}/>`),
        headBack: flame(c, 84, 44, 0.8) + flame(c, 116, 44, 0.8) + flame(c, 100, 36, 1.25, '#FF4D3A') +
          both(`<path d="M80 46 C62 36 54 18 62 0 C70 18 80 28 92 36Z" fill="#FFE7A8" ${st(c, 3.5)}/>`),
        head: both(`<path d="M70 74 L52 76 L68 84 L56 90 L72 90Z" fill="${c.main}" ${st(c, 3)}/>`),
        body: `<path d="${starPath(100, 112, 7, 3, 4)}" fill="${c.acc}"/>`,
      }),
    ],
    water: [
      (c, id) => beast(c, id, { sc: 0.9, mouth: 'shark',
        back: `<path d="M120 152 C146 160 164 156 178 142 C176 156 182 168 194 174 C176 178 156 172 140 166Z" fill="${c.main}" ${st(c)}/>`,
        arms: both(`<path d="M48 118 L30 108 L44 134Z" fill="${c.dark}" ${st(c, 3)}/>`),
        headBack: `<path d="M90 42 C94 18 110 4 132 2 C120 18 116 32 118 46Z" fill="${c.dark}" ${st(c)}/>`,
        head: both(`<path d="M74 74 q-3 5 0 10 M80 76 q-3 5 0 10" ${st(c, 2.5)} fill="none"/>`),
      }),
      (c, id) => beast(c, id, { mouth: 'roar', muzzle: true, aura: aura('a' + id, '#5DB8FF'),
        back: tail(c, 'M124 150 C162 168 194 148 188 108', 18) + `<path d="M188 108 L176 92 L196 96Z" fill="${c.acc}" ${st(c, 3)}/>` +
          both(`<path d="M64 98 L44 78 L68 90Z" fill="${c.acc}" ${st(c, 3)}/><path d="M60 112 L40 102 L60 120Z" fill="${c.acc}" ${st(c, 3)}/>`),
        headBack: both(`<path d="M72 62 C50 52 40 32 44 14 C54 28 64 34 74 44Z" fill="${c.acc}" ${st(c, 3.5)}/><path d="M70 74 C52 72 40 60 38 46 C50 56 60 58 72 62Z" fill="${c.acc}" ${st(c, 3.5)}/>`) +
          `<path d="M100 40 C94 28 96 14 104 4 C108 18 108 30 104 40Z" fill="#E8F7FF" ${st(c, 3.5)}/>`,
        head: both(`<path d="M84 90 C68 96 54 92 42 80" ${st(c, 3)} fill="none"/>`),
        front: `<path d="M0 178 Q20 164 40 178 T80 178 T120 178 T160 178 T200 178 L200 200 L0 200Z" fill="${c.acc}" opacity=".85"/>` +
          `<circle cx="26" cy="132" r="9" fill="#E8F7FF" ${st(c, 2.5)}/><circle cx="176" cy="52" r="7" fill="#E8F7FF" ${st(c, 2.5)}/>`,
      }),
    ],
    grass: [
      (c, id) => beast(c, id, { sc: 0.9, muzzle: true,
        headBack: both(leaf(c, 70, 64, -70, 0.9, '#3FA34D') + leaf(c, 72, 80, -110, 0.8, '#3FA34D') + `<circle cx="72" cy="44" r="14" fill="${c.main}" ${st(c)}/><circle cx="72" cy="44" r="6" fill="${c.belly}"/>`),
        arms: both(`<path d="M58 94 C46 92 42 104 44 114 C54 108 62 108 74 104 C72 98 66 94 58 94Z" fill="#9A6B3C" ${st(c, 3.5)}/>`),
        head: leaf(c, 100, 50, 0, 0.6, '#2F9A3E'),
      }),
      (c, id) => beast(c, id, { muzzle: true, aura: aura('a' + id, '#8EE08A'),
        back: `<g fill="#3E9B48" ${st(c)}><circle cx="48" cy="104" r="28"/><circle cx="152" cy="104" r="28"/><circle cx="34" cy="138" r="20"/><circle cx="166" cy="138" r="20"/></g>` +
          [[40, 96], [158, 92], [30, 136], [168, 140], [58, 120], [144, 122]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="${c.acc}" ${st(c, 2)}/><circle cx="${x}" cy="${y}" r="2.2" fill="#FFE066"/>`).join(''),
        arms: both(`<path d="M58 92 C42 90 38 104 40 116 C52 110 62 108 76 104 C74 96 66 92 58 92Z" fill="#9A6B3C" ${st(c, 3.5)}/>` + leaf(c, 50, 100, -60, 0.5, '#3FA34D')),
        headBack: both(`<path d="M82 46 C74 30 64 22 50 20 M66 25 C64 15 66 8 72 2 M56 21 C48 13 40 12 32 14" stroke="#7A4A22" stroke-width="7" stroke-linecap="round" fill="none"/>` +
          leaf(c, 32, 14, -100, 0.45, '#3FA34D') + leaf(c, 72, 4, -15, 0.45, '#3FA34D') + leaf(c, 50, 20, -60, 0.45, '#3FA34D') +
          `<circle cx="72" cy="46" r="13" fill="${c.main}" ${st(c)}/><circle cx="72" cy="46" r="5.5" fill="${c.belly}"/>`),
        head: `<circle cx="100" cy="48" r="6" fill="${c.acc}" ${st(c, 2.5)}/><circle cx="100" cy="48" r="2.4" fill="#FFE066"/>`,
      }),
    ],
    elec: [
      (c, id) => beast(c, id, { sc: 0.9, muzzle: true,
        back: tailCurl(c, 124, 156, 1.2, 15) + bolt(c, 156, 94, 0.8),
        body: both(stripe(c)),
        arms: both(`<path d="M47 118 L57 121 L50 127" stroke="${c.dark}" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`),
        headBack: both(`<path d="M74 50 L62 10 L92 38Z" fill="${c.main}" ${st(c)}/><path d="M74 43 L67 21 L86 38Z" fill="${c.acc}"/>`),
        head: both(fur(c, 70, 72)) + `<path d="M94 42 L100 52 L106 42" stroke="${c.dark}" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`,
      }),
      (c, id) => beast(c, id, { muzzle: true, mouth: 'roar', aura: aura('a' + id, '#FFE066'),
        back: tailCurl(c, 124, 156, 1.35, 16) + bolt(c, 162, 82, 0.95, '#fff'),
        body: both(stripe(c)),
        arms: both(`<path d="M47 118 L57 121 L50 127" stroke="${c.dark}" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`),
        headBack: `<path d="${starPath(100, 68, 70, 44, 16)}" fill="${c.acc}" ${st(c)}/><path d="${starPath(100, 68, 56, 40, 16, -79)}" fill="#FFB547"/>` +
          both(`<path d="M74 50 L64 12 L92 38Z" fill="${c.main}" ${st(c)}/><path d="M74 43 L69 23 L86 38Z" fill="${c.acc}"/>`),
        head: both(fur(c, 70, 72)) + `<path d="M94 42 L100 52 L106 42" stroke="${c.dark}" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`,
        front: bolt(c, 22, 44, 0.7, '#fff') + bolt(c, 180, 150, 0.6, '#fff') + bolt(c, 24, 150, 0.5, '#fff'),
      }),
    ],
    ice: [
      (c, id) => beast(c, id, { sc: 0.9, muzzle: true,
        back: both(crystal(c, 66, 104, 46, -30) + crystal(c, 80, 96, 36, -10)),
        body: `<path d="M64 98 L72 112 L79 100 L87 116 L94 102 L100 118 L106 102 L113 116 L121 100 L128 112 L136 98 Q100 88 64 98Z" fill="#fff" ${st(c, 3)}/>`,
        arms: both(crystal(c, 58, 102, 24, -55)),
        headBack: both(`<path d="M74 48 L64 6 L94 36Z" fill="${c.main}" ${st(c)}/><path d="M74 41 L69 18 L88 36Z" fill="${c.acc}"/>`),
      }),
      (c, id) => beast(c, id, { muzzle: true, aura: aura('a' + id, '#B9ECFF'),
        back: `<defs><linearGradient id="au${id}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#7FF2C2"/><stop offset=".5" stop-color="#8FB8FF"/><stop offset="1" stop-color="#C79BFF"/></linearGradient></defs>` +
          `<path d="M64 96 C30 120 18 160 22 186 L178 186 C182 160 170 120 136 96Z" fill="url(#au${id})" ${st(c)}/>` + both(crystal(c, 70, 102, 50, -28)),
        body: `<path d="M64 98 L72 112 L79 100 L87 116 L94 102 L100 118 L106 102 L113 116 L121 100 L128 112 L136 98 Q100 88 64 98Z" fill="#fff" ${st(c, 3)}/>`,
        arms: both(crystal(c, 58, 104, 30, -55) + crystal(c, 64, 98, 22, -25)),
        headBack: both(`<path d="M74 48 L64 10 L94 36Z" fill="${c.main}" ${st(c)}/><path d="M74 41 L69 20 L88 36Z" fill="${c.acc}"/>`) +
          both(crystal(c, 84, 42, 26, -20)) + crystal(c, 100, 40, 40),
        front: sparkle(30, 58, 8) + sparkle(170, 46, 10) + sparkle(176, 140, 7) + sparkle(24, 150, 6),
      }),
    ],
    star: [
      (c, id) => beast(c, id, { sc: 0.9,
        back: ringBack(c, 13),
        body: star(c, 76, 124, 4, '#fff', 0) + star(c, 122, 138, 3.5, '#fff', 0),
        headBack: both(`<path d="M78 46 C62 40 56 22 64 6 C68 22 78 32 92 38Z" fill="${c.acc}" ${st(c, 3.5)}/>`),
        head: star(c, 100, 50, 6, c.acc, 2),
        front: ringFront(c, 13),
      }),
      (c, id) => beast(c, id, { mouth: 'roar', aura: aura('a' + id, '#C3A8FF'),
        back: `<path d="${starPath(100, 96, 90, 46, 5)}" fill="#FFF3A6" ${st(c)}/>` + night(c, id) +
          `<path d="M64 96 C34 124 24 162 26 186 L174 186 C176 162 166 124 136 96Z" fill="url(#nt${id})" ${st(c)}/>` +
          [[40, 160], [52, 136], [160, 150], [148, 128], [36, 178], [166, 176]].map(([x, y], k) => star(c, x, y, k % 2 ? 3 : 4.5, '#FFE066', 0)).join(''),
        body: star(c, 76, 124, 4, '#fff', 0) + star(c, 122, 138, 3.5, '#fff', 0),
        headBack: both(`<path d="M80 46 C60 40 50 18 60 0 C66 20 78 30 94 36Z" fill="${c.acc}" ${st(c, 3.5)}/>`),
        head: star(c, 100, 50, 7, c.acc, 2),
        front: sparkle(28, 50, 9, '#FFE066') + sparkle(176, 34, 8) + sparkle(182, 110, 6, '#FFE066'),
      }),
    ],
  };
  for (const k in STRONG) { DRAW[k][3] = STRONG[k][0]; DRAW[k][4] = STRONG[k][1]; }

  function svg(lineId, stage) {
    const L = LINES.find(l => l.id === lineId);
    const inner = stage === 0 ? egg(L) : DRAW[lineId][stage](L.c, 'a' + (++uid));
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
  }

  window.MONSTERS = { LINES, svg, STAGES: 5 };
})();
