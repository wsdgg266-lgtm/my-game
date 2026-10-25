// なぞモン モンスターデータ(30けいとう × 5だんかい)
// 絵の部品は monsters-parts.js。ここでは けいとうごとの いろ・なまえ・せつめい・からだの つくりを きめる
// k: だんかい1〜4の からだの つくり / o: その オプション(x は だんかいごとに ふやす かざり)
// so: だんかいごとの うわがき(main・dark などの いろも かえられる)
(function () {
  const P = window.MONPARTS;
  const { both, flame, bolt, leaf, crystal, star, sparkle, gear, crown, cloud, starPath, st, tube } = P;
  const pal = (main, dark, belly, acc, iris, egg) => ({ main, dark, belly, acc, iris, egg });

  const LINES = [
    { id: 'wdragon', label: 'ウォータードラゴン', icon: '💧', egg: 'wave', c: pal('#4DA8F0', '#1F5F99', '#DDF1FF', '#8FE0FF', '#FFD23F', '#E2F2FF'),
      names: ['', 'アクアチ', 'アオリュウ', 'スイリュウガ', 'カイシンリュウ'],
      notes: ['なみの もようの たまご。みみを あてると うみの おとが する', 'みずたまりで あそぶのが だいすきな ちびりゅう', 'くちから みずを ふきだして さかなを とる', 'たきを のぼって つよく なった みずの りゅう', 'うみを まもる かみさまの りゅう。おおなみを よぶ'],
      k: ['chibi', 'dragon', 'dragon', 'dragon'],
      o: { baby: { ears: 'fin', tail: 'dragon', wings: 'bat', crest: 'horn1' }, horn: 'curve', hornCol: '#E8F7FF', tip: 'fin', aura: '#5DB8FF',
        x: (c, id, lv) => ({
          headBack: lv >= 2 ? both(`<path d="M72 62 C52 52 42 34 46 18 C54 30 64 36 74 46Z" fill="${c.acc}" ${st(c, 3.5)}/>`) : '',
          over: lv === 3 ? `<path d="M0 178 Q20 164 40 178 T80 178 T120 178 T160 178 T200 178 L200 200 L0 200Z" fill="${c.acc}" opacity=".85"/><circle cx="24" cy="120" r="8" fill="#E8F7FF" ${st(c, 2.5)}/><circle cx="178" cy="46" r="6" fill="#E8F7FF" ${st(c, 2.5)}/>` : '',
        }) } },
    { id: 'phoenix', label: 'ファイアフェニックス', icon: '🔥', egg: 'flame', c: pal('#FF6A3D', '#A33A16', '#FFE2B8', '#FFC93C', '#FFE066', '#FFE0CC'),
      names: ['', 'ヒヨピー', 'スザク', 'エンオウ', 'フェニクス'],
      notes: ['ほかほか あったかい たまご', 'まだ とべないけど、はねは いつも ぽかぽか', 'みなみの そらを まもる ほのおの とり', 'ほのおの つばさで そらを まっかに そめる', 'なんど でも ほのおから よみがえる ふしぎな とり'],
      k: ['chibi', 'bird', 'bird', 'bird'],
      o: { baby: { crest: 'flame', wings: 'bird', beak: '#FFC93C', tail: 'feather' }, crest: 'flame', beak: '#FFC93C', aura: '#FF8A3C', crestCol: '#FFC93C', fireWing: true,
        x: (c, id, lv) => ({
          defs: `<defs><linearGradient id="fw${id}" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#FF5A2A"/><stop offset="1" stop-color="#FFD23F"/></linearGradient></defs>`,
          back: lv >= 2 ? flame(c, 72, 186, 0.9, '#FF4D2A') + flame(c, 128, 186, 0.9, '#FF4D2A') : '',
          front: lv === 3 ? flame(c, 18, 70, 0.6) + flame(c, 182, 70, 0.6) + sparkle(40, 30, 7, '#FFE066') + sparkle(162, 26, 6, '#FFE066') : '',
        }) } },
    { id: 'turtle', label: 'アースタートル', icon: '🐢', egg: 'crack', c: pal('#7BBF5A', '#3D6B2A', '#F1E7C6', '#5DB85A', '#FFB020', '#E9F3DA'),
      names: ['', 'コガメン', 'ガメドン', 'オオガメス', 'シンリンガイア'],
      notes: ['いしの ように かたい たまご', 'のんびりやの こがめ。こうらは ぴかぴか', 'こうらに いわの とげが はえて きた', 'やまの ように おおきな かめ', 'せなかに もりと やまを のせた だいちの かみさま'],
      k: ['turtle', 'turtle', 'turtle', 'turtle'],
      o: { shell: '#9A7448', aura: '#B8E08A',
        x: (c, id, lv) => {
          const rock = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M-14 0 L-8 -20 L4 -26 L14 -10 L12 0Z" fill="#A8A29A" ${st(c, 3 / s)}/>`;
          let t = '';
          if (lv >= 2) t += rock(70, 86, 0.8) + rock(130, 86, 0.8) + rock(100, 72, 1.1);
          if (lv === 3) t += cloud(c, [[54, 92, 14], [146, 92, 14], [100, 58, 16]], '#4FA84A') + `<path d="M100 62 L100 40" ${st(c, 4)}/>` + rock(100, 52, 1.3) + sparkle(30, 60, 7) + sparkle(172, 50, 6);
          return { shellTop: t, head: lv >= 2 ? both(`<path d="M82 136 L74 124 L88 130Z" fill="${c.belly}" ${st(c, 2.5)}/>`) : '' };
        } } },
    { id: 'griffon', label: 'ウィンドグリフォン', icon: '🌪', egg: 'feather', c: pal('#E9C98A', '#8A6A2C', '#FFF6E0', '#5BBF7A', '#3FBF7F', '#EEF7E6'),
      names: ['', 'ピヨフー', 'ワシシ', 'ソラタカ', 'セイヨクオー'],
      notes: ['かぜが ふくと ころころ うごく たまご', 'かぜに のる れんしゅうを して いる ひな', 'ワシの あたまと ライオンの からだを もつ', 'つばさの ひとふりで たつまきを おこす', 'そらの くにを まもる つばさの おうさま'],
      k: ['chibi', 'bird', 'bird', 'bird'],
      o: { baby: { crest: 'plume', wings: 'bird', beak: '#F2B33C', tail: 'lion' }, crest: 'plume', paws: true, headCol: '#FFF8EA', beak: '#F2B33C', aura: '#9BE8B0', wingCol: '#F7E6BC',
        x: (c, id, lv) => ({
          front: lv >= 2 ? `<path d="M14 150 C30 140 44 146 40 158 C36 166 26 160 30 154" stroke="${c.acc}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M160 40 C176 30 190 36 186 48 C182 56 172 50 176 44" stroke="${c.acc}" stroke-width="4" fill="none" stroke-linecap="round"/>` : '',
        }) } },
    { id: 'dwolf', label: 'ダークウルフ', icon: '🌑', egg: 'swirl', c: pal('#5B4A8A', '#241A40', '#B9A8E0', '#B45CFF', '#FF4D6D', '#E6DFF5'),
      names: ['', 'クロコロ', 'ヤミキバ', 'ダークロウ', 'マロウガ'],
      notes: ['よるに なると くろく ひかる たまご', 'よるに なると げんきに なる こおおかみ', 'くらやみでも めが きく くろい おおかみ', 'かげに とけこんで かぜの ように はしる', 'やみの ちからを あやつる おおかみの おうさま'],
      k: ['chibi', 'quad', 'quad', 'quad'],
      o: { baby: { ears: 'pointed', tail: 'fluffy', earIn: '#B45CFF' }, head: 'canine', ears: 'pointed', tail: 'bushy', ruff: '#3A2D63', aura: '#A35CFF', earIn: '#B45CFF',
        x: (c, id, lv) => ({
          front: lv === 3 ? flame(c, 30, 120, 0.6, '#B45CFF') + flame(c, 172, 118, 0.6, '#B45CFF') + flame(c, 40, 60, 0.45, '#B45CFF') : '',
          headTop: lv >= 2 ? `<path d="M94 46 L100 54 L106 46" stroke="${c.acc}" stroke-width="3" fill="none" stroke-linecap="round"/>` : '',
        }) } },
    { id: 'tlion', label: 'サンダーライオン', icon: '⚡', egg: 'bolt', c: pal('#FFD23F', '#A3780A', '#FFF6D0', '#FF9A3C', '#3FD7FF', '#FFF4CC'),
      names: ['', 'ピリコ', 'ライジュウ', 'ライオウ', 'ライジンガ'],
      notes: ['さわると ぴりぴり する たまご', 'たてがみが まだ ふわふわの こライオン', 'からだに いなずまの もようが ある', 'かみなりの ように ほえる', 'いなずまを よぶ かみなりの けもの'],
      k: ['chibi', 'quad', 'quad', 'quad'],
      o: { baby: { ears: 'round', tail: 'lion', crest: 'tuft', mane: '#FF9A3C' }, head: 'feline', ears: 'round', tail: 'lion', lion: true, mane: '#FF9A3C', aura: '#FFE066',
        x: (c, id, lv) => ({
          body: both(`<path d="M48 150 L60 156 L52 162 L64 168" stroke="${c.dark}" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`),
          front: lv === 3 ? bolt(c, 22, 50, 0.7, '#fff') + bolt(c, 180, 40, 0.6, '#fff') + bolt(c, 182, 150, 0.5, '#fff') : '',
        }) } },
    { id: 'idragon', label: 'アイスドラゴン', icon: '❄️', egg: 'snow', c: pal('#A8E6F5', '#3E8AA8', '#FFFFFF', '#D6F4FF', '#3BA9FF', '#EEF9FF'),
      names: ['', 'ユキチビ', 'ヒョウリュウ', 'ゴクヒョウガ', 'ヒョウセツシン'],
      notes: ['つめたくて ひんやり する たまご', 'はく いきが しろい ちびりゅう', 'こおりの つのが はえて きた', 'ふぶきを ふかせる こおりの りゅう', 'こおりの せかいを おさめる かみさまの りゅう'],
      k: ['chibi', 'dragon', 'dragon', 'dragon'],
      o: { baby: { crest: 'crystal', tail: 'dragon', wings: 'bat', wingCol: '#CFF2FF' }, horn: 'crystal', wingCol: '#CFF2FF', tip: 'crystal', aura: '#B9ECFF', spikeCol: '#E6FAFF',
        x: (c, id, lv) => ({
          arms: lv >= 2 ? both(crystal(c, 60, 100, 26, -50)) : '',
          front: lv === 3 ? sparkle(26, 50, 8) + sparkle(176, 156, 7) + sparkle(30, 150, 6) + sparkle(170, 30, 8) : '',
        }) } },
    { id: 'elk', label: 'フォレストエルク', icon: '🦌', egg: 'leaf', c: pal('#C99A62', '#6B4A28', '#FFF1DC', '#6CC56A', '#3FA34D', '#F3E8D6'),
      names: ['', 'コジカ', 'モリジカ', 'セイジカ', 'タイジュレイ'],
      notes: ['はっぱの いい においが する たまご', 'せなかに しろい てんてんの ある こじか', 'もりを かけまわる げんきな しか', 'つのが ひかる もりの まもりがみ', 'つのが たいじゅに なった もりの せいれい'],
      k: ['chibi', 'quad', 'quad', 'quad'],
      o: { baby: { ears: 'deer', dots: true, crest: 'antler' }, head: 'deer', ears: 'deer', tail: 'deer', antler: true, aura: '#8EE08A',
        x: (c, id, lv) => ({
          body: lv === 1 ? [[60, 150], [70, 166], [134, 150], [130, 166], [100, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#fff" opacity=".9"/>`).join('') : '',
          headTop: lv === 3 ? cloud(c, [[50, 20, 12], [150, 20, 12], [36, 36, 9], [164, 36, 9]], '#5DB85A') +
            [[50, 18], [150, 18], [38, 36], [162, 36]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#FFB0D0"/>`).join('') : (lv === 2 ? leaf(c, 60, 16, -60, 0.4, c.acc) + leaf(c, 140, 16, 60, 0.4, c.acc) : ''),
          front: lv === 3 ? sparkle(30, 110, 7, '#E8FFC8') + sparkle(176, 120, 6, '#E8FFC8') : '',
        }) } },
    { id: 'void', label: 'ヴォイドドラゴン', icon: '🌀', egg: 'swirl', c: pal('#6A4FB0', '#2A1A5C', '#CBB8FF', '#E05CFF', '#FF5CF0', '#E4DAF7'),
      names: ['', 'カゲチビ', 'カゲリュウ', 'コクウリュウ', 'シュウエンリュウ'],
      notes: ['のぞきこむと うちゅうが みえる たまご', 'かげの なかに かくれるのが とくい', 'かげを あやつる くろい りゅう', 'からっぽの うちゅうから やって きた', 'すべてを のみこむ うちゅうの りゅう'],
      k: ['chibi', 'dragon', 'dragon', 'dragon'],
      o: { baby: { crest: 'orb', tail: 'dragon', wings: 'bat', ears: 'horn', hornCol: '#2A1A5C' }, horn: 'spike', hornCol: '#3A2A70', wingCol: '#2A1A5C', tip: 'orb', aura: '#A35CFF',
        x: (c, id, lv) => ({
          back0: lv === 3 ? `<ellipse cx="100" cy="96" rx="92" ry="34" fill="none" stroke="#E05CFF" stroke-width="6" opacity=".55" transform="rotate(-14 100 96)"/><ellipse cx="100" cy="96" rx="92" ry="34" fill="none" stroke="#fff" stroke-width="2" opacity=".6" transform="rotate(-14 100 96)"/>` : '',
          front: lv >= 2 ? [[26, 64], [176, 150], ...(lv === 3 ? [[180, 50], [22, 156]] : [])].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#E05CFF" opacity=".3"/><circle cx="${x}" cy="${y}" r="5" fill="#1A0F3A" stroke="#E05CFF" stroke-width="2"/>`).join('') : '',
        }) } },
    { id: 'mermaid', label: 'マーメイド', icon: '🧜', egg: 'wave', c: pal('#5CC8D8', '#23768A', '#E8FBFF', '#FF9EC0', '#3FA9F5', '#E0F7FA'),
      names: ['', 'プチマル', 'ニンギョン', 'ウミノミコ', 'ウミジョオウ'],
      notes: ['しんじゅの ように ひかる たまご', 'ぷかぷか およぐ ちいさな さかな', 'うたが じょうずな にんぎょの こ', 'うみの いきものと おはなし できる', 'うみの せかいを おさめる にんぎょの じょおう'],
      k: ['fish', 'human', 'human', 'human'],
      o: { tail: true, hair: '#FF8FB8', top: '#FFB3CE', crown: 'shell', aura: '#8FE0FF',
        x: (c, id, lv) => ({
          head: lv === 3 ? `<path d="M84 46 L88 36 L94 44 L100 30 L106 44 L112 36 L116 46Z" fill="#FFD84D" ${st(c, 2.5)}/><circle cx="100" cy="40" r="2.6" fill="#8FE0FF"/>` : '',
          front: `<circle cx="34" cy="80" r="6" fill="#fff" opacity=".8" ${st(c, 2)}/><circle cx="168" cy="60" r="${4 + lv}" fill="#fff" opacity=".8" ${st(c, 2)}/>` + (lv === 3 ? sparkle(30, 140, 7) + sparkle(172, 130, 8) : ''),
        }) } },
    { id: 'rgolem', label: 'ロックゴーレム', icon: '🪨', egg: 'crack', c: pal('#A88A6A', '#5A4330', '#D8C3A8', '#7BC96F', '#FFB020', '#EFE6DA'),
      names: ['', 'コイワ', 'イワゴロ', 'キョガンヘイ', 'ガイアゴーレム'],
      notes: ['ずっしり おもい いしの たまご', 'ころころ ころがる ちいさな いわ', 'いわを つみかさねて できた からだ', 'おおきな いわの へいたい。ちからは だれにも まけない', 'だいちを まもる おおきな いわの きょじん'],
      k: ['golem', 'golem', 'golem', 'golem'],
      o: { core: '#FFB020', eye: '#FFB020', aura: '#E8C9A0',
        x: (c, id, lv) => ({
          body: lv >= 2 ? `<ellipse cx="72" cy="100" rx="10" ry="5" fill="${c.acc}"/><ellipse cx="130" cy="146" rx="8" ry="4" fill="${c.acc}"/>` : '',
          arms: lv >= 2 ? both(`<ellipse cx="40" cy="96" rx="9" ry="4" fill="${c.acc}"/>`) : '',
          head: lv === 3 ? `<path d="M78 56 L84 40 L92 52 L100 34 L108 52 L116 40 L122 56Z" fill="#8C7A66" ${st(c, 3)}/>` : '',
        }) } },
    { id: 'fspirit', label: 'フラワースピリット', icon: '🌸', egg: 'leaf', c: pal('#6CC56A', '#2F7A36', '#E8F8D8', '#FF8FB8', '#FF5D8F', '#FFE6EF'),
      names: ['', 'メブキン', 'ハナポ', 'ハナノセイ', 'フローラ'],
      notes: ['はなの いい においが する たまご', 'あたまの めが うれしそうに ゆれる', 'おおきな はなを さかせた', 'はなびらの はねで とぶ はなの せいれい', 'せかいじゅうに はなを さかせる はるの かみさま'],
      k: ['plant', 'plant', 'human', 'human'],
      o: { hair: '#FFB3D1', wings: 'petal', crown: 'wreath', flowerCol: '#FF8FB8', top: '#8ED88A', aura: '#FFC0DA',
        x: (c, id, lv) => ({
          front: lv >= 2 ? [[30, 60], [170, 70], [24, 150], [176, 160]].slice(0, lv === 3 ? 4 : 2).map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="8" transform="rotate(30 ${x} ${y})" fill="#FFB3D1" ${st(c, 2)}/>`).join('') : '',
        }) },
      so: [null, null, { main: '#FF9EC0', dark: '#A8406E' }, { main: '#FF8FB8', dark: '#A8406E' }] },
    { id: 'scat', label: 'シャドウキャット', icon: '🐈‍⬛', egg: 'swirl', c: pal('#4B3A7A', '#1E1538', '#9F8CD6', '#C27BFF', '#FFE066', '#E2DCF2'),
      names: ['', 'ニャミ', 'ヤミネコ', 'クロネコガ', 'アンコクネコ'],
      notes: ['くらい ところで ひかる たまご', 'あしおとを たてずに あるく こねこ', 'よるの まちを あるく くろねこ', 'かげから かげへ とびうつる', 'よるの やみを おさめる ねこの おうさま'],
      k: ['chibi', 'quad', 'quad', 'quad'],
      o: { baby: { ears: 'pointed', tail: 'cat', earIn: '#C27BFF' }, head: 'feline', ears: 'pointed', tail: 'cat', earIn: '#C27BFF', aura: '#9B5CFF',
        x: (c, id, lv) => ({
          headTop: lv >= 2 ? `<path d="${starPath(100, 50, 5, 2.2, 4)}" fill="${c.acc}"/>` : '',
          front: lv === 3 ? flame(c, 26, 140, 0.55, '#9B5CFF') + flame(c, 176, 140, 0.55, '#9B5CFF') + `<path d="M30 40 A14 14 0 1 0 48 26 A11 11 0 1 1 30 40Z" fill="#FFE066"/>` : '',
        }) } },
    { id: 'eagle', label: 'スカイイーグル', icon: '🦅', egg: 'feather', c: pal('#8A5A3A', '#4A2C18', '#F5EBDD', '#5DB8FF', '#FFC93C', '#E6F1FB'),
      names: ['', 'ヒナワシ', 'ワシード', 'テンワシ', 'ソラシンワシ'],
      notes: ['くもの もようの たまご', 'ふわふわの はねの ひな', 'とおくまで みえる するどい め', 'くもの うえを とぶ そらの ハンター', 'そらを まもる かみさまの わし'],
      k: ['chibi', 'bird', 'bird', 'bird'],
      o: { baby: { crest: 'plume', wings: 'bird', beak: '#FFC93C', crestCol: '#FFFFFF' }, crest: 'tuft', headCol: '#FFFFFF', beak: '#FFC93C', aura: '#7CC8FF',
        x: (c, id, lv) => ({
          front: lv === 3 ? bolt(c, 26, 60, 0.5, '#BFE6FF') + sparkle(176, 40, 8, '#BFE6FF') + sparkle(30, 150, 6) : '',
        }) },
      so: [null, null, null, { wingCol: '#7CC0F5' }] },
    { id: 'magma', label: 'マグマドラゴン', icon: '🌋', egg: 'flame', c: pal('#E2483A', '#7A1E14', '#FFC48A', '#FF9A2E', '#FFE066', '#FFD9CC'),
      names: ['', 'マグチビ', 'エンリュウ', 'ヨウガンリュウ', 'レンゴクリュウ'],
      notes: ['さわると あつい たまご', 'げっぷを すると ひのこが でる', 'マグマの なかを およげる', 'からだを ながれる ようがんが ひかる', 'かざんを ねどこに する ほのおの りゅう'],
      k: ['chibi', 'dragon', 'dragon', 'dragon'],
      o: { baby: { crest: 'flame', tail: 'flame', ears: 'horn', hornCol: '#5A2A20', wings: 'bat', wingCol: '#5A2420' }, horn: 'curve', hornCol: '#4A2A24', wingCol: '#5A2420', tip: 'flame', aura: '#FF6A3C',
        x: (c, id, lv) => ({
          body: `<path d="M70 112 L78 122 L72 134 M130 112 L122 124 L128 136" stroke="#FFC93C" stroke-width="3" fill="none" stroke-linecap="round"/>`,
          arms: both(`<path d="M52 118 L58 126 L54 134" stroke="#FFC93C" stroke-width="3" fill="none" stroke-linecap="round"/>`),
          headTop: lv >= 2 ? flame(c, 100, 40, 0.7, '#FF9A2E') : '',
          front: lv === 3 ? flame(c, 20, 150, 0.7, '#FF6A2A') + flame(c, 182, 158, 0.6, '#FF6A2A') : '',
        }) } },
    { id: 'jelly', label: 'クラゲスピリット', icon: '🪼', egg: 'wave', c: pal('#7FD6F5', '#2E86B0', '#E8FAFF', '#C9A8FF', '#FF8FB8', '#E6F7FF'),
      names: ['', 'プルン', 'ウミツキ', 'シンカイトウ', 'マリンレイ'],
      notes: ['ぷるぷるの たまご', 'ぷかぷか うかぶ ちいさな クラゲ', 'よるの うみで ぼんやり ひかる', 'ふかい うみを てらす あかり', 'うみの そこに すむ ひかりの せいれい'],
      k: ['jelly', 'jelly', 'jelly', 'jelly'], o: { aura: '#9FE8FF' } },
    { id: 'glion', label: 'ゴールデンライオン', icon: '🦁', egg: 'dots', c: pal('#F2B83A', '#8A5A10', '#FFF0C8', '#FFDD66', '#E0402A', '#FFF1C8'),
      names: ['', 'コライ', 'キンジュウ', 'ジュウオウ', 'サンレオン'],
      notes: ['きんいろに かがやく たまご', 'ひなたぼっこが すきな こライオン', 'りっぱな たてがみが はえて きた', 'どうぶつたちの おうさま', 'たいようの ちからを もつ きんいろの けもの'],
      k: ['chibi', 'quad', 'quad', 'quad'],
      o: { baby: { ears: 'round', tail: 'lion', crest: 'tuft', mane: '#E8902A' }, head: 'feline', ears: 'round', tail: 'lion', lion: true, mane: '#E8902A', aura: '#FFD84D',
        x: (c, id, lv) => ({
          headBack: lv === 3 ? `<path d="${starPath(100, 70, 92, 70, 16)}" fill="#FFE680" opacity=".8"/>` : '',
          headTop: lv === 3 ? crown(c, 100, 44, 0.8) : '',
        }) } },
    { id: 'sleopard', label: 'スノーレオパード', icon: '🐆', egg: 'snow', eggCol: '#8FC4E8', c: pal('#EEF4F8', '#5A7A90', '#FFFFFF', '#8FD3FF', '#3BA9FF', '#F0F6FA'),
      names: ['', 'ユキコロ', 'ユキヒョウ', 'コオリヒョウ', 'ゴッカンオウ'],
      notes: ['ゆきの もようの たまご', 'ゆきの うえで ころころ あそぶ', 'ゆきやまを はしるのが とても はやい', 'こおりの ツメで がけも のぼれる', 'こおりの やまの おうさま'],
      k: ['chibi', 'quad', 'quad', 'quad'],
      o: { baby: { ears: 'round', tail: 'fluffy', spots: true, spotCol: '#7A8FA0' }, head: 'feline', ears: 'round', tail: 'long', aura: '#B9ECFF',
        x: (c, id, lv) => ({
          body: [[56, 150], [74, 166], [144, 150], [126, 166], [64, 168], [136, 168]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="none" stroke="#7A8FA0" stroke-width="2.6"/><circle cx="${x}" cy="${y}" r="1.5" fill="#7A8FA0"/>`).join(''),
          head: both(`<circle cx="76" cy="54" r="3.5" fill="none" stroke="#7A8FA0" stroke-width="2.2"/>`),
          headTop: lv === 3 ? crystal(c, 86, 42, 18, -18, '#D6F4FF') + crystal(c, 114, 42, 18, 18, '#D6F4FF') + crystal(c, 100, 40, 26, 0, '#D6F4FF') : '',
          front: lv >= 2 ? sparkle(30, 60, 7, '#BFE6FF') + sparkle(172, 56, 6, '#BFE6FF') : '',
        }) } },
    { id: 'poison', label: 'ポイズンフラワー', icon: '☠️', egg: 'dots', c: pal('#6A9A3A', '#2E4A18', '#E0F0C0', '#B04CE0', '#B6FF3C', '#EADCF5'),
      names: ['', 'ドクメ', 'ドクバナ', 'マカフラ', 'ドクジョオウ'],
      notes: ['ちょっと あやしい いろの たまご', 'まだ つぼみの ちいさな はな', 'はなびらで むしを ぱくっと する', 'ツタを のばして えものを つかまえる', 'どくの はなを さかせる もりの じょおう'],
      k: ['plant', 'plant', 'plant', 'human'],
      o: { bud: true, trap: true, hair: '#7A3FA8', crown: 'flower', flowerCol: '#B04CE0', wings: 'moth', wingCol: '#9A4CD0', top: '#6A9A3A', aura: '#C07BFF',
        x: (c, id, lv) => ({
          back: lv === 2 ? both(tube(c, 'M88 170 C60 166 40 150 30 124', 9, c.main) + leaf(c, 30, 124, -20, 0.5, '#8ACB5A')) : '',
          front: lv === 3 ? [[30, 70], [172, 80], [26, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#B6FF3C" opacity=".55"/><circle cx="${x}" cy="${y}" r="3" fill="#E8FFC0"/>`).join('') : '',
        }) },
      so: [null, null, null, { main: '#9A4CD0', dark: '#3E1660' }] },
    { id: 'metal', label: 'メタルドラゴン', icon: '⚙️', egg: 'gear', c: pal('#A9B4C2', '#3E4756', '#E3E8EE', '#FFB020', '#FF4D3A', '#E8ECF0'),
      names: ['', 'ギアチビ', 'キカイリュウ', 'コウテツリュウ', 'コウシンリュウ'],
      notes: ['かちかち かたい てつの たまご', 'ねじを まくと げんきに うごきだす', 'てつの うろこを もつ りゅう', 'はがねの つばさで そらを とぶ', 'なんでも はねかえす はがねの かみさまりゅう'],
      k: ['chibi', 'dragon', 'dragon', 'dragon'],
      o: { baby: { crest: 'gear', tail: 'dragon', ears: 'horn', hornCol: '#E3E8EE' }, horn: 'straight', hornCol: '#E3E8EE', wingCol: '#6A7686', tip: 'spike', aura: '#BFD0E0', spikeCol: '#E3E8EE',
        x: (c, id, lv) => ({
          body: (lv >= 2 ? gear(c, 100, 126, 11 + lv * 2) : '') + [[72, 112], [128, 112], [76, 140], [124, 140]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${c.dark}"/>`).join(''),
          arms: both(`<path d="M46 122 L62 120" stroke="${c.dark}" stroke-width="2.5"/>`),
          front: lv === 3 ? sparkle(26, 50, 8, '#FFE9B0') + sparkle(176, 150, 7, '#FFE9B0') : '',
        }) } },
    { id: 'ghost', label: 'ゴースト', icon: '👻', egg: 'swirl', c: pal('#B9A6FF', '#4B3A8A', '#EDE6FF', '#7AF0FF', '#7AF0FF', '#EDE8FA'),
      names: ['', 'オバケン', 'フワレイ', 'ボウレイ', 'ユウレイオウ'],
      notes: ['ふわふわ うかぶ ふしぎな たまご', 'おどかすのが すきな ちびおばけ', 'かべを すりぬけて あそぶ', 'よなかに ひとだまを つれて あるく', 'おばけたちを まとめる おうさま'],
      k: ['ghost', 'ghost', 'ghost', 'ghost'], o: { cape: '#3A2A70', aura: '#B9A6FF' } },
    { id: 'sand', label: 'サンドモンスター', icon: '🏜️', egg: 'crack', c: pal('#E3B866', '#8A6420', '#FFF0C8', '#C98A3A', '#FF7A30', '#F7EBD0'),
      names: ['', 'スナムシ', 'サリュウ', 'スナキョジン', 'スナノオウ'],
      notes: ['さばくの すなの いろの たまご', 'すなの なかを もぐって すすむ', 'すなの なかを ながれる ように およぐ', 'すなあらしを おこす おおきな けもの', 'さばくを おさめる すなの おうさま'],
      k: ['serpent', 'serpent', 'biped', 'biped'],
      o: { rings: true,
        x: (c, id, lv) => ({ headBack: lv === 1 ? both(`<path d="M84 56 L74 38 L90 50Z" fill="${c.acc}" ${st(c, 3)}/>`) : '' }) },
      xs: (c, id, lv) => lv < 2 ? {} : {
        muzzle: true,
        back: tube(c, 'M122 150 C156 158 180 136 178 104', lv === 3 ? 17 : 15) + `<path d="M178 104 L166 86 L190 90Z" fill="${c.acc}" ${st(c, 3)}/>`,
        arms: both(`<path d="M62 96 L42 84 L54 104Z" fill="${c.acc}" ${st(c, 3)}/>`),
        headBack: both(`<path d="M80 46 C64 38 58 20 64 4 C70 20 80 28 92 36Z" fill="${c.acc}" ${st(c, 3.5)}/>`),
        body: `<path d="M70 120 Q80 116 74 128 M126 120 Q118 116 126 128" stroke="${c.acc}" stroke-width="3" fill="none"/>`,
        headTop: lv === 3 ? crown(c, 100, 40, 0.85, '#FFD84D', '#3FD7FF') : '',
        aura: lv === 3 ? P.aura('sd' + id, '#FFD98A') : '',
        over: lv === 3 ? `<path d="M10 70 C30 60 50 66 46 78 M150 40 C170 30 190 38 184 50 M160 150 C176 142 194 150 188 160" stroke="${c.main}" stroke-width="4" fill="none" stroke-linecap="round"/>` : '',
      } },
    { id: 'serpent', label: 'シーサーペント', icon: '🐍', egg: 'wave', c: pal('#3FA6B8', '#1A5A66', '#DDF6F2', '#7FE3D0', '#FFD23F', '#DDF3F4'),
      names: ['', 'ウミヘビン', 'カイダ', 'シンカイダ', 'ウミガミ'],
      notes: ['うみの いろを した たまご', 'くるくる まるまって ねるのが すき', 'うみの なかを すいすい およぐ', 'しんかいに すむ おおきな りゅう', 'うみを おさめる かみさまの へび'],
      k: ['serpent', 'serpent', 'serpent', 'serpent'],
      o: { fins: true, tailFin: true, aura: '#7FE3D0',
        x: (c, id, lv) => ({
          headBack: lv >= 1 ? both(`<path d="M78 70 C62 62 56 48 60 36 C66 46 74 52 84 58Z" fill="${c.acc}" ${st(c, 3)}/>`) : '',
          head: lv === 3 ? both(`<path d="M88 94 C72 100 58 98 46 88" ${st(c, 3)} fill="none"/>`) : '',
          headTop: lv === 3 ? crown(c, 100, 52, 0.75, '#FFD84D', '#7FE3D0') : (lv === 2 ? `<path d="M96 52 L100 36 L104 52Z" fill="${c.belly}" ${st(c, 3)}/>` : ''),
          front: lv === 3 ? `<path d="M0 182 Q20 170 40 182 T80 182 T120 182 T160 182 T200 182 L200 200 L0 200Z" fill="#7FE3D0" opacity=".8"/>` : '',
        }) } },
    { id: 'volcano', label: 'ボルケーノビースト', icon: '♨️', egg: 'flame', c: pal('#8A4A36', '#3A1A12', '#FFB070', '#FF6A2A', '#FFE066', '#F5D6C8'),
      names: ['', 'ヒノコジュウ', 'エンジュウ', 'ヨウガンジュウ', 'カザンシン'],
      notes: ['ぐつぐつ にえる おとが する たまご', 'あたまの ひが ちいさな ろうそく くらい', 'からだに マグマが ながれて いる', 'あるくと じめんが あつく なる', 'かざんの ちからを もつ ほのおの かみさま'],
      k: ['chibi', 'biped', 'biped', 'biped'],
      o: { baby: { crest: 'flame', ears: 'horn', hornCol: '#3A1A12', tail: 'flame' }, muzzle: true },
      xs: (c, id, lv) => lv < 1 ? {} : {
        headBack: `<path d="M78 46 L84 30 L116 30 L122 46Z" fill="#5A2A20" ${st(c, 3.5)}/><ellipse cx="100" cy="31" rx="15" ry="4" fill="#FF6A2A"/>` + flame(c, 100, 26, 0.5 + lv * 0.2, '#FF6A2A') +
          (lv >= 2 ? both(`<path d="M78 50 C66 44 60 32 62 20 C68 30 76 36 86 40Z" fill="#3A1A12" ${st(c, 3)}/>`) : ''),
        body: `<path d="M70 112 L80 122 L72 136 M130 112 L120 124 L128 138 M96 158 L100 168 L104 158" stroke="#FFB020" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
        arms: both(`<path d="M50 118 L58 128 L52 138" stroke="#FFB020" stroke-width="3" fill="none" stroke-linecap="round"/>`) + (lv >= 2 ? both(`<path d="M62 96 L44 84 L52 104Z" fill="#5A2A20" ${st(c, 3)}/>`) : ''),
        back: lv >= 2 ? tube(c, 'M122 150 C156 158 176 140 174 112', 15) + flame(c, 174, 106, 0.8, '#FF6A2A') : '',
        aura: lv === 3 ? P.aura('vo' + id, '#FF7A3C') : '',
        over: lv === 3 ? flame(c, 20, 156, 0.7, '#FF6A2A') + flame(c, 182, 160, 0.6, '#FF6A2A') : '',
      } },
    { id: 'whale', label: 'スカイホエール', icon: '🐋', egg: 'wave', c: pal('#7FB8F0', '#2E5F99', '#F2F8FF', '#BFE2FF', '#FFD23F', '#E3F0FF'),
      names: ['', 'クジラン', 'ソラクジラ', 'フウゲイ', 'テンクウオウ'],
      notes: ['くもの ように かるい たまご', 'そらに うかぶ ちいさな クジラ', 'くもの うみを およぐ', 'かぜを よぶ おおきな そらの クジラ', 'そらの うえの せかいを おさめる おうさま'],
      k: ['whale', 'whale', 'whale', 'whale'], o: { aura: '#BFE2FF' } },
    { id: 'wwolf', label: 'ウッドウルフ', icon: '🌲', egg: 'leaf', c: pal('#6FA35A', '#2F5A22', '#E8F5D8', '#A8D86A', '#FFD23F', '#E3F2D6'),
      names: ['', 'モリコロ', 'モリオオカミ', 'ジュロウ', 'モリノオウ'],
      notes: ['こけの はえた たまご', 'はっぱの しっぽの こおおかみ', 'もりの なかを はしりまわる', 'きの かわの よろいを まとう', 'もりを まもる おおかみの おうさま'],
      k: ['chibi', 'quad', 'quad', 'quad'],
      o: { baby: { ears: 'pointed', tail: 'fluffy', tailCol: '#4F8A3A', crest: 'tuft', mane: '#4F8A3A' }, head: 'canine', ears: 'pointed', tail: 'bushy', tailCol: '#4F8A3A', ruff: '#4F8A3A', aura: '#A8E08A',
        x: (c, id, lv) => ({
          body: lv >= 2 ? both(`<path d="M44 150 C40 140 48 132 58 134 C66 136 70 146 64 152Z" fill="#8B5A2B" ${st(c, 3)}/>`) : '',
          headBack: lv >= 2 ? both(leaf(c, 70, 60, -70, 0.7, '#4F8A3A')) : '',
          headTop: lv === 3 ? both(leaf(c, 80, 40, -30, 0.55, '#A8D86A')) + `<circle cx="100" cy="48" r="5" fill="#FF8FB8" ${st(c, 2)}/>` : '',
        }) } },
    { id: 'cgolem', label: 'クリスタルゴーレム', icon: '💎', egg: 'gem', c: pal('#8FD8F5', '#2E7AA0', '#E8FAFF', '#D6C6FF', '#FFFFFF', '#E8F7FF'),
      names: ['', 'キラコロ', 'ケッショウタイ', 'クリスタロス', 'ケッショウシン'],
      notes: ['すきとおった きらきらの たまご', 'ひかりを あてると にじいろに ひかる', 'からだが けっしょうで できて いる', 'クリスタルの おおきな きょじん', 'ひかりを あやつる けっしょうの かみさま'],
      k: ['golem', 'golem', 'golem', 'golem'],
      o: { core: '#C9A8FF', eye: '#FFFFFF', aura: '#C9E8FF',
        x: (c, id, lv) => ({
          body: lv === 0 ? crystal(c, 86, 98, 18, -20, '#D6C6FF') + crystal(c, 112, 96, 22, 15, '#D6C6FF') : '',
          arms: lv >= 1 ? both(crystal(c, 44, 96, 18 + lv * 6, -30, '#D6C6FF')) : '',
          headBack: lv >= 2 ? crystal(c, 100, 56, 20 + lv * 6, 0, '#D6C6FF') + both(crystal(c, 84, 58, 14 + lv * 4, -25, '#E8FAFF')) : '',
          front: lv === 3 ? sparkle(26, 50, 9) + sparkle(178, 60, 8) + sparkle(30, 160, 6) + sparkle(172, 160, 7) : '',
        }) } },
    { id: 'tbird', label: 'サンダーバード', icon: '🌩️', egg: 'bolt', c: pal('#FFD23F', '#A3780A', '#FFF6D0', '#3FD7FF', '#3FD7FF', '#FFF6D6'),
      names: ['', 'ピヨピリ', 'イナズマドリ', 'ライメイ', 'ライジンチョウ'],
      notes: ['ぴかっと ひかる たまご', 'はねを ふると ぱちぱち する', 'かみなりぐもの なかを とぶ', 'いなずまを はなつ そらの とり', 'かみなりを よぶ かみさまの とり'],
      k: ['chibi', 'bird', 'bird', 'bird'],
      o: { baby: { crest: 'bolt', wings: 'bird', beak: '#FF9A3C', crestCol: '#3FD7FF' }, crest: 'bolt', crestCol: '#3FD7FF', beak: '#FF9A3C', aura: '#FFE066',
        x: (c, id, lv) => ({
          front: lv >= 2 ? bolt(c, 24, 150, 0.7, '#3FD7FF') + bolt(c, 178, 150, 0.7, '#3FD7FF') + (lv === 3 ? bolt(c, 30, 40, 0.6, '#fff') + bolt(c, 172, 30, 0.6, '#fff') : '') : '',
        }) } },
    { id: 'nflower', label: 'ナイトフラワー', icon: '🌙', egg: 'moon', c: pal('#4E5AA8', '#1E2458', '#D8DCFF', '#A98CFF', '#FFE066', '#E0E2F7'),
      names: ['', 'ヨルメ', 'ヤカバナ', 'ゲッカ', 'ツキジョオウ'],
      notes: ['つきの ひかりで そだつ たまご', 'よるに だけ めを だす', 'つきよに さく はな', 'ほしの ひかりを あつめる はな', 'つきの したで うたう よるの じょおう'],
      k: ['plant', 'plant', 'plant', 'human'],
      o: { bud: true, disc: '#FFF3B0', petals: 6, hair: '#3A3F8A', crown: 'moon', wings: 'moth', wingCol: '#A98CFF', top: '#6A5AD0', aura: '#B9A6FF', leafCol: '#5A6AC0',
        x: (c, id, lv) => ({
          front: lv >= 2 ? `<path d="M26 44 A14 14 0 1 0 44 30 A11 11 0 1 1 26 44Z" fill="#FFE066" ${st(c, 2)}/>` + star(c, 172, 50, 6, '#FFE066', 0) + star(c, 160, 160, 4, '#FFE066', 0) + (lv === 3 ? star(c, 30, 150, 5, '#FFE066', 0) : '') : '',
        }) },
      so: [null, null, null, { main: '#6A5AD0' }] },
    { id: 'atree', label: 'エンシェントツリー', icon: '🌳', egg: 'leaf', c: pal('#8B5A2B', '#4A2C10', '#C9A27A', '#5DB85A', '#FFD23F', '#E8F2DA'),
      names: ['', 'ナエギ', 'ジュレイ', 'タイボク', 'ダイジュシン'],
      notes: ['たねの ような たまご', 'ちいさな なえぎ。みずが だいすき', 'もりの こえが きこえる きの せいれい', 'もりを みまもる おおきな き', 'せんねん いきて いる もりの かみさま'],
      k: ['tree', 'tree', 'tree', 'tree'], o: { aura: '#A8E08A', fruit: '#FFB0D0',
        x: (c, id, lv) => ({ front: lv === 3 ? sparkle(20, 120, 7, '#E8FFC8') + sparkle(182, 130, 6, '#E8FFC8') : '' }) } },
  ];

  const ARCH = { chibi: (c, id, o) => P.chibi(c, id, o.baby || {}), dragon: P.dragon, quad: P.quad, bird: P.bird, turtle: P.turtle, golem: P.golem, plant: P.plant,
    human: P.human, fish: P.fish, ghost: P.ghost, jelly: P.jelly, serpent: P.serpent, whale: P.whale, tree: P.tree, biped: P.biped };
  const PAL_KEYS = ['main', 'dark', 'belly', 'acc', 'iris'];

  for (const L of LINES) L.names[0] = L.label + 'の たまご';

  function svg(lineId, stage) {
    const L = LINES.find(l => l.id === lineId) || LINES[0];
    let inner;
    if (stage === 0) inner = P.egg(L.c, L.egg, L.eggCol);
    else {
      const id = P.nid(), lv = stage - 1, so = (L.so && L.so[lv]) || {};
      const c = Object.assign({}, L.c);
      const o = Object.assign({}, L.o);
      for (const k in so) (PAL_KEYS.includes(k) ? c : o)[k] = so[k];
      if (o.fireWing && lv >= 1) o.wingCol = `url(#fw${id})`;
      if (L.xs) { const xs = L.xs(c, id, lv); for (const k in xs) o[k] = typeof xs[k] === 'string' && typeof o[k] === 'string' ? o[k] + xs[k] : xs[k]; }
      inner = ARCH[L.k[lv]](c, id, o, lv);
    }
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
  }

  window.MONSTERS = { LINES, svg, STAGES: 5 };
})();
