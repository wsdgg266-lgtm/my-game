// 取り込みロジックの単体テスト。ネットワークを使わないのでどこでも実行できる。
//   node scripts/test-basket-import.mjs
import { seasonLabel, pickBLeague, pickJapanTeam, normalizeTsdbEvent,
  normalizeStandingRow, isJapanese, extractPlayerStats,
  decodeEntities, parseFeed, matchesKeywords, dedupeNews, normalizeTitle,
  pickJapanGames } from './import-basket.mjs';

let pass = 0, fail = 0;
const ok = (label, cond, extra = '') => {
  if (cond) { pass++; console.log('  ✓', label); }
  else { fail++; console.log('  ✗', label, extra); }
};

console.log('--- シーズン表記 ---');
ok('10月は当年からの新シーズン', seasonLabel(new Date('2026-10-05T00:00:00Z')) === '2026-2027', seasonLabel(new Date('2026-10-05T00:00:00Z')));
ok('3月は前年始まりのシーズン', seasonLabel(new Date('2027-03-20T00:00:00Z')) === '2026-2027', seasonLabel(new Date('2027-03-20T00:00:00Z')));
ok('8月は新シーズン扱い', seasonLabel(new Date('2026-08-28T00:00:00Z')) === '2026-2027', seasonLabel(new Date('2026-08-28T00:00:00Z')));

console.log('--- リーグ・チームの選び方 ---');
const leagues = [
  { idLeague:'1', strLeague:'NBA', strSport:'Basketball', strCountry:'United States' },
  { idLeague:'2', strLeague:'Japanese B.League', strSport:'Basketball', strCountry:'Japan' },
  { idLeague:'3', strLeague:'Japanese W League', strSport:'Basketball', strCountry:'Japan' },
  { idLeague:'4', strLeague:'Japanese B.League', strSport:'Soccer', strCountry:'Japan' },
];
ok('B.LEAGUE を選ぶ', pickBLeague(leagues).idLeague === '2', JSON.stringify(pickBLeague(leagues)));
ok('サッカーは選ばない', pickBLeague(leagues).strSport === 'Basketball');
ok('該当なしは null', pickBLeague([{ strLeague:'NBA', strSport:'Basketball' }]) === null);
ok('リーグ一覧が空でも落ちない', pickBLeague(null) === null);

const teams = [
  { idTeam:'10', strTeam:'Japan U19', strSport:'Basketball' },
  { idTeam:'11', strTeam:'Japan', strSport:'Basketball' },
  { idTeam:'12', strTeam:'Japan', strSport:'Soccer' },
];
ok('日本代表(バスケ)を選ぶ', pickJapanTeam(teams).idTeam === '11', JSON.stringify(pickJapanTeam(teams)));
ok('該当なしは null', pickJapanTeam([{ strTeam:'Spain', strSport:'Basketball' }]) === null);

console.log('--- 試合の正規化 ---');
const past = normalizeTsdbEvent({
  idEvent:'100', strTimestamp:'2026-10-04 10:05:00', dateEvent:'2026-10-04', strTime:'10:05:00',
  strHomeTeam:'Ryukyu Golden Kings', strAwayTeam:'Chiba Jets',
  intHomeScore:'82', intAwayScore:'79', strVenue:'沖縄アリーナ',
}, 'b');
ok('IDに接頭辞が付く', past.id === 'b100', past.id);
ok('スコアが数値になる', past.hs === 82 && past.as === 79);
ok('終了扱いになる', past.status === 'post', past.status);
ok('UTC 10:05 が日本時間19:05になる', past.timeJst === '19:05', past.timeJst);
ok('日本時間の日付になる', past.dateJst === '2026-10-04', past.dateJst);

const future = normalizeTsdbEvent({
  idEvent:'101', dateEvent:'2099-01-01', strTime:'00:00:00',
  strHomeTeam:'Alvark Tokyo', strAwayTeam:'Chiba Jets',
}, 'b');
ok('スコア未定は pre', future.status === 'pre', future.status);
ok('時刻不明は timeJst=null', future.timeJst === null, String(future.timeJst));

const oldNoScore = normalizeTsdbEvent({
  idEvent:'102', dateEvent:'2020-01-01', strTime:'10:00:00',
  strHomeTeam:'A', strAwayTeam:'B',
}, 'b');
ok('終わったはずでスコア無しは結果待ち', oldNoScore.status === 'nores', oldNoScore.status);

const ppd = normalizeTsdbEvent({ idEvent:'103', dateEvent:'2099-01-01', strHomeTeam:'A', strAwayTeam:'B', strPostponed:'yes' }, 'b');
ok('延期は ppd', ppd.status === 'ppd', ppd.status);

const cup = normalizeTsdbEvent({ idEvent:'104', dateEvent:'2099-01-01', strHomeTeam:'Japan', strAwayTeam:'China', strLeague:'FIBA World Cup Qualifiers' }, 'j');
ok('大会名をラベルにする', cup.label === 'FIBA World Cup Qualifiers', cup.label);

