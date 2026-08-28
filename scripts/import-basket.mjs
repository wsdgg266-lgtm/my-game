#!/usr/bin/env node
/**
 * バスナビ! のデータを取り込む。
 *   - B.LEAGUE の日程・結果・順位表   (TheSportsDB)
 *   - バスケ日本代表の試合             (TheSportsDB)
 *   - NBAでプレーする日本出身選手      (ESPN)
 *   - 日本のバスケットボール関連ニュース (各社のRSS)
 *
 * ブラウザから直接よそのサイトを読むと CORS で弾かれるので、取得はここ
 * (GitHub Actions = サーバー側)で行い、結果をリポジトリに置く。
 * アプリは同一オリジンの JSON を読むだけで済む。
 *
 * 依存パッケージなし。Node 18 以降の fetch を使う。
 *   node scripts/import-basket.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';

const ROOT = new URL('..', import.meta.url);
const OUT_B    = new URL('basket/data/bleague.json', ROOT);
const OUT_JPN  = new URL('basket/data/japan.json', ROOT);
const OUT_NBA  = new URL('basket/data/nba-jp.json', ROOT);
const OUT_NEWS = new URL('basket/data/news.json', ROOT);
const NEWS_SRC = new URL('basket/data/news-sources.json', ROOT);
const OUT_REP  = new URL('basket/data/import-report.json', ROOT);

const TIMEOUT_MS = 20000;
const TSDB_KEY = process.env.TSDB_KEY || '123';         // 無料の公開キー
const TSDB = `https://www.thesportsdb.com/api/v1/json/${TSDB_KEY}/`;
const TSDB_WAIT = 2200;                                  // 30回/分の制限があるので間隔を空ける
const ESPN = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/';
const ESPN_WEB = 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const report = [];
const note = (name, ok, detail) => {
  report.push({ name, ok, detail });
  console.log(ok ? '  ✓' : '  ✗', name, '-', detail);
};

async function get(url) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ac.signal, headers: { 'User-Agent': 'basunavi-importer/1.0 (+github actions)' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally { clearTimeout(timer); }
}
async function getText(url) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ac.signal, headers: { 'User-Agent': 'basunavi-importer/1.0 (+github actions)' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally { clearTimeout(timer); }
}
let tsdbLast = 0;
async function tsdb(path) {
  const wait = tsdbLast + TSDB_WAIT - Date.now();
  if (wait > 0) await sleep(wait);
  tsdbLast = Date.now();
  return get(TSDB + path);
}

/* ================= 日付まわり ================= */
const JST = 'Asia/Tokyo';
const dateFmt = new Intl.DateTimeFormat('sv-SE', { timeZone: JST, year:'numeric', month:'2-digit', day:'2-digit' });
const timeFmt = new Intl.DateTimeFormat('ja-JP', { timeZone: JST, hour:'2-digit', minute:'2-digit', hour12:false });
export const dateKeyJst = ts => dateFmt.format(new Date(ts));
export const timeKeyJst = ts => timeFmt.format(new Date(ts));

/** バスケのシーズンは秋から春にまたがるので "2026-2027" の形にする */
export function seasonLabel(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;          // 1-12
  const start = m >= 8 ? y : y - 1;          // 8月以降は新シーズン扱い
  return `${start}-${start + 1}`;
}

