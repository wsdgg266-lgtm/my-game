#!/usr/bin/env node
/**
 * まなクエ! の PWA アイコンを作る。
 *   node scripts/make-study-icons.mjs
 *
 * 画像ライブラリを入れなくて済むように、ピクセルを自分で塗って
 * PNG(zlib は Node 標準)として書き出す。作り直したいときだけ実行すればよい。
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT_DIR = new URL('../study/icons/', import.meta.url);

/* ---------- PNG 書き出し ---------- */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePng(size, rgba) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;   // 8bit RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- 描画: むらさきの背景に 金色の星 ---------- */
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, t))));
const BG_TOP = [163, 141, 255], BG_BOT = [98, 66, 226];   // 背景(むらさきのグラデ)
const ST_HI = [255, 236, 160], ST_LO = [246, 168, 30];    // 星のグラデ
const RIM = [214, 122, 8];                                // 星のふち

/** 5つの角の星: 中心からの角度 t での「星のふちまでの きょり」 */
function starRadius(t, R) {
  const r = R * 0.42;                      // へこんだ部分の半径
  const seg = Math.PI * 2 / 5, half = seg / 2;
  let a = ((t % seg) + seg) % seg;
  if (a > half) a = seg - a;               // 左右対称
  return (R * r * Math.sin(half)) / (R * Math.sin(a) + r * Math.sin(half - a));
}

function shade(x, y, size, R) {
  const cx = size / 2, cy = size / 2 + size * 0.015;
  const dx = x - cx, dy = y - cy;
  const dist = Math.hypot(dx, dy);
  let col = mix(BG_TOP, BG_BOT, y / size);
  const ang = Math.atan2(dx, -dy);         // 真上を 0 にする
  const edge = starRadius(ang, R);
  if (dist <= edge) {
    col = mix(ST_HI, ST_LO, (dx + dy) / (R * 2.2) + 0.5);
    if (dist > edge - R * 0.06) col = mix(col, RIM, (dist - (edge - R * 0.06)) / (R * 0.06));
  }
  return col;
}

function drawIcon(size, ratio) {
  const rgba = Buffer.alloc(size * size * 4);
  const R = size * ratio;
  const SS = 3;                            // スーパーサンプリングでギザギザを消す
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const c = shade(x + (sx + 0.5) / SS, y + (sy + 0.5) / SS, size, R);
          r += c[0]; g += c[1]; b += c[2];
        }
      }
      const i = (y * size + x) * 4, n = SS * SS;
      rgba[i] = Math.round(r / n); rgba[i + 1] = Math.round(g / n); rgba[i + 2] = Math.round(b / n);
      rgba[i + 3] = 255;
    }
  }
  return encodePng(size, rgba);
}

mkdirSync(OUT_DIR, { recursive: true });
// maskable は端が切り取られるので、星を一回り小さくして安全領域に収める
for (const [file, size, ratio] of [
  ['icon-180.png', 180, 0.40],
  ['icon-192.png', 192, 0.40],
  ['icon-512.png', 512, 0.40],
  ['icon-maskable-512.png', 512, 0.32],
]) {
  writeFileSync(new URL(file, OUT_DIR), drawIcon(size, ratio));
  console.log('作成:', file, size + 'x' + size);
}