console.log('--- 順位表の正規化 ---');
const row = normalizeStandingRow({ intRank:'2', strTeam:'Chiba Jets', intWin:'18', intLoss:'6', strGroup:'東地区' }, 0);
ok('勝敗を数値にする', row.w === 18 && row.l === 6);
ok('勝率を計算する', row.pct === '0.750', row.pct);
ok('地区名を引き継ぐ', row.group === '東地区');
ok('順位が無ければ並び順を使う', normalizeStandingRow({ strTeam:'X' }, 4).rank === 5);

console.log('--- NBA日本人選手の判定 ---');
ok('birthPlace.country で判定', isJapanese({ birthPlace:{ country:'Japan' } }));
ok('略称でも判定', isJapanese({ birthPlace:{ countryAbbrev:'JAPAN' } }));
ok('他国は false', isJapanese({ birthPlace:{ country:'United States' } }) === false);
ok('birthPlace 無しでも落ちない', isJapanese({}) === false && isJapanese(null) === false);

console.log('--- 成績の取り出し(形が変わっても拾えるか) ---');
const statsA = extractPlayerStats({ categories: [
  { name:'averages', names:['GP','MIN','PTS','REB','AST','FG%'], stats:['62','28.4','13.8','4.3','1.2','50.1'] },
]});
ok('names/stats の組から取れる', statsA && statsA.ppg === '13.8' && statsA.rpg === '4.3' && statsA.games === '62', JSON.stringify(statsA));
const statsB = extractPlayerStats({ splits:{ categories:[
  { displayNames:['PPG','RPG','APG'], displayStats:['3.4','1.1','2.7'] },
]}});
ok('displayNames/displayStats でも取れる', statsB && statsB.apg === '2.7', JSON.stringify(statsB));
ok('該当なしは null', extractPlayerStats({ foo:'bar' }) === null);
ok('壊れたJSONでも落ちない', extractPlayerStats(null) === null);

console.log('--- 文字参照の復元 ---');
ok('&amp; を戻す', decodeEntities('A&amp;B') === 'A&B', decodeEntities('A&amp;B'));
ok('CDATA を外す', decodeEntities('<![CDATA[八村塁が30得点]]>') === '八村塁が30得点', decodeEntities('<![CDATA[八村塁が30得点]]>'));
ok('数値参照を戻す', decodeEntities('&#12496;&#x30B9;') === 'バス', decodeEntities('&#12496;&#x30B9;'));
ok('null でも落ちない', decodeEntities(null) === '');

console.log('--- RSS / Atom の読み取り ---');
const rss = `<?xml version="1.0"?><rss version="2.0"><channel>
  <title>チャンネル名</title>
  <item><title><![CDATA[Bリーグ開幕、琉球が快勝]]></title>
    <link>https://example.com/a?utm_source=rss</link>
    <pubDate>Fri, 03 Oct 2026 10:00:00 +0900</pubDate></item>
  <item><title>八村塁が今季初の30得点</title>
    <link>https://example.com/b</link>
    <pubDate>Sat, 04 Oct 2026 12:30:00 +0900</pubDate></item>
  <item><title>リンクが無い記事</title><pubDate>Sat, 04 Oct 2026 12:30:00 +0900</pubDate></item>
</channel></rss>`;
const rssItems = parseFeed(rss);
ok('リンクのある記事だけ拾う', rssItems.length === 2, String(rssItems.length));
ok('CDATA入りのタイトル', rssItems[0].title === 'Bリーグ開幕、琉球が快勝', rssItems[0].title);
ok('日時を数値にする', typeof rssItems[0].ts === 'number' && rssItems[0].ts > 0);
ok('チャンネルのtitleを記事にしない', !rssItems.some(i => i.title === 'チャンネル名'));

const atom = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">
  <entry><title>日本代表がW杯予選に勝利</title>
    <link rel="alternate" href="https://example.com/c"/>
    <updated>2026-10-05T09:00:00Z</updated></entry>
