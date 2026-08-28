// 取り込みロジックの単体テスト。ネットワークを使わないのでどこでも実行できる。
//   node scripts/test-basket-import.mjs
import { seasonLabel, pickBLeague, pickJapanTeam, normalizeTsdbEvent,
  normalizeStandingRow, isJapanese, extractPlayerStats } from './import-basket.mjs';

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

console.log(`\n${pass} 件成功 / ${fail} 件失敗`);
process.exit(fail ? 1 : 0);
