#!/usr/bin/env node
/**
 * おてつだいバンク の PWA アイコンを作る。
 *   node scripts/make-points-icons.mjs
 *
 * 画像ライブラリを入れなくて済むように、ピクセルを自分で塗って
 * PNG(zlib は Node 標準)として書き出す。作り直したいときだけ実行すればよい。
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT_DIR = new URL('../points/icons/', import.meta.url);

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

/* ---------- 描画: 金貨に「¥」 ---------- */
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, t))));
const BG_TOP = [255, 214, 128], BG_BOT = [242, 150, 20];   // 背景(オレンジのグラデ)
const COIN_HI = [255, 240, 190], COIN_LO = [246, 186, 48]; // コイン本体
const RIM = [214, 132, 10];                                // コインのふち
const MARK = [122, 70, 4];                                 // ¥ の色

/** 線分までの距離 */
function segDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - x1) * dx + (py - y1) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
}

function shade(x, y, size, coinR) {
  const cx = size / 2, cy = size / 2;
  const dx = x - cx, dy = y - cy;
  const dist = Math.hypot(dx, dy);

  let col = mix(BG_TOP, BG_BOT, y / size);

  if (dist <= coinR) {
    // コイン(左上が明るい)
    col = mix(COIN_HI, COIN_LO, (dx + dy) / (coinR * 2.4) + 0.5);
    // ふち
    if (dist > coinR * 0.87) col = mix(col, RIM, (dist - coinR * 0.87) / (coinR * 0.13));
    if (dist > coinR * 0.76 && dist < coinR * 0.82) col = mix(col, RIM, 0.55);

    // ¥ マーク
    const s = coinR;                       // 記号の基準サイズ
    const w = s * 0.115;                   // 線の太さ
    const topY = -s * 0.40, midY = s * 0.02, botY = s * 0.42;
    const armX = s * 0.30;
    const d = Math.min(
      segDist(dx, dy, -armX, topY, 0, midY),      // \
      segDist(dx, dy, armX, topY, 0, midY),       // /
      segDist(dx, dy, 0, midY, 0, botY),          // |
      segDist(dx, dy, -armX * 0.86, midY + s * 0.12, armX * 0.86, midY + s * 0.12),
      segDist(dx, dy, -armX * 0.86, midY + s * 0.27, armX * 0.86, midY + s * 0.27)
    );
    if (d < w / 2) col = MARK;
  }
  return col;
}

function drawIcon(size, coinRatio) {
  const rgba = Buffer.alloc(size * size * 4);
  const coinR = size * coinRatio;
  const SS = 3;                            // スーパーサンプリングでギザギザを消す
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const c = shade(x + (sx + 0.5) / SS, y + (sy + 0.5) / SS, size, coinR);
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
// maskable は端が切り取られるので、コインを一回り小さくして安全領域に収める
for (const [file, size, ratio] of [
  ['icon-180.png', 180, 0.37],
  ['icon-192.png', 192, 0.37],
  ['icon-512.png', 512, 0.37],
  ['icon-maskable-512.png', 512, 0.30],
]) {
  writeFileSync(new URL(file, OUT_DIR), drawIcon(size, ratio));
  console.log('作成:', file, size + 'x' + size);
}