</feed>`;
const atomItems = parseFeed(atom);
ok('Atom の href からURLを取る', atomItems.length === 1 && atomItems[0].url === 'https://example.com/c', JSON.stringify(atomItems));
ok('空文字でも落ちない', parseFeed('').length === 0 && parseFeed(null).length === 0);

console.log('--- キーワードの絞り込み ---');
const KW = ['バスケ', 'Bリーグ', 'NBA', '八村'];
ok('該当する見出しは通す', matchesKeywords('八村塁が30得点', KW));
ok('関係ない見出しは落とす', matchesKeywords('サッカー日本代表が勝利', KW) === false);
ok('キーワード未設定なら通さない', matchesKeywords('バスケ', []) === false);

console.log('--- ニュースの重複除去と並び替え ---');
const H = 3600000;
const news = dedupeNews([
  { title:'A', url:'https://example.com/a?utm_source=rss', ts: Date.now() - 5 * H },
  { title:'A', url:'https://example.com/a', ts: Date.now() - 4 * H },
  { title:'B', url:'https://example.com/b', ts: Date.now() - 1 * H },
  { title:'C', url:'https://example.com/c', ts: Date.now() - 90 * 86400000 },
], 10, 30);
ok('新しい順になる', news[0].title === 'B', JSON.stringify(news.map(n => n.title)));
ok('クエリ違いの同じURLは1件にする', news.filter(n => n.title === 'A').length === 1, JSON.stringify(news.map(n => n.title)));
ok('古すぎる記事は落とす', !news.some(n => n.title === 'C'));
ok('件数の上限が効く', dedupeNews([
  { title:'1', url:'https://e.com/1', ts: Date.now() - H }, { title:'2', url:'https://e.com/2', ts: Date.now() - 2 * H },
  { title:'3', url:'https://e.com/3', ts: Date.now() - 3 * H }], 2, 30).length === 2);
ok('日時が無い記事も残す', dedupeNews([{ title:'D', url:'https://e.com/d', ts: null }], 10, 30).length === 1);

console.log('--- 実際の取り込みでわかった不具合(再発防止) ---');
// 2026-08-28の初回実行時、TheSportsDBの応答に strSport が無くて B.LEAGUE を取り逃した
ok('strSport が無いリーグでも選べる',
  pickBLeague([{ idLeague:'9', strLeague:'Japanese B.League' }]).idLeague === '9');
ok('女子リーグ(Wリーグ)は選ばない',
  pickBLeague([{ idLeague:'1', strLeague:'Japan W.League', strSport:'Basketball' },
               { idLeague:'2', strLeague:'Japanese B.League', strSport:'Basketball' }]).idLeague === '2');

// 代表チームが引けないときは、大会リーグの試合から日本の分だけ拾う
const compGames = pickJapanGames([
  { idEvent:'1', strHomeTeam:'Japan', strAwayTeam:'China' },
  { idEvent:'2', strHomeTeam:'Korea', strAwayTeam:'Lebanon' },
  { idEvent:'3', strHomeTeam:'Iran', strAwayTeam:'Japan' },
]);
ok('日本が出ている試合だけ拾う', compGames.length === 2 && compGames.map(g => g.idEvent).join() === '1,3',
  JSON.stringify(compGames.map(g => g.idEvent)));

// ESPNの成績は {name, displayValue} の配列で返ってきていて、取り出せていなかった
const statsC = extractPlayerStats({ splits: { categories: [{ name:'averages', stats: [
  { name:'avgPoints', abbreviation:'PPG', displayValue:'13.8' },
  { name:'avgRebounds', abbreviation:'RPG', displayValue:'4.3' },
  { name:'avgAssists', abbreviation:'APG', displayValue:'1.2' },
  { name:'gamesPlayed', abbreviation:'GP', displayValue:'62' },
]}]}});
ok('{name, displayValue} の配列から取れる',
  statsC && statsC.ppg === '13.8' && statsC.rpg === '4.3' && statsC.games === '62', JSON.stringify(statsC));

// 「日本代表」だけを合図にすると、野球・サッカーの記事まで入ってきていた
const KW2 = ['バスケ', 'Bリーグ', 'NBA', '八村', 'FIBA'];
ok('サッカーの日本代表は拾わない', matchesKeywords('サッカー日本代表 小川航基 FC町田ゼルビアに移籍決定', KW2) === false);
ok('野球の日本代表は拾わない', matchesKeywords('野球 18歳以下の日本代表に横浜高校 織田翔希投手など18人', KW2) === false);
ok('バスケの代表戦は拾う', matchesKeywords('バスケット男子W杯2次予選 日本は八村塁の活躍で快勝', KW2));

// 同じ記事が配信元とYahoo!の両方から入り、二重に並んでいた
ok('末尾の媒体名を外して比べる',
  normalizeTitle('長崎ヴェルカが練習生と選手契約(バスケットボールキング)') === normalizeTitle('長崎ヴェルカが練習生と選手契約'),
  normalizeTitle('長崎ヴェルカが練習生と選手契約(バスケットボールキング)'));
const dup = dedupeNews([
  { title:'横浜BCのマスコットが引継ぎ式', url:'https://basketballking.jp/a', ts: Date.now() - H, source:'バスケットボールキング' },
  { title:'横浜BCのマスコットが引継ぎ式(バスケットボールキング)', url:'https://news.yahoo.co.jp/b', ts: Date.now() - H, source:'Yahoo!' },
], 10, 30);
ok('同じ記事は1件にまとめる', dup.length === 1, JSON.stringify(dup.map(d => d.source)));
ok('配信元のほうを残す', dup[0].source === 'バスケットボールキング', dup[0].source);

console.log(`\n${pass} 件成功 / ${fail} 件失敗`);
process.exit(fail ? 1 : 0);
