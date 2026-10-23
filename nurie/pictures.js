// いろいろぬりえ 下絵データ
// 400x400 の SVG。白でぬった図形は「線のない所」になり、#222 の線と黒い点だけが下絵として残る。
// (白い図形をあとから重ねると、うしろの線をかくせる)
'use strict';

const N = ' fill="none"';   // 線だけ(中をぬらない)
const K = ' fill="#222"';   // 黒くぬる(目など)

/* ---------- 部品 ---------- */
function starPath(cx, cy, r, ir = r * 0.45, n = 5, rot = -90) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const rr = i % 2 ? ir : r;
    const a = (rot + i * 180 / n) * Math.PI / 180;
    d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
  }
  return `<path d="${d}Z"/>`;
}
function cloud(cx, cy, s = 1) {
  const c = (x, y, r) => `<circle cx="${cx + x * s}" cy="${cy + y * s}" r="${r * s}"/>`;
  return `<g>${c(-30, 5, 20)}${c(30, 5, 20)}${c(-10, -10, 25)}${c(15, -5, 22)}` +
    `<rect x="${cx - 30 * s}" y="${cy + 5 * s}" width="${60 * s}" height="${20 * s}" stroke="none"/></g>` +
    `<path${N} d="M${cx - 30 * s} ${cy + 25 * s}H${cx + 30 * s}"/>`;
}
function flower(cx, cy, r) {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const a = (-90 + i * 72) * Math.PI / 180;
    s += `<circle cx="${(cx + r * Math.cos(a)).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}" r="${r * 0.75}"/>`;
  }
  return s + `<circle cx="${cx}" cy="${cy}" r="${r * 0.6}"/>`;
}
function wavyRing(cx, cy, r, amp, k, steps = 120) {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const a = i / steps * Math.PI * 2;
    const rr = r + amp * Math.sin(a * k);
    d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
  }
  return d + 'Z';
}
function grass(y = 370) {
  return `<path d="M0 ${y} Q50 ${y - 12} 100 ${y} T200 ${y} T300 ${y} T400 ${y} V400 H0 Z"/>`;
}

