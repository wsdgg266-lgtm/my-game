#!/usr/bin/env node
/**
 * なぞモン の PWA アイコンを作る。
 *   node scripts/make-nazomon-icons.mjs
 *
 * アプリと同じ monsters.js の絵(ヒノピー)を Playwright の Chromium で PNG にする。
 * 作り直したいときだけ実行すればよい。
 */
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const OUT = new URL('../nazomon/icons/', import.meta.url);
const js = readFileSync(new URL('../nazomon/monsters.js', import.meta.url), 'utf8');

const html = scale => `<html><body style="margin:0">
<div id="i" style="width:512px;height:512px;position:relative;overflow:hidden;background:radial-gradient(circle at 50% 40%,#C9B6FF,#8A6BFF 75%)">
  <div style="position:absolute;left:${256 - 300 * scale}px;top:${256 - 280 * scale}px;width:${600 * scale}px;height:${600 * scale}px" id="m"></div>
  <div style="position:absolute;right:${256 - 210 * scale}px;top:${256 - 230 * scale}px;width:${140 * scale}px;height:${140 * scale}px;border-radius:50%;background:#fff;
    color:#8A6BFF;font:900 ${100 * scale}px/1 sans-serif;display:flex;align-items:center;justify-content:center;box-shadow:0 ${8 * scale}px 0 #6247D6">?</div>
</div><script>${js}</script><script>document.getElementById('m').innerHTML = MONSTERS.svg('fire', 1)</script></body></html>`;

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
for (const [file, size, scale] of [
  ['icon-180.png', 180, 1], ['icon-192.png', 192, 1], ['icon-512.png', 512, 1], ['icon-maskable-512.png', 512, 0.78],
]) {
  const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: size / 512 });
  await page.setContent(html(scale));
  await page.locator('#i').screenshot({ path: new URL(file, OUT).pathname });
  await page.close();
  console.log('作成:', file);
}
await browser.close();