/* ================= TheSportsDB の正規化 ================= */
/** リーグ一覧から B.LEAGUE を選ぶ */
export function pickBLeague(leagues) {
  const list = (leagues || []).filter(l => (l.strSport || '') === 'Basketball');
  const byName = list.find(l => /b\.?\s?league|b1\b/i.test(l.strLeague || '') && !/women|female/i.test(l.strLeague || ''));
  if (byName) return byName;
  return list.find(l => /japan/i.test(l.strLeague || '') || /japan/i.test(l.strCountry || '')) || null;
}
/** チーム一覧からバスケ日本代表を選ぶ */
export function pickJapanTeam(teams) {
  const list = (teams || []).filter(t => (t.strSport || '') === 'Basketball');
  const exact = list.find(t => /^japan$/i.test((t.strTeam || '').trim()));
  if (exact) return exact;
  return list.find(t => /japan/i.test(t.strTeam || '') && /national|代表/i.test(t.strTeam + ' ' + (t.strDescriptionEN || '').slice(0, 200))) || null;
}
/** 試合1件を、アプリがそのまま読める形に直す */
export function normalizeTsdbEvent(raw, prefix) {
  let ts = null;
  if (raw.strTimestamp) {
    const s = raw.strTimestamp.includes('T') ? raw.strTimestamp : raw.strTimestamp.replace(' ', 'T');
    ts = Date.parse(s.endsWith('Z') ? s : s + 'Z');
  }
  if ((ts == null || isNaN(ts)) && raw.dateEvent) {
    const t = raw.strTime && raw.strTime !== '00:00:00' ? raw.strTime : '10:00:00';
    ts = Date.parse(`${raw.dateEvent}T${t}Z`);
  }
  if (isNaN(ts)) ts = null;
  const timeUnknown = !raw.strTimestamp && (!raw.strTime || raw.strTime === '00:00:00');
  const num = v => (v == null || v === '' ? null : Number(v));
  const hs = num(raw.intHomeScore), as = num(raw.intAwayScore);
  let status = 'pre';
  if (String(raw.strPostponed).toLowerCase() === 'yes') status = 'ppd';
  else if (hs != null && as != null) status = 'post';
  else if (ts && ts < Date.now() - 4 * 3600 * 1000) status = 'nores';
  return {
    id: (prefix || 'e') + (raw.idEvent || `${raw.dateEvent}${raw.strHomeTeam}`),
    ts,
    dateJst: ts ? dateKeyJst(ts) : (raw.dateEvent || null),
    timeJst: ts && !timeUnknown ? timeKeyJst(ts) : null,
    home: raw.strHomeTeam || '?',
    away: raw.strAwayTeam || '?',
    hs, as, status,
    venue: raw.strVenue || '',
    label: raw.strLeague && /cup|world|olympic|asia|fiba/i.test(raw.strLeague) ? raw.strLeague : '',
  };
}
/** 順位表1行 */
export function normalizeStandingRow(raw, i) {
  const num = v => (v == null || v === '' ? null : Number(v));
  const w = num(raw.intWin), l = num(raw.intLoss);
  let pct = null;
  if (w != null && l != null && w + l > 0) pct = (w / (w + l)).toFixed(3);
  return {
    rank: num(raw.intRank) || i + 1,
    team: raw.strTeam || '?',
    w, l, pct,
    gb: null,
    group: raw.strGroup || raw.strDivision || 'B.LEAGUE',
    streak: raw.strForm || null,
    l10: null,
  };
}

/* ================= ESPN(NBAの日本人選手) ================= */
export function isJapanese(athlete) {
  const bp = athlete && athlete.birthPlace;
  if (!bp) return false;
  return /japan/i.test(bp.country || '') || /japan/i.test(bp.countryAbbrev || '');
}
/** ESPN の成績JSONは形が安定しないので、ラベルと値の組を総当たりで探す */
export function extractPlayerStats(json) {
  const want = {
    ppg: /^(ppg|pts)$/i, rpg: /^(rpg|reb)$/i, apg: /^(apg|ast)$/i,
    mpg: /^(mpg|min)$/i, fgPct: /^(fg%|fgpct)$/i, games: /^(gp|g)$/i,
  };
  const out = {};
  const visit = node => {
    if (!node || typeof node !== 'object') return;
    const labels = node.names || node.labels || node.displayNames;
    const values = node.stats || node.displayStats || node.values;
    if (Array.isArray(labels) && Array.isArray(values) && labels.length === values.length) {
      for (const key in want) {
        if (out[key] != null) continue;
        const i = labels.findIndex(l => want[key].test(String(l).trim()));
        if (i >= 0 && values[i] != null && values[i] !== '') out[key] = String(values[i]);
      }
    }
    for (const k in node) {
      const v = node[k];
      if (Array.isArray(v)) v.forEach(visit);
      else if (v && typeof v === 'object') visit(v);
    }
  };
  visit(json);
  return Object.keys(out).length ? out : null;
}