/* ---------- どうぶつ・いきもの ---------- */
const P_ANIMAL = [
  { id: 'inu', name: 'いぬ', lv: 1, d: `
    <path d="M130 300 Q200 345 270 300 L275 325 Q200 372 125 325 Z"/>
    <circle cx="200" cy="356" r="14"/>
    <path d="M115 135 C50 135 30 255 75 290 C110 300 125 240 130 195 Z"/>
    <path d="M285 135 C350 135 370 255 325 290 C290 300 275 240 270 195 Z"/>
    <ellipse cx="200" cy="215" rx="115" ry="105"/>
    <ellipse cx="245" cy="195" rx="32" ry="28"/>
    <ellipse cx="200" cy="262" rx="55" ry="40"/>
    <ellipse cx="200" cy="242" rx="18" ry="12"${K}/>
    <path${N} d="M200 254 V272 M200 272 C190 285 175 285 170 275 M200 272 C210 285 225 285 230 275"/>
    <circle cx="160" cy="198" r="11"${K}/><circle cx="245" cy="198" r="11"${K}/>` },
  { id: 'neko', name: 'ねこ', lv: 1, d: `
    <path d="M100 185 L115 65 L195 135 Z"/><path d="M300 185 L285 65 L205 135 Z"/>
    <path d="M125 150 L131 100 L168 132 Z"/><path d="M275 150 L269 100 L232 132 Z"/>
    <path d="M125 300 Q120 380 200 385 Q280 380 275 300 Z"/>
    <ellipse cx="200" cy="215" rx="125" ry="105"/>
    <ellipse cx="155" cy="205" rx="14" ry="19"${K}/><ellipse cx="245" cy="205" rx="14" ry="19"${K}/>
    <path d="M190 240 H210 L200 252 Z"${K}/>
    <path${N} d="M200 252 Q190 270 172 262 M200 252 Q210 270 228 262"/>
    <path${N} d="M118 235 L45 225 M118 252 L45 262 M282 235 L355 225 M282 252 L355 262"/>
    <path d="M150 305 Q200 330 250 305 L252 320 Q200 345 148 320 Z"/>` },
  { id: 'usagi', name: 'うさぎ', lv: 1, d: `
    <ellipse cx="160" cy="95" rx="26" ry="72" transform="rotate(-12 160 95)"/>
    <ellipse cx="160" cy="100" rx="12" ry="50" transform="rotate(-12 160 95)"/>
    <ellipse cx="240" cy="95" rx="26" ry="72" transform="rotate(12 240 95)"/>
    <ellipse cx="240" cy="100" rx="12" ry="50" transform="rotate(12 240 95)"/>
    <circle cx="295" cy="320" r="24"/>
    <ellipse cx="200" cy="300" rx="95" ry="78"/>
    <ellipse cx="150" cy="368" rx="40" ry="18"/><ellipse cx="250" cy="368" rx="40" ry="18"/>
    <ellipse cx="165" cy="292" rx="18" ry="30"/><ellipse cx="235" cy="292" rx="18" ry="30"/>
    <circle cx="200" cy="185" r="72"/>
    <circle cx="175" cy="178" r="9"${K}/><circle cx="225" cy="178" r="9"${K}/>
    <ellipse cx="200" cy="200" rx="8" ry="6"${K}/>
    <path${N} d="M200 206 Q192 220 182 213 M200 206 Q208 220 218 213"/>
    <circle cx="157" cy="205" r="11"/><circle cx="243" cy="205" r="11"/>` },
  { id: 'sakana', name: 'さかな', lv: 1, d: `
    <defs><clipPath id="c"><path d="M60 200 Q150 90 300 200 Q150 310 60 200 Z"/></clipPath></defs>
    <path d="M290 200 L370 130 Q350 200 370 270 Z"/>
    <path d="M140 155 Q180 80 245 160 Z"/>
    <path d="M160 250 Q190 315 225 248 Z"/>
    <path d="M60 200 Q150 90 300 200 Q150 310 60 200 Z"/>
    <g clip-path="url(#c)"><path${N} d="M190 120 Q215 200 190 280 M235 130 Q258 200 235 270"/></g>
    <path${N} d="M145 160 Q165 200 145 240"/>
    <circle cx="108" cy="190" r="14"/><circle cx="105" cy="190" r="6"${K}/>
    <circle cx="60" cy="115" r="10"/><circle cx="85" cy="75" r="14"/><circle cx="55" cy="40" r="8"/>
    ${grass(375)}` },
  { id: 'zou', name: 'ぞう', lv: 2, d: `
    <path${N} d="M346 205 Q372 232 360 262"/><path d="M360 258 L352 280 L372 272 Z"/>
    <rect x="132" y="240" width="44" height="115" rx="12"/><rect x="186" y="240" width="44" height="115" rx="12"/>
    <rect x="252" y="240" width="44" height="115" rx="12"/><rect x="306" y="240" width="44" height="115" rx="12"/>
    <path${N} d="M137 340 H171 M191 340 H225 M257 340 H291 M311 340 H345"/>
    <ellipse cx="240" cy="220" rx="115" ry="85"/>
    <path d="M200 148 Q255 130 305 152 L295 232 Q250 248 205 232 Z"/>
    <circle cx="228" cy="185" r="11"/><circle cx="268" cy="182" r="11"/><circle cx="248" cy="214" r="9"/>
    <path d="M78 195 C55 250 50 300 75 322 C86 330 100 318 91 305 C78 285 86 250 112 222 Z"/>
    <circle cx="125" cy="170" r="72"/>
    <path d="M95 225 Q78 252 58 248 Q74 238 84 220 Z"/>
    <path d="M140 122 C192 104 212 158 196 200 C184 232 152 230 142 214 Q158 170 140 122 Z"/>
    <circle cx="103" cy="150" r="7"${K}/>
    <path${N} d="M0 362 H400"/>` },
  { id: 'kyouryu', name: 'きょうりゅう', lv: 2, d: `
    <path d="M116 220 L130 172 L144 216 Z"/><path d="M146 209 L160 161 L174 205 Z"/>
    <path d="M176 205 L190 157 L204 201 Z"/><path d="M206 206 L220 158 L234 202 Z"/>
    <path d="M100 255 Q40 250 15 305 Q60 282 108 292 Z"/>
    <rect x="115" y="275" width="40" height="85" rx="10"/><rect x="160" y="275" width="40" height="85" rx="10"/>
    <rect x="232" y="275" width="40" height="85" rx="10"/><rect x="275" y="275" width="40" height="85" rx="10"/>
    <path d="M262 230 Q292 150 285 92 Q284 58 316 56 Q352 56 357 84 Q360 106 332 110 Q312 112 310 132 Q306 190 305 255 Z"/>
    <ellipse cx="205" cy="262" rx="115" ry="65"/>
    <circle cx="170" cy="240" r="16"/><circle cx="215" cy="225" r="12"/><circle cx="250" cy="265" r="14"/>
    <circle cx="190" cy="288" r="10"/><circle cx="130" cy="265" r="12"/><circle cx="292" cy="232" r="9"/>
    <circle cx="326" cy="76" r="6"${K}/><circle cx="350" cy="80" r="2.5"${K}/>
    <path${N} d="M332 98 Q344 99 352 92"/>
    <path${N} d="M0 362 H400"/>
    ${cloud(80, 80, 1)}` },
  { id: 'chou', name: 'ちょうちょ', lv: 2, d: `
    <path d="M195 190 C120 60 30 80 50 170 C60 220 130 222 195 207 Z"/>
    <path d="M205 190 C280 60 370 80 350 170 C340 220 270 222 205 207 Z"/>
    <path d="M195 212 C120 222 68 282 100 322 C130 352 180 302 195 232 Z"/>
    <path d="M205 212 C280 222 332 282 300 322 C270 352 220 302 205 232 Z"/>
    <circle cx="112" cy="140" r="26"/><circle cx="148" cy="186" r="12"/><circle cx="76" cy="166" r="10"/>
    <circle cx="288" cy="140" r="26"/><circle cx="252" cy="186" r="12"/><circle cx="324" cy="166" r="10"/>
    <circle cx="112" cy="140" r="12"/><circle cx="288" cy="140" r="12"/>
    <circle cx="132" cy="282" r="18"/><circle cx="268" cy="282" r="18"/>
    <circle cx="108" cy="308" r="7"/><circle cx="292" cy="308" r="7"/>
    <ellipse cx="200" cy="228" rx="12" ry="72"/>
    <circle cx="200" cy="146" r="17"/>
    <path${N} d="M194 132 Q180 95 165 84 M206 132 Q220 95 235 84"/>
    <circle cx="163" cy="82" r="7"/><circle cx="237" cy="82" r="7"/>
    ${flower(50, 355, 14)}${flower(350, 360, 12)}` },
  { id: 'kame', name: 'かめ', lv: 2, d: `
    <defs><clipPath id="c"><path d="M80 262 Q90 130 210 125 Q320 128 335 262 Z"/></clipPath></defs>
    <path d="M72 252 L38 270 L74 274 Z"/>
    <path d="M318 238 Q338 182 378 190 Q400 200 396 226 Q390 252 350 257 Z"/>
    <circle cx="372" cy="208" r="6"${K}/><path${N} d="M376 232 Q385 234 391 227"/>
    <ellipse cx="120" cy="292" rx="26" ry="30"/><ellipse cx="290" cy="292" rx="26" ry="30"/>
    <path d="M80 262 Q90 130 210 125 Q320 128 335 262 Z"/>
    <g clip-path="url(#c)">
      <path d="M245 195 L227.5 225 L192.5 225 L175 195 L192.5 165 L227.5 165 Z"/>
      <path${N} d="M245 195 L400 195 M227.5 225 L290 330 M192.5 225 L130 330 M175 195 L0 195 M192.5 165 L150 60 M227.5 165 L270 60"/>
    </g>
    <path d="M62 260 H352 Q352 282 332 282 H82 Q62 282 62 260 Z"/>
    <path${N} d="M0 330 H400"/>
    ${flower(40, 60, 14)}` },
];

