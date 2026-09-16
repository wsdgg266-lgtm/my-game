#!/usr/bin/env node
/**
 * シールアルバム の PWA アイコンを作る。
 *   node scripts/make-seal-icons.mjs
 *
 * 画像ライブラリを入れなくて済むように、ピクセルを自分で塗って
 * PNG(zlib は Node 標準)として書き出す。作り直したいときだけ実行すればよい。
 *
 * 絵柄: 市松模様の上に、星が入ったシール(白フチのダイカット風)。
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT_DIR = new URL('../seal/icons/', import.meta.url);

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
const CHECK_A = [26, 46, 36];    // 市松の暗い方
const CHECK_B = [47, 143, 91];   // 市松の緑
const WHITE = [255, 255, 255];
const FACE_A = [61, 220, 132];   // シール中身(緑)
const FACE_B = [255, 122, 182];  // シール中身(桃)
const STAR = [255, 255, 255];
const SHADOW = [8, 18, 13];

/* ---------- 形 ---------- */
/** 角の丸い四角までの符号つき距離 */
function roundedBox(px, py, bx, by, r) {
  const qx = Math.abs(px) - bx + r;
  const qy = Math.abs(py) - by + r;
  const ox = Math.max(qx, 0), oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
}
/** 5角の星(10頂点の多角形)の内外判定 */
function makeStar(R) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const rr = i % 2 === 0 ? R : R * 0.42;
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  return pts;
}
function inPoly(px, py, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const ANGLE = -8 * Math.PI / 180;
const COS = Math.cos(ANGLE), SIN = Math.sin(ANGLE);

function shade(x, y, size, scale, starPts) {
  const cx = size / 2, cy = size / 2;

  // 背景: 市松模様(4x4)
  const cell = size / 4;
  const on = ((Math.floor(x / cell) + Math.floor(y / cell)) % 2) === 0;
  let col = on ? CHECK_B.slice() : CHECK_A.slice();
  // ほんのり上から明るく
  col = mix(col, WHITE, (1 - y / size) * 0.08);

  // シール(回転した角丸四角)
  const dx = x - cx, dy = y - cy;
  const rx = dx * COS + dy * SIN;
  const ry = -dx * SIN + dy * COS;

  const half = size * scale;          // シールの半径相当
  const outer = roundedBox(rx, ry, half, half, half * 0.30);
  const inner = roundedBox(rx, ry, half * 0.86, half * 0.86, half * 0.26);

  // 影
  const shadow = roundedBox(rx - size * 0.012, ry - size * 0.016, half, half, half * 0.30);
  if (shadow < 0) col = mix(col, SHADOW, 0.45);

  if (outer < 0) {
    col = WHITE.slice();                               // 白いダイカットのフチ
    if (inner < 0) {
      const t = (rx + ry) / (half * 2.2) + 0.5;        // 斜めのグラデ
      col = mix(FACE_A, FACE_B, t);
      if (inPoly(rx, ry, starPts)) col = STAR.slice(); // 星
    }
  }
  return col;
}

function drawIcon(size, scale) {
  const rgba = Buffer.alloc(size * size * 4);
  const starPts = makeStar(size * scale * 0.56);
  const SS = 3;                            // スーパーサンプリングでギザギザを消す
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const c = shade(x + (sx + 0.5) / SS, y + (sy + 0.5) / SS, size, scale, starPts);
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
// maskable は端が切り取られるので、シールを一回り小さくして安全領域に収める
for (const [file, size, scale] of [
  ['icon-180.png', 180, 0.33],
  ['icon-192.png', 192, 0.33],
  ['icon-512.png', 512, 0.33],
  ['icon-maskable-512.png', 512, 0.26],
]) {
  writeFileSync(new URL(file, OUT_DIR), drawIcon(size, scale));
  console.log('作成:', file, size + 'x' + size);
}
