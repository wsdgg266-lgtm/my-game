// 取り込みロジックの単体テスト。ネットワークを使わないのでどこでも実行できる。
//   node scripts/test-import.mjs
import { parseCsv, mapColumns, guessGenres, normDate, toEvent, decodeCsv }
  from './import-events.mjs';
import { fingerprint } from './watch-venues.mjs';

const CITIES = ['京丹後市','宮津市','与謝野町','伊根町','舞鶴市','綾部市','福知山市',
  '南丹市','京丹波町','亀岡市','豊岡市','養父市','朝来市','香美町','新温泉町','丹波市','丹波篠山市'];

let pass = 0, fail = 0;
const ok = (label, cond, extra='') => {
  if (cond) { pass++; console.log('  ✓', label); }
  else { fail++; console.log('  ✗', label, extra); }
};

console.log('--- CSV パーサ ---');
const csv = `都道府県名,市区町村名,イベント名,開始日時,終了日時,開催場所,住所,説明,料金,URL
京都府,福知山市,"秋の音楽祭、夜の部",2026-10-12 18:30,2026-10-12 21:00,市民ホール,京都府福知山市1-1,"クラシックの""夕べ""
2日間開催",1500円,https://example.com/a
兵庫県,豊岡市,こども自然体験教室,2026/9/5,,自然の家,兵庫県豊岡市2-2,親子で参加,無料,
兵庫県,神戸市,対象外イベント,2026-09-09,,どこか,兵庫県神戸市,,,`;
const rows = parseCsv(csv);
ok('行数(ヘッダ+3行)', rows.length === 4, rows.length);
ok('引用符内のカンマを1フィールドに', rows[1][2] === '秋の音楽祭、夜の部', rows[1][2]);
ok('引用符内の改行を保持', rows[1][7].includes('\n'), JSON.stringify(rows[1][7]));
ok('二重引用符のエスケープ', rows[1][7].includes('"夕べ"'), rows[1][7]);

console.log('--- 列の対応づけ ---');
const idx = mapColumns(rows[0]);
ok('イベント名', idx.title === 2, idx.title);
ok('開始日時', idx.start === 3, idx.start);
ok('開催場所', idx.venue === 5, idx.venue);
ok('URL(全角・大小文字ゆれ)', mapColumns(['ｕｒｌ']).url === 0);
ok('別名(行事名/開催日)', (() => { const m = mapColumns(['行事名','開催日']); return m.title===0 && m.start===1; })());

console.log('--- 日付の正規化 ---');
ok('ハイフン+時刻', normDate('2026-10-12 18:30') === '2026-10-12T18:30', normDate('2026-10-12 18:30'));
ok('スラッシュ・1桁', normDate('2026/9/5') === '2026-09-05', normDate('2026/9/5'));
ok('和暦', normDate('令和8年9月12日') === '2026-09-12', normDate('令和8年9月12日'));
ok('全角コロン時刻', normDate('2026年10月1日 9：05') === '2026-10-01T09:05', normDate('2026年10月1日 9：05'));
ok('空欄は null', normDate('') === null && normDate(undefined) === null);
ok('解釈できない値は null', normDate('未定') === null, normDate('未定'));

console.log('--- ジャンル推定 ---');
ok('音楽', guessGenres('秋の音楽祭 クラシックコンサート').includes('music'));
ok('子ども+体験', (() => { const g = guessGenres('こども自然体験教室'); return g.includes('kids') && g.includes('exp'); })(), guessGenres('こども自然体験教室'));
ok('祭り', guessGenres('灯籠まつり').includes('matsuri'));
ok('該当なしでも空にしない', guessGenres('よくわからない催し').length > 0);

console.log('--- 行 → イベント ---');
const e1 = toEvent(rows[1], idx, CITIES, 'テスト');
ok('タイトル', e1 && e1.title === '秋の音楽祭、夜の部');
ok('市町を住所から特定', e1 && e1.city === '福知山市', e1 && e1.city);
ok('開始日時', e1 && e1.start === '2026-10-12T18:30', e1 && e1.start);
ok('URL', e1 && e1.url === 'https://example.com/a');
ok('source が auto:', e1 && e1.source === 'auto:テスト');
ok('id が生成される', e1 && e1.id.length > 0, e1 && e1.id);
const e2 = toEvent(rows[2], idx, CITIES, 'テスト');
ok('終了日が空でも通る', e2 && e2.end === null);
ok('URLが空なら空文字', e2 && e2.url === '');
ok('北近畿の外(神戸市)は除外', toEvent(rows[3], idx, CITIES, 'テスト') === null);
ok('篠山市表記を丹波篠山市に寄せる', (() => {
  const r = parseCsv('イベント名,開始日時,住所\nテスト,2026-10-01,兵庫県篠山市1');
  return toEvent(r[1], mapColumns(r[0]), CITIES, 't').city === '丹波篠山市';
})());

console.log('--- 文字コード ---');
// "イベント名,開始日時" を Shift_JIS で符号化したバイト列
const sjis = Buffer.from(new Uint8Array([
  0x83,0x43,0x83,0x78,0x83,0x93,0x83,0x67,0x96,0xbc,   // イベント名
  0x2c,                                                 // ,
  0x8a,0x4a,0x8e,0x6e,0x93,0xfa,0x8e,0x9e,             // 開始日時
]));
ok('Shift_JIS を読み直す', decodeCsv(sjis) === 'イベント名,開始日時', JSON.stringify(decodeCsv(sjis)));
ok('UTF-8 はそのまま', decodeCsv(Buffer.from('イベント名,開始日時', 'utf-8')) === 'イベント名,開始日時');
ok('Shift_JISのCSVを行に分解できる', (() => {
  const rows = parseCsv(decodeCsv(sjis));
  return rows[0][0] === 'イベント名' && rows[0][1] === '開始日時';
})());

console.log('--- 会場ウォッチの指紋 ---');
const page = t => `<!doctype html><html><head><style>.a{color:red}</style>
<script>var x=1;</script></head><body><!-- コメント -->
<h1>チケット発売情報</h1><ul>${t}</ul>
<p>このページの更新日時: 2026-08-20 10:33:21</p></body></html>`;

const base = fingerprint(page('<li>吉本新喜劇 10/3</li>'));
ok('タグ・script・styleを落とす', !/[<>]|color:red|var x/.test(base), base.slice(0, 80));
ok('本文は残る', base.includes('吉本新喜劇') && base.includes('チケット発売情報'), base.slice(0, 80));
ok('HTMLコメントを落とす', !base.includes('コメント'), base);
ok('同じ内容なら同じ指紋', fingerprint(page('<li>吉本新喜劇 10/3</li>')) === base);
ok('公演が増えたら指紋が変わる',
   fingerprint(page('<li>吉本新喜劇 10/3</li><li>新公演 12/1</li>')) !== base);
ok('更新日時だけの違いは無視する', (() => {
  const a = fingerprint(page('<li>吉本新喜劇 10/3</li>'));
  const b = fingerprint(page('<li>吉本新喜劇 10/3</li>').replace('2026-08-20 10:33:21', '2026-08-21 04:00:05'));
  return a === b;
})(), '時計表示で誤検知する');
ok('空白の揺れは無視する',
   fingerprint('<p>あ   い\n\nう</p>') === fingerprint('<p>あ い う</p>'));

console.log(`\n結果: ${pass} 件成功 / ${fail} 件失敗`);
process.exit(fail ? 1 : 0);