/* ---------- のりもの ---------- */
const P_RIDE = [
  { id: 'kuruma', name: 'くるま', lv: 1, d: `
    <path${N} d="M0 320 H400"/>
    <path d="M40 270 Q40 220 80 215 L120 213 L150 160 Q158 148 175 148 H265 Q280 148 290 160 L320 210 Q365 215 365 250 V270 Q365 285 350 285 H55 Q40 285 40 270 Z"/>
    <path d="M160 205 L178 166 H215 V205 Z"/><path d="M230 205 V166 H262 L290 205 Z"/>
    <path${N} d="M222 160 V284 M235 228 H255"/>
    <ellipse cx="352" cy="236" rx="8" ry="12"/>
    <circle cx="115" cy="285" r="35"/><circle cx="115" cy="285" r="14"/>
    <circle cx="295" cy="285" r="35"/><circle cx="295" cy="285" r="14"/>
    <circle cx="65" cy="70" r="28"/>
    <path${N} d="M65 25 V12 M65 115 V128 M20 70 H7 M110 70 H123 M33 38 L24 29 M97 102 L106 111 M97 38 L106 29 M33 102 L24 111"/>
    ${cloud(290, 80, 1.1)}` },
  { id: 'basu', name: 'ばす', lv: 1, d: `
    <path${N} d="M0 322 H400"/>
    <rect x="40" y="120" width="320" height="170" rx="25"/>
    <rect x="60" y="145" width="50" height="60" rx="8"/><rect x="125" y="145" width="50" height="60" rx="8"/>
    <rect x="190" y="145" width="50" height="60" rx="8"/>
    <rect x="255" y="145" width="40" height="130" rx="6"/><path${N} d="M255 210 H295 M275 145 V275"/>
    <rect x="308" y="145" width="40" height="70" rx="8"/>
    <path${N} d="M40 232 H255 M295 232 H360"/>
    <circle cx="345" cy="255" r="9"/>
    <circle cx="110" cy="290" r="32"/><circle cx="110" cy="290" r="12"/>
    <circle cx="300" cy="290" r="32"/><circle cx="300" cy="290" r="12"/>
    ${cloud(90, 60, 1)}${cloud(310, 70, 0.8)}` },
  { id: 'fune', name: 'ふね', lv: 1, d: `
    <rect x="200" y="120" width="45" height="65"/><path${N} d="M200 140 H245"/>
    <circle cx="245" cy="95" r="16"/><circle cx="275" cy="70" r="20"/><circle cx="312" cy="45" r="25"/>
    <rect x="110" y="180" width="170" height="72" rx="6"/>
    <circle cx="150" cy="215" r="14"/><circle cx="195" cy="215" r="14"/><circle cx="240" cy="215" r="14"/>
    <path d="M40 250 H360 L320 325 H80 Z"/>
    <path${N} d="M52 272 H348"/>
    <path d="M0 305 Q25 290 50 305 T100 305 T150 305 T200 305 T250 305 T300 305 T350 305 T400 305 V400 H0 Z"/>
    <path${N} d="M30 350 Q55 338 80 350 M230 365 Q255 353 280 365"/>
    ${cloud(80, 70, 0.9)}` },
  { id: 'roketto', name: 'ろけっと', lv: 1, d: `
    <defs><clipPath id="c"><path d="M200 40 Q260 100 260 220 V290 H140 V220 Q140 100 200 40 Z"/></clipPath></defs>
    <path d="M170 318 Q180 360 200 388 Q220 360 230 318 Z"/>
    <path d="M186 320 Q192 345 200 362 Q208 345 214 320 Z"/>
    <path d="M140 225 L95 300 V325 L140 295 Z"/><path d="M260 225 L305 300 V325 L260 295 Z"/>
    <path d="M160 288 H240 L230 318 H170 Z"/>
    <path d="M200 40 Q260 100 260 220 V290 H140 V220 Q140 100 200 40 Z"/>
    <g clip-path="url(#c)"><path${N} d="M120 92 Q200 112 280 92 M120 250 H280"/></g>
    <circle cx="200" cy="165" r="30"/><circle cx="200" cy="165" r="19"/>
    ${starPath(60, 80, 22)}${starPath(335, 120, 18)}${starPath(70, 250, 16)}${starPath(340, 330, 20)}
    <circle cx="330" cy="50" r="6"/><circle cx="40" cy="170" r="5"/><circle cx="60" cy="350" r="6"/>` },
  { id: 'densha', name: 'でんしゃ', lv: 2, d: `
    <path${N} d="M150 140 L180 110 L150 85 M140 85 H200 M0 70 H400"/>
    <path d="M30 140 H300 Q370 140 385 230 V270 H30 Z"/>
    <rect x="50" y="165" width="45" height="45" rx="6"/><rect x="105" y="165" width="45" height="45" rx="6"/>
    <rect x="160" y="165" width="45" height="45" rx="6"/>
    <rect x="215" y="160" width="42" height="108" rx="4"/><rect x="223" y="170" width="26" height="36" rx="4"/>
    <path d="M290 165 H330 Q355 168 365 210 H290 Z"/>
    <path${N} d="M30 228 H215 M257 228 H384"/>
    <circle cx="368" cy="250" r="7"/>
    <circle cx="70" cy="300" r="20"/><circle cx="120" cy="300" r="20"/>
    <circle cx="275" cy="300" r="20"/><circle cx="325" cy="300" r="20"/>
    <rect x="30" y="270" width="355" height="16"/>
    <path${N} d="M0 322 H400 M0 336 H400 M20 322 V336 M60 322 V336 M100 322 V336 M140 322 V336 M180 322 V336 M220 322 V336 M260 322 V336 M300 322 V336 M340 322 V336 M380 322 V336"/>
    ${cloud(320, 40, 0.7)}` },
  { id: 'hikouki', name: 'ひこうき', lv: 2, d: `
    <defs><clipPath id="c"><path d="M40 200 Q60 170 120 168 H300 Q360 170 382 200 Q360 228 300 230 H120 Q60 228 40 200 Z"/></clipPath></defs>
    <path d="M62 188 L40 108 H82 L132 172 Z"/>
    <path d="M200 175 L250 118 H276 L246 175 Z"/>
    <path d="M40 200 Q60 170 120 168 H300 Q360 170 382 200 Q360 228 300 230 H120 Q60 228 40 200 Z"/>
    <g clip-path="url(#c)"><path${N} d="M30 214 H400"/></g>
    <circle cx="140" cy="195" r="7"/><circle cx="168" cy="195" r="7"/><circle cx="196" cy="195" r="7"/>
    <circle cx="224" cy="195" r="7"/><circle cx="252" cy="195" r="7"/><circle cx="280" cy="195" r="7"/>
    <path d="M330 184 Q352 186 365 197 H330 Z"/>
    <path d="M168 214 L250 300 H286 L240 210 Z"/>
    <ellipse cx="246" cy="262" rx="26" ry="11"/>
    <path d="M58 150 L30 150 L40 135 Z"/>
    ${cloud(90, 310, 1.2)}${cloud(320, 70, 1)}${cloud(330, 330, 0.7)}` },
  { id: 'shoubousha', name: 'しょうぼうしゃ', lv: 2, d: `
    <path${N} d="M0 320 H400"/>
    <rect x="70" y="160" width="20" height="14"/><rect x="230" y="160" width="20" height="14"/>
    <rect x="40" y="142" width="240" height="22" rx="4"/>
    <path${N} d="M64 142 V164 M88 142 V164 M112 142 V164 M136 142 V164 M160 142 V164 M184 142 V164 M208 142 V164 M232 142 V164 M256 142 V164"/>
    <rect x="290" y="114" width="26" height="18" rx="5"/>
    <rect x="30" y="172" width="232" height="110" rx="8"/>
    <path d="M262 130 H322 Q347 130 362 170 L377 210 V282 H262 Z"/>
    <path d="M277 145 H318 Q335 147 345 190 H277 Z"/>
    <rect x="45" y="190" width="60" height="55" rx="6"/><rect x="115" y="190" width="60" height="55" rx="6"/>
    <rect x="185" y="190" width="60" height="55" rx="6"/>
    <path${N} d="M30 262 H377 M290 215 H315"/>
    <circle cx="366" cy="240" r="8"/>
    <circle cx="92" cy="286" r="32"/><circle cx="92" cy="286" r="12"/>
    <circle cx="312" cy="286" r="32"/><circle cx="312" cy="286" r="12"/>
    ${cloud(90, 70, 0.9)}` },
  { id: 'jitensha', name: 'じてんしゃ', lv: 2, d: `
    <path${N} d="M0 340 H400"/>
    <circle cx="110" cy="272" r="65"/><circle cx="290" cy="272" r="65"/>
    <circle cx="110" cy="272" r="50"/><circle cx="290" cy="272" r="50"/>
    <path${N} d="M110 222 V322 M60 272 H160 M75 237 L145 307 M145 237 L75 307 M290 222 V322 M240 272 H340 M255 237 L325 307 M325 237 L255 307"/>
    <circle cx="110" cy="272" r="9"/><circle cx="290" cy="272" r="9"/>
    <path${N} d="M110 272 L175 182 H270 L290 272 M175 182 L205 272 L110 272 M205 272 L270 182 M175 182 L165 152 M270 182 L262 135 L238 128"/>
    <path d="M138 146 H192 Q197 154 186 158 H150 Q138 154 138 146 Z"/>
    <circle cx="205" cy="272" r="15"/>
    <rect x="228" y="122" width="22" height="12" rx="6"/>
    ${flower(40, 60, 13)}${flower(360, 80, 11)}` },
];

