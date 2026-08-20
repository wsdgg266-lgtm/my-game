#!/usr/bin/env node
/**
 * 北近畿のイベント情報を自治体オープンデータ(CKAN)から取り込み、
 * events/data/imported.json を更新する。
 *
 * ブラウザから直接よそのサイトを読むと CORS で弾かれるので、
 * この取得は GitHub Actions(サーバー側)で行い、結果をリポジトリに置く。
 * アプリは同一オリジンの JSON を読むだけになる。
 *
 * 依存パッケージなし。Node 18 以降の fetch を使う。
 */
import { readFile, writeFile } from 'node:fs/promises';

const ROOT = new URL('..', import.meta.url);
const SRC_PATH = new URL('events/data/sources.json', ROOT);
const OUT_PATH = new URL('events/data/imported.json', ROOT);
const REPORT_PATH = new URL('events/data/import-report.json', ROOT);

const TIMEOUT_MS = 20000;
const MAX_DATASETS_PER_SOURCE = 40;
const MAX_ROWS_PER_RESOURCE = 500;

/* ---------- 取得 ---------- */
async function get(url, { asBuffer = false } = {}) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      headers: { 'User-Agent': 'kitaibe-event-importer/1.0 (+github actions)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return asBuffer ? Buffer.from(await res.arrayBuffer()) : await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** 自治体のCSVは Shift_JIS のことが多いので、化けたら読み直す */
export function decodeCsv(buf) {
  let text = new TextDecoder('utf-8', { fatal: false }).decode(buf);
  // U+FFFD(置換文字)が多いなら UTF-8 ではない
  const bad = (text.match(/�/g) || []).length;
  if (bad > 3) {
    for (const enc of ['shift_jis', 'euc-jp']) {
      try {
        const alt = new TextDecoder(enc, { fatal: false }).decode(buf);
        if ((alt.match(/�/g) || []).length < bad) return alt;
      } catch { /* この環境に無いエンコーディングは飛ばす */ }
    }
  }
  return text;
}

/* ---------- CSV ---------- */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(v => String(v).trim() !== ''));
}

/** 推奨データセット「イベント一覧」の列名にゆるく当てる */
const COLUMN_HINTS = {
  title:  ['イベント名', 'name', '行事名', '催し名', 'タイトル'],
  start:  ['開始日時', '開始日', '開催日', '日時', 'イベント開始日'],
  end:    ['終了日時', '終了日', 'イベント終了日'],
  venue:  ['開催場所', '場所', '会場', '施設名', '名称'],
  addr:   ['住所', '所在地', '開催場所_住所'],
  desc:   ['説明', '概要', '内容', '備考'],
  price:  ['料金', '費用', '参加費', '利用料金'],
  url:    ['url', 'ホームページ', '参考url', 'リンク', 'ｕｒｌ'],
  city:   ['市区町村名', '市町村名', '自治体名'],
};
export function mapColumns(header) {
  const norm = h => String(h).toLowerCase().replace(/[\s　_（）()]/g, '');
  const idx = {};
  header.forEach((h, i) => {
    const n = norm(h);
    for (const [key, hints] of Object.entries(COLUMN_HINTS)) {
      if (idx[key] !== undefined) continue;
      if (hints.some(x => n.includes(norm(x)))) idx[key] = i;
    }
  });
  return idx;
}

/* ---------- 正規化 ---------- */
const GENRE_KEYWORDS = [
  ['music',   ['コンサート', 'ライブ', '演奏会', '音楽', '吹奏楽', 'ジャズ', 'クラシック', 'フェス']],
  ['stage',   ['演劇', '舞台', '落語', 'お笑い', '公演', '寄席', '劇']],
  ['food',    ['グルメ', 'マルシェ', '朝市', '市場', 'food', 'まつり弁', '酒', 'そば', 'かに', 'カニ', '味覚', '収穫']],
  ['exp',     ['体験', '教室', 'ワークショップ', '講座', '見学', '作り', 'づくり']],
  ['sports',  ['マラソン', '大会', '駅伝', 'スポーツ', 'サイクリング', 'ラン', '武道', '野球', 'サッカー']],
  ['art',     ['展', '美術', '写真', 'アート', '博物', 'ギャラリー']],
  ['matsuri', ['祭', 'まつり', '花火', '灯籠', '山車']],
  ['trad',    ['神事', '神社', '寺', '伝統', '奉納', '例祭']],
  ['kids',    ['こども', '子ども', '親子', 'キッズ', 'ファミリー']],
  ['season',  ['桜', '紅葉', 'イルミ', '雪', '花', 'ライトアップ']],
];
export function guessGenres(text) {
  const t = String(text || '');
  const hit = GENRE_KEYWORDS.filter(([, ws]) => ws.some(w => t.includes(w))).map(([g]) => g);
  return hit.length ? [...new Set(hit)].slice(0, 3) : ['season'];
}

/** "2026-09-12 19:00" / "2026/9/12" / "令和8年9月12日" などを揃える */
export function normDate(v) {
  const s = String(v || '').trim();
  if (!s) return null;
  let m = s.match(/(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})/);
  if (!m) {
    const r = s.match(/令和(\d{1,2})年(\d{1,2})月(\d{1,2})日/);
    if (r) m = [null, String(2018 + Number(r[1])), r[2], r[3]];
  }
  if (!m) return null;
  const p = n => String(n).padStart(2, '0');
  const date = `${m[1]}-${p(m[2])}-${p(m[3])}`;
  const t = s.match(/(\d{1,2})[:：時](\d{2})/);
  return t ? `${date}T${p(t[1])}:${t[2]}` : date;
}

