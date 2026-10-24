// なぞモン モンスターデータと絵(SVG)
// 6けいとう × 5だんかい(0=たまご … 4=さいしゅう)。絵はすべて 200×200 の SVG をその場で組み立てる
(function () {
  const LINES = [
    { id: 'fire', label: 'ほのお', icon: '🔥', c: { main: '#FF7A45', dark: '#A8401E', belly: '#FFE2C2', acc: '#FFC93C', egg: '#FFE6D6' },
      names: ['ほのおの たまご', 'ヒノピー', 'メラッコ', 'ボルケン', 'エンペラドン'],
      notes: ['ほんのり あったかい たまご。ときどき ぽっと ひかる', 'あたまの ひが ちいさな ろうそく くらい。ねる ときは ほそく なる', 'しっぽの ひで やきいもを やくのが とくい', 'あたまの かざんから ひを ふきだす。おこると もっと もえる', 'おおきな つばさで そらを とぶ ほのおの おうさま'] },
    { id: 'water', label: 'みず', icon: '💧', c: { main: '#4DA8F0', dark: '#1F5F99', belly: '#DDF1FF', acc: '#8FE0FF', egg: '#E2F2FF' },
      names: ['みずの たまご', 'シズクン', 'アワール', 'ナミザメ', 'カイリュード'],
      notes: ['さわると ひんやり。なかで ちゃぷちゃぷ おとが する', 'しずくの かたちの あかちゃん。あめの ひは ごきげん', 'あたまの ひれで あわを つくって あそぶ', 'なみに のって すいすい およぐ。はが するどい', 'うみを まもる りゅう。ひと ほえで おおなみを よぶ'] },
    { id: 'grass', label: 'くさ', icon: '🌱', c: { main: '#6CC56A', dark: '#2F7A36', belly: '#E8F8D8', acc: '#FF9EC0', egg: '#E6F7DC' },
      names: ['くさの たまご', 'メブキ', 'ハッパル', 'モリクマ', 'ジュカイオー'],
      notes: ['おひさまに あてると すこし おおきく なる たまご', 'あたまの めが いつか おおきな きに なる', 'みみの はっぱで かぜを かんじる', 'もりで いちばん ちからもち。はなが だいすき', 'せなかの もりに ことりたちが すむ もりの おうさま'] },
    { id: 'elec', label: 'でんき', icon: '⚡', c: { main: '#FFD23F', dark: '#A3780A', belly: '#FFF6D0', acc: '#FF9A3C', egg: '#FFF4CC' },
      names: ['でんきの たまご', 'ビリリン', 'ピリネコ', 'イナズマル', 'ライトニオン'],
      notes: ['さわると ぴりっと する ふしぎな たまご', 'うれしいと からだから ぱちぱち ひばなが でる', 'しっぽの でんきで よるの みちを てらす', 'かみなりの ように すばやく はしる', 'たてがみの いなずまで そらを ひからせる'] },
    { id: 'ice', label: 'こおり', icon: '❄', c: { main: '#A8E6F5', dark: '#3E8AA8', belly: '#FFFFFF', acc: '#D6C6FF', egg: '#EEF9FF' },
      names: ['こおりの たまご', 'ユキポ', 'ツララビ', 'ヒョウガロン', 'オーロラキング'],
      notes: ['ゆきの ように しろい たまご。なつは ちょっと にがて', 'ころころ ころがって ゆきだまを つくる', 'つららの みみは かたくて ぴかぴか', 'せなかの こおりの とげで みを まもる', 'オーロラの マントを なびかせる こおりの おうさま'] },
    { id: 'star', label: 'ほし', icon: '⭐', c: { main: '#B79CFF', dark: '#5C3FA8', belly: '#F2ECFF', acc: '#FFE066', egg: '#F1EAFF' },
      names: ['ほしの たまご', 'キラリン', 'ホシモッチ', 'ギャラクシオ', 'コスモスター'],
      notes: ['よるに なると きらきら ひかる たまご', 'ながれぼしに のって やって きたらしい', 'もちもちの からだ。ねがいごとを きくのが すき', 'からだの わっかで うちゅうを とびまわる', 'ほしぞらを まもる うちゅうの おうさま'] },
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
        body(c, 100, 130, 52, 48) + belly(c, 100, 146, 30, 24) + face(c, 100, 124, 1.05),
      c => shadow(60) + `<path d="M146 150 C182 152 190 120 176 96" ${st(c, 18)} fill="none"/><path d="M146 150 C182 152 190 120 176 96" stroke="${c.main}" stroke-width="10" fill="none" stroke-linecap="round"/>` + flame(c, 176, 92, 1.1) +
        `<path d="M66 82 C54 66 56 50 66 42 C68 56 76 64 82 70Z" fill="${c.belly}" ${st(c, 3.5)}/><path d="M134 82 C146 66 144 50 134 42 C132 56 124 64 118 70Z" fill="${c.belly}" ${st(c, 3.5)}/>` +
        flame(c, 100, 66, 1.15, '#FF4D3A') + feet(c, 176, 26, 17, 10) + body(c, 100, 124, 58, 56) + belly(c, 100, 142, 34, 30) + arms(c, 132, 58) + face(c, 100, 112, 1.1, { open: true }),
      (c, id) => aura(id, '#FFB347') + shadow(66) +
        `<path d="M62 102 C30 60 6 64 4 92 C18 86 26 96 22 108 C34 102 42 110 40 122 C50 114 58 118 62 124Z" fill="${c.dark}" ${st(c)}/><path d="M138 102 C170 60 194 64 196 92 C182 86 174 96 178 108 C166 102 158 110 160 122 C150 114 142 118 138 124Z" fill="${c.dark}" ${st(c)}/>` +
        `<path d="M150 154 C186 160 196 128 186 104" ${st(c, 20)} fill="none"/><path d="M150 154 C186 160 196 128 186 104" stroke="${c.main}" stroke-width="12" fill="none" stroke-linecap="round"/>` + flame(c, 186, 98, 1.2, '#FF4D3A') +
        `<path d="M70 78 C56 60 58 40 70 30 C72 46 80 56 86 64Z" fill="${c.belly}" ${st(c, 3.5)}/><path d="M130 78 C144 60 142 40 130 30 C128 46 120 56 114 64Z" fill="${c.belly}" ${st(c, 3.5)}/>` +
        flame(c, 80, 66, 0.75) + flame(c, 120, 66, 0.75) + flame(c, 100, 58, 1.05) + crown(c, 100, 66, 0.9) +
        feet(c, 178, 28, 18, 10) + body(c, 100, 124, 60, 58) + belly(c, 100, 142, 36, 32) + arms(c, 134, 60) + face(c, 100, 110, 1.15, { open: true, brow: true }),
    ],
    water: [
      null,
      c => shadow(44) + `<path d="M100 74 C120 100 146 114 146 140 C146 166 126 178 100 178 C74 178 54 166 54 140 C54 114 80 100 100 74Z" fill="${c.main}" ${st(c)}/>` + belly(c, 100, 154, 24, 16) +
        `<ellipse cx="82" cy="112" rx="5" ry="10" fill="#fff" opacity=".6" transform="rotate(30 82 112)"/>` + face(c, 100, 140, 1),
      c => shadow(52) + `<path d="M50 150 C30 150 22 134 26 120 C36 130 44 132 54 130Z" fill="${c.acc}" ${st(c)}/>` +
        `<path d="M84 86 C86 64 104 56 118 62 C108 68 106 78 110 90Z" fill="${c.acc}" ${st(c)}/>` + feet(c, 174) +
        body(c, 100, 130, 52, 48) + belly(c, 100, 148, 30, 22) + face(c, 100, 124, 1.05) +
        `<circle cx="150" cy="80" r="8" fill="#fff" opacity=".7" ${st(c, 2)}/><circle cx="162" cy="62" r="5" fill="#fff" opacity=".7" ${st(c, 2)}/>`,
      c => shadow(60) + `<path d="M150 150 C176 156 186 140 190 120 C178 128 168 128 158 120 C170 116 176 104 174 90 C162 104 150 112 140 128Z" fill="${c.main}" ${st(c)}/>` +
        `<path d="M86 72 C92 46 112 34 128 36 C116 50 114 62 116 76Z" fill="${c.dark}" ${st(c)}/>` + feet(c, 176, 26, 17, 10) +
        body(c, 100, 124, 58, 56) + belly(c, 100, 144, 36, 28) + arms(c, 132, 58, 50, 9, 18) +
        [-1, 1].map(d => [0, 8].map(o => `<path d="M${100 + d * (38 + o)} ${104} q${d * 3} 7 0 14" ${st(c, 2.5)} fill="none"/>`).join('')).join('') + face(c, 100, 110, 1.1, { open: true }),
      (c, id) => aura(id, '#7CC8FF') + shadow(70) +
        `<path d="M10 176 Q30 160 50 176 T90 176 T130 176 T170 176 T200 172 L200 200 L0 200Z" fill="${c.acc}" opacity=".8"/>` +
        `<path d="M150 150 C182 154 194 132 196 108 C182 118 170 118 160 110 C174 104 180 90 176 74 C162 92 150 104 140 124Z" fill="${c.main}" ${st(c)}/>` +
        `<path d="M50 96 C24 84 16 62 22 46 C34 62 46 66 60 74Z" fill="${c.acc}" ${st(c)}/><path d="M150 96 C176 84 184 62 178 46 C166 62 154 66 140 74Z" fill="${c.acc}" ${st(c)}/>` +
        [76, 100, 124].map((x, i) => `<path d="M${x} ${i === 1 ? 30 : 42} C${x + 12} ${i === 1 ? 46 : 56} ${x + 10} ${i === 1 ? 64 : 70} ${x} ${i === 1 ? 70 : 74} C${x - 10} ${i === 1 ? 64 : 70} ${x - 12} ${i === 1 ? 46 : 56} ${x} ${i === 1 ? 30 : 42}Z" fill="#E8F7FF" ${st(c, 3)}/>`).join('') +
        feet(c, 178, 28, 18, 10) + body(c, 100, 122, 60, 58) + belly(c, 100, 142, 36, 32) + arms(c, 132, 60) +
        `<path d="M78 128 C60 132 48 128 40 118" ${st(c, 2.5)} fill="none"/><path d="M122 128 C140 132 152 128 160 118" ${st(c, 2.5)} fill="none"/>` + face(c, 100, 108, 1.15, { open: true, brow: true }),
    ],
    grass: [
      null,
      c => shadow(44) + feet(c, 172, 20, 13, 8) + `<path d="M100 92 L100 70" ${st(c, 4)} fill="none"/>` + leaf(c, 100, 72, -55, 0.6) + leaf(c, 100, 72, 55, 0.6) +
        body(c, 100, 132, 46, 42) + belly(c, 100, 146, 26, 20) + face(c, 100, 128, 1),
      c => shadow(52) + leaf(c, 62, 96, -50, 1) + leaf(c, 138, 96, 50, 1) + leaf(c, 150, 162, 70, 0.7) + feet(c, 174) +
        body(c, 100, 130, 52, 48) + belly(c, 100, 146, 30, 24) + face(c, 100, 124, 1.05) +
        `<circle cx="72" cy="96" r="6" fill="${c.acc}" ${st(c, 2.5)}/>`,
      c => shadow(60) + [-1, 1].map(d => `<circle cx="${100 + d * 44}" cy="80" r="17" fill="${c.main}" ${st(c)}/><circle cx="${100 + d * 44}" cy="80" r="8" fill="${c.belly}"/>`).join('') +
        leaf(c, 86, 72, -25, 0.8, '#3FA34D') + leaf(c, 100, 70, 0, 0.9, '#3FA34D') + leaf(c, 114, 72, 25, 0.8, '#3FA34D') +
        feet(c, 176, 26, 17, 10) + body(c, 100, 124, 58, 56) + belly(c, 100, 142, 36, 30) + arms(c, 132, 58) +
        `<g>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="146" cy="70" rx="5" ry="8" fill="${c.acc}" transform="rotate(${a} 146 78)"/>`).join('')}<circle cx="146" cy="78" r="4" fill="#FFE066"/></g>` + face(c, 100, 112, 1.1),
      (c, id) => aura(id, '#A8E89A') + shadow(68) +
        `<g fill="#3FA34D" ${st(c)}><circle cx="100" cy="48" r="34"/><circle cx="62" cy="62" r="28"/><circle cx="138" cy="62" r="28"/><circle cx="40" cy="92" r="22"/><circle cx="160" cy="92" r="22"/></g>` +
        `<g fill="#3FA34D"><circle cx="100" cy="52" r="30"/><circle cx="64" cy="66" r="24"/><circle cx="136" cy="66" r="24"/></g>` +
        [[70, 50], [128, 44], [100, 30], [46, 88], [156, 86], [112, 66]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${c.acc}" ${st(c, 2)}/><circle cx="${x}" cy="${y}" r="2.4" fill="#FFE066"/>`).join('') +
        `<path d="M84 186 C86 176 92 172 100 172" stroke="#8B5A2B" stroke-width="6" fill="none"/>` +
        feet(c, 178, 28, 18, 10) + body(c, 100, 126, 60, 56) + belly(c, 100, 144, 36, 30) + arms(c, 134, 60) +
        crown(c, 100, 80, 0.85) + face(c, 100, 112, 1.15, { brow: true }) +
        `<ellipse cx="164" cy="64" rx="8" ry="6" fill="#FFB0C8" ${st(c, 2)}/><circle cx="168" cy="62" r="1.5" fill="#2B2340"/>`,
    ],
    elec: [
      null,
      c => shadow(44) + feet(c, 172, 20, 13, 8) + `<path d="M70 104 L62 74 L88 94Z" fill="${c.main}" ${st(c)}/><path d="M130 104 L138 74 L112 94Z" fill="${c.main}" ${st(c)}/>` +
        body(c, 100, 132, 46, 42) + belly(c, 100, 146, 26, 20) + face(c, 100, 128, 1) +
        bolt(c, 156, 102, 0.6) + bolt(c, 44, 112, 0.5),
      c => shadow(52) + tailCurl(c, 142, 156, 1, 12) + bolt(c, 172, 100, 0.6) +
        `<path d="M64 102 L56 62 L92 88Z" fill="${c.main}" ${st(c)}/><path d="M136 102 L144 62 L108 88Z" fill="${c.main}" ${st(c)}/><path d="M66 94 L62 74 L80 88Z" fill="${c.acc}"/><path d="M134 94 L138 74 L120 88Z" fill="${c.acc}"/>` +
        feet(c, 174) + body(c, 100, 130, 52, 48) + belly(c, 100, 148, 30, 22) + bolt(c, 100, 98, 0.45) + face(c, 100, 124, 1.05),
      c => shadow(60) + tailCurl(c, 148, 158, 1.2, 15) + bolt(c, 184, 86, 0.75) +
        `<path d="M60 96 L48 46 L94 80Z" fill="${c.main}" ${st(c)}/><path d="M140 96 L152 46 L106 80Z" fill="${c.main}" ${st(c)}/><path d="M62 86 L56 60 L80 78Z" fill="${c.acc}"/><path d="M138 86 L144 60 L120 78Z" fill="${c.acc}"/>` +
        feet(c, 176, 26, 17, 10) + body(c, 100, 124, 58, 56) + belly(c, 100, 144, 34, 28) + arms(c, 132, 58) +
        [-1, 1].map(d => `<path d="M${100 + d * 56} ${110} L${100 + d * 44} ${116} L${100 + d * 52} ${122} L${100 + d * 42} ${128}" ${st(c, 4)} fill="none"/>`).join('') +
        bolt(c, 100, 84, 0.5, '#FF7A30') + face(c, 100, 112, 1.1, { open: true }),
      (c, id) => aura(id, '#FFE066') + shadow(68) +
        `<path d="${starPath(100, 108, 92, 62, 14, -90)}" fill="${c.acc}" ${st(c)}/>` +
        `<path d="${starPath(100, 108, 76, 56, 14, -77)}" fill="#FFB547"/>` +
        tailCurl(c, 150, 160, 1.25, 15) + bolt(c, 188, 86, 0.8, '#fff') +
        feet(c, 178, 28, 18, 10) + body(c, 100, 124, 56, 54) + belly(c, 100, 144, 34, 28) + arms(c, 134, 56) +
        crown(c, 100, 70, 0.95, '#FFF3A0') + face(c, 100, 112, 1.15, { open: true, brow: true }) +
        bolt(c, 30, 40, 0.6, '#fff') + bolt(c, 172, 30, 0.5, '#fff'),
    ],
    ice: [
      null,
      c => shadow(44) + feet(c, 172, 20, 13, 8) + crystal(c, 86, 96, 20, -20) + crystal(c, 100, 92, 26) + crystal(c, 114, 96, 20, 20) +
        body(c, 100, 132, 46, 42) + belly(c, 100, 146, 26, 20) + face(c, 100, 128, 1),
      c => shadow(52) + [-1, 1].map(d => `<path d="M${100 + d * 22} ${96} C${100 + d * 20} ${60} ${100 + d * 28} ${34} ${100 + d * 36} ${26} C${100 + d * 44} ${44} ${100 + d * 42} ${72} ${100 + d * 38} ${100}Z" fill="#E6FAFF" ${st(c)}/><path d="M${100 + d * 30} ${90} C${100 + d * 30} ${68} ${100 + d * 33} ${50} ${100 + d * 36} ${42}" stroke="${c.acc}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('') +
        feet(c, 174) + body(c, 100, 130, 52, 48) + belly(c, 100, 148, 30, 22) + face(c, 100, 124, 1.05) +
        `<circle cx="100" cy="150" r="1" fill="none"/>` + [0, 60, 120].map(a => `<path d="M100 141 L100 157" stroke="${c.main}" stroke-width="3" stroke-linecap="round" transform="rotate(${a} 100 149)"/>`).join(''),
      c => shadow(62) + crystal(c, 50, 120, 44, -50) + crystal(c, 62, 92, 50, -25) + crystal(c, 138, 92, 50, 25) + crystal(c, 150, 120, 44, 50) +
        `<path d="M64 84 L58 44 L90 72Z" fill="${c.main}" ${st(c)}/><path d="M136 84 L142 44 L110 72Z" fill="${c.main}" ${st(c)}/>` +
        feet(c, 176, 26, 17, 10) + body(c, 100, 124, 58, 56) + arms(c, 134, 58) +
        `<path d="M58 132 Q66 148 78 140 Q86 156 100 146 Q114 156 122 140 Q134 148 142 132 Q120 150 100 150 Q80 150 58 132Z" fill="#fff" ${st(c, 3)}/>` +
        belly(c, 100, 156, 26, 14) + face(c, 100, 110, 1.1, { open: true }),
      (c, id) => {
        const g = 'au' + id;
        return aura(id, '#C9F0FF') + shadow(70) +
          `<defs><linearGradient id="${g}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#7FF2C2"/><stop offset=".5" stop-color="#8FB8FF"/><stop offset="1" stop-color="#C79BFF"/></linearGradient></defs>` +
          `<path d="M60 92 C30 110 18 150 20 184 L180 184 C182 150 170 110 140 92Z" fill="url(#${g})" ${st(c)}/>` +
          feet(c, 178, 28, 18, 10) + body(c, 100, 124, 58, 56) + belly(c, 100, 144, 34, 30) + arms(c, 134, 58) +
          `<g>${crystal(c, 76, 76, 30, -18)}${crystal(c, 124, 76, 30, 18)}${crystal(c, 100, 70, 44)}</g>` +
          `<path d="M70 82 L130 82" ${st(c, 4)}/>` + face(c, 100, 112, 1.15, { brow: true }) +
          sparkle(40, 60, 8) + sparkle(162, 50, 10) + sparkle(172, 150, 7) + sparkle(30, 140, 6);
      },
    ],
    star: [
      null,
      c => shadow(44) + feet(c, 172, 20, 13, 8) + `<path d="M100 92 Q104 80 100 70" ${st(c, 4)} fill="none"/>` + star(c, 100, 62, 14) +
        body(c, 100, 132, 46, 42) + belly(c, 100, 146, 26, 20) + face(c, 100, 128, 1),
      c => shadow(56) + [-1, 1].map(d => `<path d="M${100 + d * 52} 120 C${100 + d * 76} 100 ${100 + d * 82} 120 ${100 + d * 74} 136 C${100 + d * 68} 130 ${100 + d * 60} 132 ${100 + d * 54} 138Z" fill="#fff" ${st(c, 3.5)}/>`).join('') +
        feet(c, 172, 26) + `<ellipse cx="100" cy="134" rx="60" ry="42" fill="${c.main}" ${st(c)}/>` + belly(c, 100, 150, 34, 20) + star(c, 100, 108, 11) + face(c, 100, 130, 1.05),
      c => shadow(62) + `<ellipse cx="100" cy="132" rx="84" ry="20" fill="none" stroke="${c.dark}" stroke-width="14" transform="rotate(-12 100 132)"/><ellipse cx="100" cy="132" rx="84" ry="20" fill="none" stroke="${c.acc}" stroke-width="7" transform="rotate(-12 100 132)"/>` +
        [-1, 1].map(d => `<path d="M${100 + d * 22} 76 Q${100 + d * 30} 56 ${100 + d * 40} 48" ${st(c, 4)} fill="none"/>` + star(c, 100 + d * 42, 44, 10)).join('') +
        feet(c, 176, 26, 17, 10) + body(c, 100, 124, 58, 56) + belly(c, 100, 142, 34, 30) + arms(c, 120, 58, 50) +
        `<path d="M24 142 A84 20 -12 0 0 176 110" fill="none" stroke="${c.dark}" stroke-width="14" transform="rotate(0)"/>` +
        `<path d="M24 142 A84 20 -12 0 0 176 110" fill="none" stroke="${c.acc}" stroke-width="7"/>` + face(c, 100, 110, 1.1, { open: true }) +
        sparkle(160, 60, 7) + sparkle(36, 80, 6),
      (c, id) => aura(id, '#D8C8FF') + shadow(70) +
        `<path d="${starPath(100, 104, 98, 52, 5)}" fill="#FFF3A6" ${st(c)}/>` +
        `<path d="M30 70 A30 30 0 1 0 58 30 A24 24 0 1 1 30 70Z" fill="${c.acc}" ${st(c, 3)}/>` +
        [-1, 1].map(d => `<path d="M${100 + d * 54} 112 C${100 + d * 84} 84 ${100 + d * 96} 110 ${100 + d * 88} 132 C${100 + d * 80} 124 ${100 + d * 70} 128 ${100 + d * 60} 136Z" fill="#fff" ${st(c, 3.5)}/>`).join('') +
        feet(c, 178, 28, 18, 10) + body(c, 100, 124, 58, 56) + belly(c, 100, 142, 34, 30) + arms(c, 134, 58) +
        star(c, 76, 146, 5, '#fff', 0) + star(c, 120, 154, 4, '#fff', 0) + star(c, 106, 138, 3, '#fff', 0) +
        crown(c, 100, 72, 0.95) + face(c, 100, 110, 1.15, { open: true, brow: true }) +
        sparkle(172, 40, 9, '#FFE066') + sparkle(170, 170, 7) + sparkle(24, 160, 8, '#FFE066'),
    ],
  };

  function svg(lineId, stage) {
    const L = LINES.find(l => l.id === lineId);
    const inner = stage === 0 ? egg(L) : DRAW[lineId][stage](L.c, 'a' + (++uid));
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
  }

  window.MONSTERS = { LINES, svg, STAGES: 5 };
})();