/* ---------- たべもの・おはな ---------- */
function sprinkles() {
  const list = [[20, 85], [55, 100], [95, 80], [130, 98], [165, 86], [200, 102], [235, 82], [270, 96], [305, 88], [340, 100], [10, 100], [115, 78], [215, 80], [320, 80]];
  return list.map(([deg, r]) => {
    const a = deg * Math.PI / 180;
    const x = 200 + r * Math.cos(a), y = 210 + r * Math.sin(a);
    return `<rect x="${(x - 11).toFixed(1)}" y="${(y - 4).toFixed(1)}" width="22" height="8" rx="4" transform="rotate(${(deg * 2.3) % 180} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }).join('');
}
function sunflowerPetals() {
  let s = '';
  for (let i = 0; i < 14; i++) {
    const deg = i * 360 / 14;
    const a = deg * Math.PI / 180;
    const x = 200 + 82 * Math.cos(a), y = 165 + 82 * Math.sin(a);
    s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="20" ry="44" transform="rotate(${deg + 90} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return s;
}
function berry(cx, cy, s = 1) {
  return `<path d="M${cx} ${cy + 18 * s} C${cx - 18 * s} ${cy + 10 * s} ${cx - 16 * s} ${cy - 10 * s} ${cx} ${cy - 8 * s} C${cx + 16 * s} ${cy - 10 * s} ${cx + 18 * s} ${cy + 10 * s} ${cx} ${cy + 18 * s} Z"/>` +
    `<path d="M${cx - 9 * s} ${cy - 9 * s} L${cx} ${cy - 3 * s} L${cx + 9 * s} ${cy - 9 * s} L${cx} ${cy - 15 * s} Z"/>`;
}
const P_FOOD = [
  { id: 'ringo', name: 'りんご', lv: 1, d: `
    <path d="M194 128 Q188 85 204 58 L216 64 Q203 90 208 128 Z"/>
    <path d="M200 120 C150 85 60 110 70 210 C80 300 150 350 200 320 C250 350 320 300 330 210 C340 110 250 85 200 120 Z"/>
    <path d="M212 92 Q250 50 292 74 Q256 110 212 92 Z"/><path${N} d="M218 90 Q250 78 282 77"/>
    <ellipse cx="125" cy="190" rx="13" ry="28" transform="rotate(20 125 190)"/>` },
  { id: 'ichigo', name: 'いちご', lv: 1, d: `
    <path d="M200 365 C120 335 60 245 80 175 C95 125 160 130 200 140 C240 130 305 125 320 175 C340 245 280 335 200 365 Z"/>
    <path d="M200 145 L148 118 L174 108 L158 76 L195 98 L200 62 L205 98 L242 76 L226 108 L252 118 Z"/>
    <path${N} d="M200 70 Q198 45 210 32"/>
    <ellipse cx="140" cy="190" rx="5" ry="8"${K}/><ellipse cx="200" cy="185" rx="5" ry="8"${K}/><ellipse cx="260" cy="190" rx="5" ry="8"${K}/>
    <ellipse cx="115" cy="235" rx="5" ry="8"${K}/><ellipse cx="170" cy="235" rx="5" ry="8"${K}/><ellipse cx="230" cy="235" rx="5" ry="8"${K}/><ellipse cx="285" cy="235" rx="5" ry="8"${K}/>
    <ellipse cx="145" cy="282" rx="5" ry="8"${K}/><ellipse cx="200" cy="285" rx="5" ry="8"${K}/><ellipse cx="255" cy="282" rx="5" ry="8"${K}/>
    <ellipse cx="200" cy="330" rx="5" ry="8"${K}/>` },
  { id: 'aisu', name: 'あいす', lv: 1, d: `
    <defs><clipPath id="c"><path d="M135 200 L200 372 L265 200 Z"/></clipPath></defs>
    <path d="M135 200 L200 372 L265 200 Z"/>
    <g clip-path="url(#c)"><path${N} d="M120 220 L260 360 M140 200 L270 330 M180 200 L280 300 M100 260 L220 380 M280 220 L140 360 M260 200 L130 330 M220 200 L120 300 M300 260 L180 380"/></g>
    <circle cx="200" cy="115" r="56"/>
    <path d="M125 205 Q120 140 200 130 Q280 140 275 205 Q265 222 255 205 Q245 226 230 208 Q215 232 200 208 Q185 230 170 208 Q155 226 145 205 Q135 222 125 205 Z"/>
    <circle cx="210" cy="55" r="17"/><path${N} d="M213 39 Q221 20 238 14"/>
    <ellipse cx="175" cy="95" rx="9" ry="14" transform="rotate(30 175 95)"/>` },
  { id: 'tulip', name: 'ちゅーりっぷ', lv: 1, d: `
    <defs><clipPath id="c"><path d="M140 120 L170 160 L200 105 L230 160 L260 120 Q275 200 230 225 Q200 240 170 225 Q125 200 140 120 Z"/></clipPath></defs>
    <rect x="192" y="210" width="16" height="165"/>
    <path d="M196 345 Q118 325 108 232 Q170 262 196 302 Z"/>
    <path d="M204 325 Q282 305 296 222 Q236 252 204 288 Z"/>
    <path d="M140 120 L170 160 L200 105 L230 160 L260 120 Q275 200 230 225 Q200 240 170 225 Q125 200 140 120 Z"/>
    <g clip-path="url(#c)"><path${N} d="M170 160 Q172 210 200 245 M230 160 Q228 210 200 245"/></g>
    ${grass(368)}
    <circle cx="70" cy="80" r="26"/>` },
  { id: 'keki', name: 'けーき', lv: 2, d: `
    <defs><clipPath id="c"><path d="M70 240 V320 Q200 345 330 320 V240 Z"/></clipPath></defs>
    <ellipse cx="200" cy="330" rx="165" ry="26"/>
    <path d="M70 240 V320 Q200 345 330 320 V240 Z"/>
    <g clip-path="url(#c)"><path${N} d="M60 258 Q78 285 95 258 Q113 285 130 258 Q148 285 165 258 Q183 285 200 258 Q218 285 235 258 Q253 285 270 258 Q288 285 305 258 Q323 285 340 258"/></g>
    <circle cx="105" cy="300" r="7"/><circle cx="160" cy="306" r="7"/><circle cx="240" cy="306" r="7"/><circle cx="295" cy="300" r="7"/>
    <ellipse cx="200" cy="240" rx="130" ry="22"/>
    <path d="M120 172 V230 Q200 248 280 230 V172 Z"/>
    <ellipse cx="200" cy="172" rx="80" ry="16"/>
    <rect x="160" y="112" width="12" height="58" rx="3"/><rect x="194" y="104" width="12" height="66" rx="3"/><rect x="228" y="112" width="12" height="58" rx="3"/>
    <path d="M166 108 Q156 92 166 78 Q176 92 166 108 Z"/><path d="M200 100 Q190 84 200 70 Q210 84 200 100 Z"/><path d="M234 108 Q224 92 234 78 Q244 92 234 108 Z"/>
    ${berry(135, 200, 1)}${berry(265, 200, 1)}${berry(200, 210, 1)}` },
  { id: 'donatsu', name: 'どーなつ', lv: 2, d: `
    <circle cx="200" cy="210" r="140"/>
    <path fill-rule="evenodd" d="${wavyRing(200, 210, 118, 10, 7)} ${wavyRing(200, 210, 60, 5, 6)}"/>
    <circle cx="200" cy="210" r="40"/>
    ${sprinkles()}
    <ellipse cx="110" cy="130" rx="10" ry="22" transform="rotate(-45 110 130)"/>` },
  { id: 'himawari', name: 'ひまわり', lv: 2, d: `
    <defs><clipPath id="c"><circle cx="200" cy="165" r="55"/></clipPath></defs>
    <rect x="192" y="250" width="16" height="130"/>
    <path d="M196 340 Q130 345 100 300 Q160 285 196 315 Z"/><path${N} d="M190 330 Q150 315 115 302"/>
    <path d="M204 310 Q270 315 300 270 Q240 255 204 285 Z"/><path${N} d="M210 300 Q250 285 285 272"/>
    ${sunflowerPetals()}
    <circle cx="200" cy="165" r="55"/>
    <g clip-path="url(#c)"><path${N} d="M130 110 L270 250 M150 90 L290 230 M170 70 L310 210 M110 130 L250 270 M90 150 L230 290 M270 110 L130 250 M250 90 L110 230 M230 70 L90 210 M290 130 L150 270 M310 150 L170 290"/></g>
    ${grass(372)}` },
  { id: 'bara', name: 'ばら', lv: 2, d: `
    <path d="M195 270 Q185 330 196 392 H208 Q198 330 207 270 Z"/>
    <path d="M190 330 L178 320 L192 316 Z"/><path d="M208 300 L222 292 L210 286 Z"/>
    <path d="M196 350 Q140 360 120 320 Q170 310 196 335 Z"/><path${N} d="M192 345 Q160 335 130 322"/>
    <path d="M206 315 Q262 325 282 285 Q232 275 206 300 Z"/><path${N} d="M210 310 Q240 300 272 288"/>
    <path d="M112 150 Q60 160 75 222 Q90 272 152 272 Q105 230 112 150 Z"/>
    <path d="M288 150 Q340 160 325 222 Q310 272 248 272 Q295 230 288 150 Z"/>
    <path d="M140 168 Q150 100 200 96 Q250 100 260 168 Q230 197 200 194 Q170 197 140 168 Z"/>
    <path${N} d="M172 152 Q176 118 205 116 Q232 120 228 146 Q218 166 194 158 Q182 150 192 138 Q202 130 210 140"/>
    <path d="M112 150 Q125 200 200 185 Q275 200 288 150 Q300 255 200 282 Q100 255 112 150 Z"/>
    <path${N} d="M150 212 Q175 240 200 242 Q225 240 250 212"/>` },
];

/* ---------- きせつ・ぎょうじ ---------- */
function carp(tx, ty, s) {
  return `<g transform="translate(${tx} ${ty}) scale(${s})">
    <defs><clipPath id="k${tx}${ty}"><path d="M0 0 Q140 -15 260 10 L310 -15 L290 35 L310 85 L260 60 Q140 85 0 70 Z"/></clipPath></defs>
    <path d="M0 0 Q140 -15 260 10 L310 -15 L290 35 L310 85 L260 60 Q140 85 0 70 Z"/>
    <g clip-path="url(#k${tx}${ty})"><path${N} d="M100 -20 Q120 35 100 90 M135 -20 Q155 35 135 90 M170 -20 Q190 35 170 90 M205 -20 Q225 35 205 90 M240 -20 Q260 35 240 90"/></g>
    <ellipse cx="4" cy="35" rx="10" ry="34"/>
    <circle cx="48" cy="25" r="16"/><circle cx="48" cy="25" r="7"${K}/>
    <path${N} d="M75 5 Q90 35 75 65"/></g>`;
}
function ornament(cx, cy) { return `<circle cx="${cx}" cy="${cy}" r="10"/>`; }
const P_SEASON = [
  { id: 'yukidaruma', name: 'ゆきだるま', lv: 1, d: `
    <path d="M0 360 Q100 340 200 360 T400 352 V400 H0 Z"/>
    <path${N} d="M118 270 L62 222 M84 240 L68 254 M282 270 L338 222 M316 240 L332 254"/>
    <circle cx="200" cy="292" r="86"/>
    <circle cx="200" cy="162" r="60"/>
    <rect x="155" y="68" width="90" height="56" rx="4"/><rect x="134" y="118" width="132" height="15" rx="6"/>
    <circle cx="178" cy="152" r="7"${K}/><circle cx="222" cy="152" r="7"${K}/>
    <path d="M200 166 L242 176 L200 182 Z"/>
    <circle cx="180" cy="192" r="3.5"${K}/><circle cx="192" cy="198" r="3.5"${K}/><circle cx="208" cy="198" r="3.5"${K}/><circle cx="220" cy="192" r="3.5"${K}/>
    <path d="M226 228 L236 286 H262 L250 222 Z"/>
    <path d="M144 206 Q200 232 256 206 L259 227 Q200 252 141 227 Z"/>
    <circle cx="200" cy="270" r="8"/><circle cx="200" cy="303" r="8"/><circle cx="200" cy="336" r="8"/>
    <circle cx="50" cy="60" r="8"/><circle cx="330" cy="40" r="7"/><circle cx="360" cy="140" r="9"/><circle cx="40" cy="180" r="7"/><circle cx="90" cy="120" r="5"/>` },
  { id: 'harowin', name: 'はろうぃん', lv: 1, d: `
    <path d="M190 148 Q185 115 200 92 L216 98 Q205 120 210 148 Z"/>
    <ellipse cx="140" cy="245" rx="82" ry="95"/><ellipse cx="260" cy="245" rx="82" ry="95"/>
    <ellipse cx="200" cy="245" rx="76" ry="102"/>
    <path d="M148 222 L182 222 L165 188 Z"/><path d="M218 222 L252 222 L235 188 Z"/>
    <path d="M192 250 L208 250 L200 238 Z"/>
    <path d="M140 272 Q200 330 260 272 L242 282 L228 270 L212 288 L188 288 L172 270 L158 282 Z"/>
    <path d="M330 40 A40 40 0 1 0 360 108 A32 32 0 1 1 330 40 Z"/>
    <path d="M40 90 Q55 72 70 85 Q76 70 82 86 Q96 72 112 90 Q96 92 90 104 Q80 96 74 104 Q66 92 40 90 Z"/>
    ${starPath(70, 160, 16)}${starPath(345, 180, 14)}
    ${grass(372)}` },
  { id: 'tanjoubi', name: 'たんじょうび', lv: 1, d: `
    <path${N} d="M130 210 Q150 260 200 286 M270 200 Q250 260 200 286 M200 170 Q190 230 200 286"/>
    <ellipse cx="128" cy="140" rx="55" ry="68"/><path d="M120 207 L136 207 L128 218 Z"/>
    <ellipse cx="272" cy="130" rx="55" ry="68"/><path d="M264 197 L280 197 L272 208 Z"/>
    <ellipse cx="200" cy="98" rx="55" ry="68"/><path d="M192 165 L208 165 L200 176 Z"/>
    <ellipse cx="105" cy="115" rx="9" ry="18" transform="rotate(25 105 115)"/>
    <ellipse cx="177" cy="73" rx="9" ry="18" transform="rotate(25 177 73)"/>
    <ellipse cx="249" cy="105" rx="9" ry="18" transform="rotate(25 249 105)"/>
    <ellipse cx="182" cy="284" rx="20" ry="12"/><ellipse cx="218" cy="284" rx="20" ry="12"/>
    <rect x="150" y="300" width="100" height="82"/>
    <rect x="140" y="288" width="120" height="24" rx="4"/>
    <rect x="190" y="288" width="20" height="94"/>
    ${starPath(50, 300, 18)}${starPath(350, 300, 18)}` },
  { id: 'koinobori', name: 'こいのぼり', lv: 1, d: `
    ${cloud(310, 340, 1.1)}
    <rect x="40" y="45" width="12" height="350"/><circle cx="46" cy="38" r="12"/>
    ${carp(52, 80, 1)}${carp(52, 210, 0.8)}
    <path${N} d="M300 60 Q320 50 340 60"/>` },
  { id: 'kurisumasu', name: 'くりすます', lv: 2, d: `
    <rect x="180" y="318" width="40" height="45"/>
    <path d="M200 170 L80 325 Q140 337 200 325 Q260 337 320 325 Z"/>
    <path d="M200 115 L105 245 Q150 257 200 245 Q250 257 295 245 Z"/>
    <path d="M200 62 L130 170 Q165 180 200 170 Q235 180 270 170 Z"/>
    ${starPath(200, 55, 28)}
    ${ornament(172, 145)}${ornament(228, 155)}${ornament(150, 222)}${ornament(252, 215)}${ornament(200, 200)}
    ${ornament(130, 300)}${ornament(270, 296)}${ornament(200, 286)}${ornament(164, 268)}${ornament(236, 262)}
    <rect x="40" y="320" width="60" height="50"/><rect x="34" y="308" width="72" height="16"/><rect x="64" y="308" width="12" height="62"/>
    <rect x="300" y="330" width="70" height="40"/><rect x="294" y="318" width="82" height="16"/><rect x="329" y="318" width="12" height="52"/>
    <path${N} d="M0 370 H400"/>
    <circle cx="40" cy="60" r="7"/><circle cx="350" cy="80" r="8"/><circle cx="70" cy="200" r="6"/><circle cx="340" cy="200" r="7"/>` },
  { id: 'hinamatsuri', name: 'ひなまつり', lv: 2, d: `
    <rect x="30" y="50" width="85" height="290"/><rect x="115" y="50" width="85" height="290"/>
    <rect x="200" y="50" width="85" height="290"/><rect x="285" y="50" width="85" height="290"/>
    <path d="M110 108 L118 66 Q125 58 134 66 L140 108 Z"/>
    <path d="M122 175 Q55 250 40 340 H200 Q190 250 122 175 Z"/>
    <path${N} d="M106 186 L122 218 L138 186"/>
    <rect x="115" y="235" width="14" height="50" rx="4"/>
    <circle cx="122" cy="148" r="35"/>
    <path d="M87 145 Q89 108 122 105 Q155 108 157 145 Q147 125 122 125 Q97 125 87 145 Z"/>
    <path${N} d="M108 150 Q113 146 118 150 M126 150 Q131 146 136 150"/>
    <path d="M243 150 Q240 215 252 230 H306 Q318 215 315 150 Z"/>
    <path d="M279 175 Q350 250 362 340 H200 Q210 250 279 175 Z"/>
    <path${N} d="M263 186 L279 218 L295 186"/>
    <path d="M262 262 L244 228 Q279 214 314 228 L296 262 Z"/>
    <circle cx="279" cy="148" r="35"/>
    <path d="M244 145 Q246 108 279 105 Q312 108 314 145 Q304 125 279 125 Q254 125 244 145 Z"/>
    <path d="M260 110 L266 90 L279 102 L292 90 L298 110 Z"/>
    <path${N} d="M265 150 Q270 146 275 150 M283 150 Q288 146 293 150"/>
    <rect x="15" y="340" width="370" height="32"/>
    ${flower(40, 30, 12)}${flower(360, 30, 12)}` },
  { id: 'oshougatsu', name: 'おしょうがつ', lv: 2, d: `
    <path d="M115 290 H285 L265 362 H135 Z"/>
    <path d="M175 330 Q200 314 225 330 V350 H175 Z"/>
    <rect x="88" y="268" width="224" height="22"/>
    <path d="M98 268 L118 285 L138 268 L158 285 L178 268 L198 285 L218 268 L238 285 L258 268 L278 285 L298 268 Z"/>
    <path d="M95 266 Q90 202 200 196 Q310 202 305 266 Z"/>
    <path d="M125 202 Q125 152 200 150 Q275 152 275 202 Z"/>
    <circle cx="200" cy="126" r="32"/>
    <path d="M200 96 Q225 76 245 90 Q222 106 200 96 Z"/>
    <circle cx="190" cy="120" r="2.5"${K}/><circle cx="210" cy="132" r="2.5"${K}/>
    <circle cx="330" cy="80" r="45"/>
    ${cloud(330, 170, 1)}${cloud(70, 90, 0.9)}${flower(50, 250, 16)}${flower(360, 260, 14)}` },
  { id: 'hanabi', name: 'はなび', lv: 2, d: `
    ${(() => {
      let s = '';
      const burst = (cx, cy, n, dist, rx, ry, c) => {
        for (let i = 0; i < n; i++) {
          const deg = i * 360 / n;
          const a = deg * Math.PI / 180;
          const x = cx + dist * Math.cos(a), y = cy + dist * Math.sin(a);
          s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx}" ry="${ry}" transform="rotate(${deg + 90} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
        }
        s += `<circle cx="${cx}" cy="${cy}" r="${c}"/>`;
      };
      burst(120, 110, 12, 50, 7, 24, 14);
      burst(290, 150, 10, 42, 7, 20, 12);
      for (let i = 0; i < 12; i++) {
        const a = i * 30 * Math.PI / 180;
        s += `<circle cx="${(290 + 72 * Math.cos(a)).toFixed(1)}" cy="${(150 + 72 * Math.sin(a)).toFixed(1)}" r="5"/>`;
      }
      burst(215, 50, 8, 26, 5, 13, 8);
      return s;
    })()}
    <path d="M0 400 V300 L35 270 L70 300 V400 Z"/><rect x="22" y="315" width="26" height="24"/>
    <path d="M70 400 V320 H140 V400 Z"/><path d="M62 320 L105 285 L148 320 Z"/><rect x="88" y="335" width="22" height="22"/>
    <rect x="160" y="260" width="70" height="140"/><rect x="175" y="280" width="16" height="18"/><rect x="200" y="280" width="16" height="18"/>
    <rect x="175" y="315" width="16" height="18"/><rect x="200" y="315" width="16" height="18"/>
    <path d="M250 400 V305 L295 270 L340 305 V400 Z"/><rect x="282" y="320" width="26" height="24"/>
    <path d="M340 400 V330 H400 V400 Z"/><rect x="356" y="345" width="20" height="20"/>
    <circle cx="40" cy="40" r="5"/><circle cx="370" cy="40" r="6"/><circle cx="380" cy="230" r="5"/><circle cx="30" cy="210" r="5"/>` },
];

const CATEGORIES = [
  { id: 'animal', icon: '🐶', name: 'どうぶつ', list: P_ANIMAL },
  { id: 'ride', icon: '🚗', name: 'のりもの', list: P_RIDE },
  { id: 'food', icon: '🍰', name: 'たべもの', list: P_FOOD },
  { id: 'season', icon: '🎄', name: 'きせつ', list: P_SEASON },
];
const PICTURES = {};
for (const c of CATEGORIES) for (const p of c.list) PICTURES[p.id] = p;

function pictureSvg(p, size = 1024) {
  const sw = p.lv === 1 ? 6 : 3.5;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="${size}" height="${size}">` +
    `<rect width="400" height="400" fill="#fff"/>` +
    `<g fill="#fff" stroke="#222" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${p.d}</g></svg>`;
}
function pictureUrl(p, size) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(pictureSvg(p, size));
}
