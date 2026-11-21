// W2 優奈の同率最長台詞（d393／d396／d405／d552・21字）＋美咲の同率最長台詞（b269／b289／b303／b308／b329・24字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d393_d396_d405_d552_b269_b289_b303_b308_b329.js）：
// - 優奈 d393／d396／d405／d552 は21字で優奈の同率最長行（次点は20字の d07b／d17／d31／d145b）。
//   d393 は悠太、元の jump=d09 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d396 は優奈（face=sad・char=true を後半へ継承）、元の jump=d36 を後半へ引き継ぎ。「。」の後（6字）で分割。
//   d405 は悠太、元の jump=d170 を後半へ引き継ぎ。「。」の後（4字）で分割。
//   d552 は優奈（face=sad・char=true を後半へ継承）、元の jump=d36 を後半へ引き継ぎ。「、」の後（9字）で分割。
// - 美咲 b269／b289／b303／b308／b329 は24字で美咲の同率最長行（次点は24字の b418／b434）。
//   b269 は悠太、元の jump=b470 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   b289 は悠太、元の jump=b473 を後半へ引き継ぎ。「。」の後（6字）で分割。
//   b303 は悠太、元の jump=b123 を後半へ引き継ぎ。「。」の後（12字）で分割。
//   b308 は悠太、元の jump=b25 を後半へ引き継ぎ。「……」の後（13字）で分割。
//   b329 は美咲（face=sad・char=true を後半へ継承）、元の jump=b38 を後半へ引き継ぎ。「。」の後（15字）で分割。
// 方式は qa/edit_d328_d391_b249_b255_b259.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d719〜d722（優奈）・b646〜b650（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d393_d396_d405_d552_b269_b289_b303_b308_b329.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd393', 'd719', 5, '……いや、', 'うちの館長らしいと言えばらしい）'],
  ['yuna', 'd396', 'd720', 6, '……お願い。', 'わたしからの、一生のお願いです'],
  ['yuna', 'd405', 'd721', 4, 'きっと。', '直った本は、もう言い訳に使えません'],
  ['yuna', 'd552', 'd722', 9, '悠太さんにだけは、', '迷惑をかけたくないんです'],
  ['misaki', 'b269', 'b646', 9, '（五年待った人の、', '初めての『選ぶ』という言葉だ。'],
  ['misaki', 'b289', 'b647', 6, '写真ですね。', '傘と一緒に、海外の雨の街を歩いてる。'],
  ['misaki', 'b303', 'b648', 12, '……引き継ぐ、って何を。', '前の店主から、今の店長へ'],
  ['misaki', 'b308', 'b649', 13, 'お客さん、まだ話の途中……', '行っちゃったよ、本当に'],
  ['misaki', 'b329', 'b650', 15, '……よかった、本当によかった。', '捨てられてなかった'],
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
console.log('OK: split d393->d719, d396->d720, d405->d721, d552->d722, b269->b646, b289->b647, b303->b648, b308->b649, b329->b650');
