#!/usr/bin/env node
/**
 * バスナビ! の PWA アイコンを作る。
 *   node scripts/make-basket-icons.mjs
 *
 * 画像ライブラリを入れなくて済むように、ピクセルを自分で塗って
 * PNG(zlib は Node 標準)として書き出す。作り直したいときだけ実行すればよい。
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT_DIR = new URL('../basket/icons/', import.meta.url);

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
    raw[y * (size * 4 + 1)] = 0;                                  // フィルタなし
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

/* ---------- 描画 ---------- */
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, t))));
const BG_IN = [58, 36, 16], BG_OUT = [12, 15, 22];
const BALL_HI = [255, 186, 74], BALL_LO = [232, 74, 34];
const SEAM = [26, 12, 4];

/** 1ピクセル(サブサンプル1点)の色を返す */
function shade(x, y, size, ballR) {
  const cx = size / 2, cy = size / 2;
  const dx = x - cx, dy = y - cy;
  const dist = Math.hypot(dx, dy);

  // 背景(中心が明るい放射グラデーション)
  let col = mix(BG_IN, BG_OUT, dist / (size * 0.62));

  if (dist <= ballR) {
    // ボール本体。左上を明るくして立体感を出す
    const t = (dx + dy) / (ballR * 2.6) + 0.5;
    col = mix(BALL_HI, BALL_LO, t);

    const w = ballR * 0.085;              // 継ぎ目の太さ
    const arcA = ballR * 0.42;            // 曲線の継ぎ目(円で近似。小さいほど外側に膨らむ)
    const arcR = Math.hypot(arcA, ballR);
    const onSeam =
      Math.abs(dx) < w / 2 ||
      Math.abs(dy) < w / 2 ||
      Math.abs(Math.hypot(dx - arcA, dy) - arcR) < w / 2 ||
      Math.abs(Math.hypot(dx + arcA, dy) - arcR) < w / 2;
    if (onSeam) col = SEAM;

    // ふちを少し暗くする
    if (dist > ballR * 0.93) col = mix(col, SEAM, (dist - ballR * 0.93) / (ballR * 0.07) * 0.55);
  }
  return col;
}

function drawIcon(size, ballRatio) {
  const rgba = Buffer.alloc(size * size * 4);
  const ballR = size * ballRatio;
  const SS = 2;                            // 2x2 のスーパーサンプリングでギザギザを消す
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const c = shade(x + (sx + 0.5) / SS, y + (sy + 0.5) / SS, size, ballR);
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
// maskable は端が切り取られるので、ボールを一回り小さくして安全領域に収める
for (const [file, size, ratio] of [
  ['icon-180.png', 180, 0.36],
  ['icon-192.png', 192, 0.36],
  ['icon-512.png', 512, 0.36],
  ['icon-maskable-512.png', 512, 0.29],
]) {
  writeFileSync(new URL(file, OUT_DIR), drawIcon(size, ratio));
  console.log('作成:', file, size + 'x' + size);
}
