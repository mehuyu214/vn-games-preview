// W2 優奈の同率最長台詞（d442／d443／d448／d490／d519・19字）＋美咲の同率最長台詞（b335／b468／b471・21字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d442_d443_d448_d490_d519_b335_b468_b471.js）：
// - 優奈 d442／d443／d448／d490／d519 は19字で優奈の同率最長行（次点も19字の d535／d542／d546）。
//   d442 は悠太、元の jump=d242 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d443 は悠太、元の jump=d07 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d448 は榊、元の jump=d86 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d490 は優奈（face=smile・char=true を後半へ継承）、元の jump=d328 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d519 は榊、元の jump=d345 を後半へ引き継ぎ。「、」の後（13字）で分割。
// - 美咲 b335／b468／b471 は21字で美咲の同率最長行（次点も21字の b472／b476／b483／b491／b498）。
//   b335 は店長、元の jump=b61 を後半へ引き継ぎ。「。」の後（11字）で分割。
//   b468 は相沢、元の jump=b233 を後半へ引き継ぎ。「。」の後（15字）で分割。
//   b471 は美咲（face=love・char=true を後半へ継承）、元の jump=b271 を後半へ引き継ぎ。「、」の後（7字）で分割。
// 方式は qa/edit_d412_d415_d432_b290_b296_b305_b313_b328.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d794〜d798（優奈）・b722〜b724（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d442_d443_d448_d490_d519_b335_b468_b471.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd442', 'd794', 6, 'この瞬間を、', '半世紀待った人たちがいる）'],
  ['yuna', 'd443', 'd795', 8, '司書の物差しは、', 'やっぱり普通じゃない）'],
  ['yuna', 'd448', 'd796', 7, '少しだけでも、', '話を聞いてもらえませんか'],
  ['yuna', 'd490', 'd797', 7, '今日は棚卸し、', 'よろしくお願いしますね。'],
  ['yuna', 'd519', 'd798', 13, '『言えなかったことだけが、', '残る』って。'],
  ['misaki', 'b335', 'b722', 11, '長かったねえ、五年か。', 'おれも年を取るはずだ'],
  ['misaki', 'b468', 'b723', 15, '新しい傘です、今日買いました。', '一番いいのを'],
  ['misaki', 'b471', 'b724', 7, '悠太くんの手、', 'あったかい……ずっと触れてて'],
];

for (const [gid, id, newId, cut, first, second] of SPLITS) {
  const g = GAMES.find(x => x.id === gid);
  const idx = g.scenes.findIndex(n => n.id === id);
  if (idx < 0) throw new Error(`not found: ${id}`);
  const node = g.scenes[idx];
  if (node.text.slice(0, cut) !== first || node.text.slice(cut) !== second) throw new Error(`text mismatch: ${id}`);
  if (node.choices || node.branch) throw new Error(`not a plain node: ${id}`);
  if (g.scenes.some(n => n.id === newId)) throw new Error(`id collision: ${newId}`);
  const origJump = node.jump || null;
  const succ = origJump ? g.scenes.find(n => n.id === origJump) : g.scenes[idx + 1];
  if (!succ) throw new Error(`no successor: ${id}`);
  node.text = first;
  node.jump = newId;
  const secondNode = { id: newId, name: node.name, text: second };
  if (node.face) secondNode.face = node.face;
  if (node.char) secondNode.char = node.char;
  if (node.r18) secondNode.r18 = node.r18;
  secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split d442->d794, d443->d795, d448->d796, d490->d797, d519->d798, b335->b722, b468->b723, b471->b724');
