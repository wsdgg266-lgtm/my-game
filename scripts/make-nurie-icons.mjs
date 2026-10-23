#!/usr/bin/env node
/**
 * いろいろぬりえ の PWA アイコンを作る。
 *   node scripts/make-nurie-icons.mjs
 *
 * 画像ライブラリを入れなくて済むように、ピクセルを自分で塗って
 * PNG(zlib は Node 標準)として書き出す。作り直したいときだけ実行すればよい。
 *
 * 絵柄: オレンジの背景に白いおさら。あか・きいろ・あおの絵の具が重なって、まざった色が見える。
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT_DIR = new URL('../nurie/icons/', import.meta.url);

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

/* ---------- 色 ---------- */
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, t))));
const BG_A = [255, 190, 90];
const BG_B = [255, 120, 150];
const WHITE = [255, 255, 255];
const RIM = [240, 222, 200];
const RED = [229, 57, 53], YEL = [255, 214, 40], BLUE = [30, 100, 216];
const ORANGE = [250, 140, 30], GREEN = [60, 170, 70], PURPLE = [140, 70, 170], BROWN = [120, 80, 60];

function shade(x, y, size, scale) {
  const cx = size / 2, cy = size / 2;
  let col = mix(BG_A, BG_B, (x + y) / (size * 2));
  const dx = (x - cx) / size, dy = (y - cy) / size;
  const R = 0.40 * scale;
  const d = Math.hypot(dx, dy - 0.012 * scale);
  if (d < R + 0.012 * scale) col = mix(col, [180, 90, 60], 0.35);   // かげ
  const d0 = Math.hypot(dx, dy);
  if (d0 < R) col = WHITE.slice();
  if (d0 < R * 0.93 && d0 > R * 0.88) col = RIM.slice();
  const br = 0.17 * scale, off = 0.085 * scale;
  const r = Math.hypot(dx + off, dy + off * 0.6) < br;
  const yl = Math.hypot(dx - off, dy + off * 0.6) < br;
  const b = Math.hypot(dx, dy - off * 1.1) < br;
  if (r || yl || b) {
    if (r && yl && b) col = BROWN;
    else if (r && yl) col = ORANGE;
    else if (yl && b) col = GREEN;
    else if (r && b) col = PURPLE;
    else col = r ? RED : yl ? YEL : BLUE;
  }
  return col;
}

function drawIcon(size, scale) {
  const rgba = Buffer.alloc(size * size * 4);
  const SS = 3;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const c = shade(x + (sx + 0.5) / SS, y + (sy + 0.5) / SS, size, scale);
        r += c[0]; g += c[1]; b += c[2];
      }
      const i = (y * size + x) * 4, n = SS * SS;
      rgba[i] = Math.round(r / n); rgba[i + 1] = Math.round(g / n); rgba[i + 2] = Math.round(b / n); rgba[i + 3] = 255;
    }
  }
  return encodePng(size, rgba);
}

mkdirSync(OUT_DIR, { recursive: true });
// maskable は端が切り取られるので、おさらを小さくして安全領域に収める
for (const [file, size, scale] of [
  ['icon-180.png', 180, 1],
  ['icon-192.png', 192, 1],
  ['icon-512.png', 512, 1],
  ['icon-maskable-512.png', 512, 0.8],
]) {
  writeFileSync(new URL(file, OUT_DIR), drawIcon(size, scale));
  console.log('作成:', file, size + 'x' + size);
}
