// W2 優奈の16字最長行（d208／d215）＋美咲の18字最長行（b514）の分割（文面不変・分割のみ）
// 実測（qa/measure_d208_d215_b514.js）：
// - 優奈 d208／d215 は16字で優奈の同率最長行（次点も16字の d221b／d247／d337／d349／d359／d369）。
//   d208 は優奈、face=smile・char=true を後半へ継承、元の jump=d209 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d215 は優奈、face=sad・char=true を後半へ継承、元の jump=d408 を後半へ引き継ぎ。「、」の後（5字）で分割。
// - 美咲 b514 は18字で美咲の同率最長行（次点も18字の b519／b522／b571／b642／b647／b673）。
//   b514 は美咲、face=serious を後半へ継承、元の jump=b190 を後半へ引き継ぎ。「、」の後（11字）で分割。
// 方式は qa/edit_d112_d119_d155b_d160_d172_d186_b432_b451_b477_b487_b503_b507_b512.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d899・d900（優奈）・b827（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d208_d215_b514.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd208', 'd899', 8, '……ありがとう、', '悠真さん。本当に'],
  ['yuna', 'd215', 'd900', 5, '半世紀前、', '未返却になった本です。'],
  ['misaki', 'b514', 'b827', 11, 'わたしは、父のことを、', '誰も責めてない'],
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
console.log('OK: split d208->d899, d215->d900, b514->b827');