function cityOf(row, idx, targetCities) {
  const cand = [idx.city, idx.addr, idx.venue]
    .filter(i => i !== undefined).map(i => row[i]).join(' ');
  return targetCities.find(c => cand.includes(c))
    // 「篠山市」表記ゆれの吸収
    || (cand.includes('篠山市') ? '丹波篠山市' : null);
}

export function toEvent(row, idx, targetCities, sourceName) {
  const title = (row[idx.title] || '').trim();
  if (!title) return null;
  const start = normDate(row[idx.start]);
  if (!start) return null;
  const city = cityOf(row, idx, targetCities);
  if (!city) return null;                       // 北近畿の外は取り込まない
  const url = (row[idx.url] || '').trim();
  const desc = (row[idx.desc] || '').trim();
  return {
    id: `auto-${city}-${start.slice(0, 10)}-${title}`.replace(/[^\w　-鿿-]/g, '').slice(0, 80),
    title,
    genres: guessGenres(`${title} ${desc}`),
    start,
    end: normDate(row[idx.end]),
    venue: (row[idx.venue] || '').trim(),
    city,
    price: (row[idx.price] || '').trim(),
    note: desc.slice(0, 200),
    url: /^https?:/.test(url) ? url : '',
    needsTicket: false,   // オープンデータに発売日は載らない。要る場合は手で足す
    sales: [],
    source: `auto:${sourceName}`,
  };
}

/* ---------- CKAN ---------- */
async function harvestCkan(src, targetCities, report) {
  const found = [];
  const note = (level, msg) => report.push({ source: src.name, level, msg });
  let datasets = [];
  try {
    const q = encodeURIComponent('イベント');
    const json = await get(`${src.base}/api/3/action/package_search?q=${q}&rows=${MAX_DATASETS_PER_SOURCE}`);
    datasets = (json && json.result && json.result.results) || [];
    note('info', `データセット ${datasets.length}件`);
  } catch (e) {
    note('error', `カタログに接続できませんでした: ${e.message}`);
    return found;
  }

  for (const ds of datasets) {
    const resources = (ds.resources || []).filter(r =>
      String(r.format || '').toUpperCase() === 'CSV' && r.url);
    for (const r of resources.slice(0, 2)) {
      try {
        const rows = parseCsv(decodeCsv(await get(r.url, { asBuffer: true })));
        if (rows.length < 2) continue;
        const idx = mapColumns(rows[0]);
        if (idx.title === undefined || idx.start === undefined) continue;
        let n = 0;
        for (const row of rows.slice(1, MAX_ROWS_PER_RESOURCE + 1)) {
          const ev = toEvent(row, idx, targetCities, src.name);
          if (ev) { found.push(ev); n++; }
        }
        if (n) note('info', `${ds.title || ds.name}: ${n}件`);
      } catch (e) {
        note('warn', `${ds.title || ds.name}: 読めませんでした (${e.message})`);
      }
    }
  }
  return found;
}

/* ---------- 実行 ---------- */
export async function main() {
  const cfg = JSON.parse(await readFile(SRC_PATH, 'utf-8'));
  const report = [];
  let all = [];

  for (const src of cfg.ckan.filter(s => s.enabled)) {
    const got = await harvestCkan(src, cfg.targetCities, report);
    all = all.concat(got);
  }

  // 重複排除(同じ市町・同じ日・同じ名前は1件にまとめる)
  const byId = new Map();
  all.forEach(e => byId.set(e.id, e));
  // 過去のイベントは残しても仕方がないので、昨日より前は落とす
  const cutoff = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const events = [...byId.values()]
    .filter(e => e.start.slice(0, 10) >= cutoff)
    .sort((a, b) => a.start.localeCompare(b.start));

  const out = {
    _readme: 'GitHub Actions が自動生成します。手で編集しても次回の実行で上書きされます。',
    generatedAt: new Date().toISOString(),
    count: events.length,
    events,
  };

  // 中身が同じなら書き換えない(無意味なコミットを増やさない)
  let prev = null;
  try { prev = JSON.parse(await readFile(OUT_PATH, 'utf-8')); } catch { /* 初回 */ }
  const same = prev && JSON.stringify(prev.events) === JSON.stringify(events);
  if (!same) await writeFile(OUT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf-8');

  await writeFile(REPORT_PATH, JSON.stringify({
    ranAt: new Date().toISOString(), imported: events.length, changed: !same, log: report,
  }, null, 2) + '\n', 'utf-8');

  console.log(`取り込み ${events.length}件 / 変更 ${same ? 'なし' : 'あり'}`);
  report.forEach(r => console.log(`  [${r.level}] ${r.source}: ${r.msg}`));
  if (!events.length) {
    console.log('\n1件も取れませんでした。events/data/import-report.json の理由を見て、');
    console.log('events/data/sources.json のソースを見直してください(手入力運用でも問題ありません)。');
  }
}

// 直接実行されたときだけ走らせる(テストから import しても動かない)
import { pathToFileURL } from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
