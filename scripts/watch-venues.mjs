#!/usr/bin/env node
/**
 * 会場(ホール)の公演情報ページを見張って、更新があったら知らせる。
 *
 * なぜこれが要るか:
 *   吉本新喜劇の福知山公演のような公演は、ホールの「チケット発売情報」ページに
 *   載ってから先行受付が始まるまでに数週間ある。そこを掴めれば最速の先行に間に合う。
 *   一方、自治体オープンデータには「チケット発売日」が載らないので、
 *   import-events.mjs だけでは この種のイベントを先回りできない。
 *
 * やること:
 *   ページ本文のハッシュを取って前回と比べ、変わっていたら venue-updates.json に記録する。
 *   HTMLの構造に依存した解析はしない(サイト改装で壊れるため)。
 *   「何か新しく載った」ことだけ確実に拾い、判断は人がリンクを開いて行う。
 *
 * 依存パッケージなし。Node 18 以降の fetch を使う。
 */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const ROOT = new URL('..', import.meta.url);
const VENUES_PATH = new URL('events/data/venues.json', ROOT);
const STATE_PATH  = new URL('events/data/venue-watch-state.json', ROOT);
const OUT_PATH    = new URL('events/data/venue-updates.json', ROOT);

const TIMEOUT_MS = 20000;
const KEEP_UPDATES = 40;

async function fetchText(url) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      headers: { 'User-Agent': 'kitaibe-venue-watch/1.0 (+github actions)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 本文だけを取り出して指紋にする。
 * script/style/コメントを落とし、タグを剥がし、空白を潰す。
 * 日時表示やアクセスカウンタのような「毎回変わる部分」は誤検知の元なので消す。
 */
export function fingerprint(html) {
  let t = String(html)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  t = t
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    // 現在時刻・更新日時のたぐい(毎回変わるので無視する)
    .replace(/\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?\s*\d{1,2}:\d{2}(:\d{2})?/g, ' ')
    .replace(/\d{1,2}:\d{2}:\d{2}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return t;
}

const hashOf = s => createHash('sha256').update(s).digest('hex').slice(0, 32);

export async function main() {
  const cfg = JSON.parse(await readFile(VENUES_PATH, 'utf-8'));
  let state = {};
  try { state = JSON.parse(await readFile(STATE_PATH, 'utf-8')); } catch { /* 初回 */ }

  let prevOut = { updates: [] };
  try { prevOut = JSON.parse(await readFile(OUT_PATH, 'utf-8')); } catch { /* 初回 */ }

  const updates = [];
  const log = [];
  const now = new Date().toISOString();

  for (const v of cfg.venues) {
    for (const link of (v.links || []).filter(l => l.watch && l.url)) {
      const key = `${v.id}|${link.url}`;
      try {
        const text = fingerprint(await fetchText(link.url));
        if (text.length < 200) {                 // 中身がほぼ無い = 取得に失敗したのと同じ
          log.push({ venue: v.name, level: 'warn', msg: '本文が取れませんでした(JS描画のページかも)' });
          continue;
        }
        const h = hashOf(text);
        const before = state[key];
        state[key] = { hash: h, checkedAt: now, len: text.length };
        if (!before) {
          log.push({ venue: v.name, level: 'info', msg: '初回チェック。次回から更新を見ます' });
        } else if (before.hash !== h) {
          updates.push({
            venueId: v.id, venue: v.name, city: v.city,
            label: link.label, url: link.url, detectedAt: now,
          });
          log.push({ venue: v.name, level: 'info', msg: `更新を検知 (${link.label})` });
        } else {
          log.push({ venue: v.name, level: 'info', msg: '変化なし' });
        }
      } catch (e) {
        log.push({ venue: v.name, level: 'error', msg: `取得できませんでした: ${e.message}` });
      }
    }
  }

  // 新しい順に並べ、同じURLの古い通知は1件に畳む
  const merged = [...updates, ...(prevOut.updates || [])];
  const seen = new Set();
  const kept = merged.filter(u => {
    const k = `${u.url}|${u.detectedAt}`;
    if (seen.has(k)) return false;
    seen.add(k); return true;
  }).slice(0, KEEP_UPDATES);

  await writeFile(OUT_PATH, JSON.stringify({
    _readme: '会場ページの更新検知の結果。GitHub Actions の watch-venues が自動生成します。手で編集しても次回の実行で上書きされます。',
    generatedAt: now, updates: kept, log,
  }, null, 2) + '\n', 'utf-8');
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf-8');

  console.log(`会場ウォッチ: ${updates.length}件の更新を検知`);
  log.forEach(l => console.log(`  [${l.level}] ${l.venue}: ${l.msg}`));
}

import { pathToFileURL } from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