/* ================= ニュース(RSS / Atom) ================= */
/** &amp; などを元の文字に戻す */
export function decodeEntities(str) {
  return String(str == null ? '' : str)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim();
}
const tagText = (block, tag) => {
  const m = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? decodeEntities(m[1]) : null;
};
/** RSS 2.0 と Atom のどちらでも記事を取り出せるようにする */
export function parseFeed(xml) {
  if (!xml || typeof xml !== 'string') return [];
  const blocks = xml.match(/<(item|entry)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi) || [];
  const out = [];
  for (const b of blocks) {
    const title = tagText(b, 'title');
    // RSS は <link>URL</link>、Atom は <link href="URL"/>
    let url = tagText(b, 'link');
    if (!url || /^\s*$/.test(url)) {
      const m = b.match(/<link[^>]*\shref=["']([^"']+)["'][^>]*>/i);
      url = m ? decodeEntities(m[1]) : null;
    }
    const raw = tagText(b, 'pubDate') || tagText(b, 'published') || tagText(b, 'updated') || tagText(b, 'dc:date');
    let ts = raw ? Date.parse(raw) : NaN;
    if (isNaN(ts)) ts = null;
    if (!title || !url || !/^https?:\/\//.test(url)) continue;
    out.push({ title, url, ts, date: ts ? dateKeyJst(ts) : null });
  }
  return out;
}
/** スポーツ全般のフィードから、バスケの記事だけを拾う */
export function matchesKeywords(text, keywords) {
  const t = String(text || '');
  return (keywords || []).some(k => k && t.includes(k));
}
/** URLとタイトルの重複を消して、新しい順に並べる */
export function dedupeNews(items, max, maxAgeDays) {
  const limit = maxAgeDays ? Date.now() - maxAgeDays * 86400000 : null;
  const seen = new Set();
  const out = [];
  for (const it of items.slice().sort((a, b) => (b.ts || 0) - (a.ts || 0))) {
    if (limit && it.ts && it.ts < limit) continue;
    const key = it.url.replace(/[?#].*$/, '');
    const tkey = 't:' + it.title;
    if (seen.has(key) || seen.has(tkey)) continue;
    seen.add(key); seen.add(tkey);
    out.push(it);
    if (max && out.length >= max) break;
  }
  return out;
}

async function importNews(conf) {
  const out = { updatedAt: new Date().toISOString(), items: [], source: 'RSS', note: '' };
  const feeds = (conf.feeds || []).filter(f => f.enabled !== false);
  const all = [];
  for (const f of feeds) {
    try {
      const items = parseFeed(await getText(f.url));
      const picked = (f.filter ? items.filter(i => matchesKeywords(i.title, conf.keywords)) : items)
        .map(i => ({ ...i, source: f.name }));
      all.push(...picked);
      note(`ニュース: ${f.name}`, picked.length > 0, `${picked.length}件${f.filter ? `(全${items.length}件から絞り込み)` : ''}`);
    } catch (e) {
      note(`ニュース: ${f.name}`, false, e.message);
    }
  }
  out.items = dedupeNews(all, conf.maxItems || 60, conf.maxAgeDays || 30);
  if (!out.items.length) out.note = 'ニュースを取得できませんでした';
  return out;
}

/* ================= 取り込み本体 ================= */
async function importBLeague() {
  const out = { updatedAt: new Date().toISOString(), season: null, leagueName: 'B.LEAGUE',
    leagueId: null, games: [], standings: [], source: 'TheSportsDB', note: '' };
  let league = null;
  try {
    const j = await tsdb('all_leagues.php');
    league = pickBLeague(j && j.leagues);
    if (!league) throw new Error('B.LEAGUE がリーグ一覧に見つかりません');
    out.leagueId = league.idLeague;
    out.leagueName = league.strLeague || 'B.LEAGUE';
    note('B.LEAGUE リーグ検索', true, `${out.leagueName}(id=${out.leagueId})`);
  } catch (e) {
    note('B.LEAGUE リーグ検索', false, e.message);
    out.note = 'リーグが見つからなかったため取り込めませんでした';
    return out;
  }

  // 試合。まず今シーズン、空なら前シーズンも見る
  const seasons = [seasonLabel(), seasonLabel(new Date(Date.now() - 200 * 86400000))];
  const map = new Map();
  for (const s of seasons) {
    try {
      const j = await tsdb(`eventsseason.php?id=${out.leagueId}&s=${s}`);
      const arr = (j && j.events) || [];
      for (const raw of arr) if (raw && raw.idEvent) map.set(raw.idEvent, raw);
      if (arr.length) { out.season = s; note(`B.LEAGUE 日程(${s})`, true, `${arr.length}件`); break; }
      note(`B.LEAGUE 日程(${s})`, false, '0件');
    } catch (e) { note(`B.LEAGUE 日程(${s})`, false, e.message); }
  }
  // 直近の結果はシーズンAPIへの反映が遅れることがあるので、専用APIでも補う
  for (const [label, path] of [['今後', `eventsnextleague.php?id=${out.leagueId}`], ['直近', `eventspastleague.php?id=${out.leagueId}`]]) {
    try {
      const j = await tsdb(path);
      const arr = (j && (j.events || j.results)) || [];
      for (const raw of arr) if (raw && raw.idEvent) map.set(raw.idEvent, raw);
      note(`B.LEAGUE ${label}の試合`, arr.length > 0, `${arr.length}件`);
    } catch (e) { note(`B.LEAGUE ${label}の試合`, false, e.message); }
  }
  out.games = Array.from(map.values()).map(r => normalizeTsdbEvent(r, 'b')).sort((a, b) => (a.ts || 0) - (b.ts || 0));

  // 順位表
  for (const s of [out.season || seasons[0], seasons[1]]) {
    try {
      const j = await tsdb(`lookuptable.php?l=${out.leagueId}&s=${s}`);
      const arr = (j && (j.table || j.lookuptable)) || [];
      if (arr.length) {
        out.standings = arr.map(normalizeStandingRow);
        note(`B.LEAGUE 順位表(${s})`, true, `${arr.length}チーム`);
        break;
      }
      note(`B.LEAGUE 順位表(${s})`, false, '0件');
    } catch (e) { note(`B.LEAGUE 順位表(${s})`, false, e.message); }
  }
  if (!out.games.length) out.note = '試合データが取得できませんでした(オフシーズンか、提供元に未反映の可能性があります)';
  return out;
}

async function importJapan(prev) {
  const out = { updatedAt: new Date().toISOString(), teamId: null, games: [],
    manualGames: (prev && prev.manualGames) || [], roster: (prev && prev.roster) || [],
    source: 'TheSportsDB', note: '' };
  let team = null;
  for (const path of ['search_all_teams.php?s=Basketball&c=Japan', 'searchteams.php?t=Japan']) {
    try {
      const j = await tsdb(path);
      team = pickJapanTeam(j && j.teams);
      if (team) break;
    } catch (e) { /* 次の探し方を試す */ }
  }
  if (!team) {
    note('日本代表 チーム検索', false, 'チームが見つかりませんでした');
    out.note = '代表チームが見つからないため自動取得できませんでした。manualGames に手で追加できます';
    return out;
  }
  out.teamId = team.idTeam;
  note('日本代表 チーム検索', true, `${team.strTeam}(id=${team.idTeam})`);

  const map = new Map();
  for (const [label, path] of [['今後', `eventsnext.php?id=${team.idTeam}`], ['直近', `eventslast.php?id=${team.idTeam}`]]) {
    try {
      const j = await tsdb(path);
      const arr = (j && (j.events || j.results)) || [];
      for (const raw of arr) if (raw && raw.idEvent) map.set(raw.idEvent, raw);
      note(`日本代表 ${label}の試合`, arr.length > 0, `${arr.length}件`);
    } catch (e) { note(`日本代表 ${label}の試合`, false, e.message); }
  }
  out.games = Array.from(map.values()).map(r => normalizeTsdbEvent(r, 'j')).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  if (!out.games.length) out.note = '代表戦の日程が取得できませんでした(大会期間外の可能性があります)';
  return out;
}

async function importNbaJapanese() {
  const out = { updatedAt: new Date().toISOString(), players: [], source: 'ESPN', note: '' };
  let teams = [];
  try {
    const j = await get(ESPN + 'teams');
    const groups = (j.sports && j.sports[0] && j.sports[0].leagues && j.sports[0].leagues[0] && j.sports[0].leagues[0].teams) || [];
    teams = groups.map(t => t.team).filter(Boolean);
    note('NBA チーム一覧', teams.length > 0, `${teams.length}チーム`);
  } catch (e) {
    note('NBA チーム一覧', false, e.message);
    out.note = 'チーム一覧が取れませんでした';
    return out;
  }

  const found = [];
  let rosterNg = 0;
  for (const t of teams) {
    try {
      const j = await get(`${ESPN}teams/${t.id}/roster`);
      const athletes = (j.athletes || []).flatMap(a => (a.items ? a.items : [a]));   // 位置別にまとまっている場合がある
      for (const a of athletes) {
        if (!isJapanese(a)) continue;
        found.push({
          id: a.id,
          name: a.fullName || a.displayName,
          team: t.displayName || t.name,
          teamAbbr: t.abbreviation || '',
          pos: (a.position && (a.position.abbreviation || a.position.name)) || '',
          stats: null,
        });
      }
    } catch (e) { rosterNg++; }
    await sleep(250);
  }
  note('NBA ロスター確認', found.length > 0, `日本出身 ${found.length}人${rosterNg ? ` / 取得失敗 ${rosterNg}チーム` : ''}`);

  // 見つかった選手の今季平均成績
  let statNg = 0;
  for (const p of found) {
    for (const url of [`${ESPN_WEB}athletes/${p.id}/stats`, `${ESPN_WEB}athletes/${p.id}`]) {
      try {
        p.stats = extractPlayerStats(await get(url));
        if (p.stats) break;
      } catch (e) { /* 次のURLを試す */ }
    }
    if (!p.stats) statNg++;
    await sleep(250);
  }
  if (found.length) note('NBA 日本人選手の成績', statNg < found.length, statNg ? `${found.length - statNg}/${found.length}人ぶん取得` : '全員ぶん取得');
  out.players = found;
  if (!found.length) out.note = 'NBAに日本出身の登録選手が見つかりませんでした';
  return out;
}

/* ================= 実行 ================= */
async function readJsonOr(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch { return fallback; }
}
async function main() {
  console.log('B.LEAGUE を取り込みます');
  const b = await importBLeague().catch(e => { note('B.LEAGUE', false, e.message); return null; });
  console.log('日本代表を取り込みます');
  const prevJ = await readJsonOr(OUT_JPN, {});
  const j = await importJapan(prevJ).catch(e => { note('日本代表', false, e.message); return null; });
  console.log('NBAの日本人選手を取り込みます');
  const n = await importNbaJapanese().catch(e => { note('NBA日本人選手', false, e.message); return null; });
  console.log('ニュースを取り込みます');
  const conf = await readJsonOr(NEWS_SRC, { feeds: [], keywords: [] });
  const w = await importNews(conf).catch(e => { note('ニュース', false, e.message); return null; });

  // 取れなかったものは前の内容を残す(空で上書きしない)
  const keep = async (path, next) => {
    const prev = await readJsonOr(path, {});
    if (!next) return;
    const merged = { ...prev, ...next };
    if (Array.isArray(next.games) && !next.games.length && Array.isArray(prev.games) && prev.games.length) {
      merged.games = prev.games;
      merged.note = (next.note || '') + '(前回取り込んだ内容を表示しています)';
    }
    if (Array.isArray(next.standings) && !next.standings.length && prev.standings) merged.standings = prev.standings;
    if (Array.isArray(next.players) && !next.players.length && prev.players && prev.players.length) merged.players = prev.players;
    if (Array.isArray(next.items) && !next.items.length && prev.items && prev.items.length) merged.items = prev.items;
    await writeFile(path, JSON.stringify(merged, null, 2) + '\n');
  };
  await keep(OUT_B, b);
  await keep(OUT_JPN, j);
  await keep(OUT_NBA, n);
  await keep(OUT_NEWS, w);

  await writeFile(OUT_REP, JSON.stringify({
    _readme: '直近の自動取り込みの結果。アプリの「設定 → 診断」からも見られます。',
    ranAt: new Date().toISOString(),
    sources: report,
  }, null, 2) + '\n');
  const ng = report.filter(r => !r.ok).length;
  console.log(`\n完了。成功 ${report.length - ng} / 失敗 ${ng}`);
}

// テストから import されたときは実行しない
if (process.argv[1] && process.argv[1].endsWith('import-basket.mjs')) {
  main().catch(e => { console.error('取り込みに失敗しました:', e); process.exit(1); });
}
