// W2 美咲の次点最長行（b696／b724／b758／b759／b765／b767／b769／b771、14字・15件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_misaki14_b696_b724_b758_b759_b765_b767_b769_b771.js）：
// - 美咲 b696／b724／b758／b759／b765／b767／b769／b771 は14字で美咲の次点最長行（15件同率の先頭8件）。
//   b696 は美咲、元の jump=b439 を後半へ引き継ぎ。face=love・r18=true を後半へ継承。「な」の後（7字）で分割。
//   b724 は美咲、元の jump=b271 を後半へ引き継ぎ。face=love・char=true を後半へ継承。「……」の後（7字）で分割。
//   b758 は相沢、元の jump=b478 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   b759 は相沢、元の jump=b294 を後半へ引き継ぎ。「の」の後（7字）で分割。
//   b765 は店長、元の jump=b579 を後半へ引き継ぎ。「て」の後（7字）で分割。
//   b767 は美咲、元の jump=b531 を後半へ引き継ぎ。face=serious・char=true を後半へ継承。「、」の後（4字）で分割。
//   b769 は美咲、元の jump=b462 を後半へ引き継ぎ。face=cry を後半へ継承。「に」の後（6字）で分割。
//   b771 は悠太、元の jump=b515 を後半へ引き継ぎ。「、」の後（6字）で分割。
// 方式は qa/edit_misaki14_b592_..._b690.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b1033〜b1040（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_misaki14_b696_b724_b758_b759_b765_b767_b769_b771.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b696', 'b1033', 7, 'できたらいいな', '……本気だよ。'],
  ['misaki', 'b724', 'b1034', 7, 'あったかい……', 'ずっと触れてて'],
  ['misaki', 'b758', 'b1035', 4, '本当に、', 'まだあったんですね。'],
  ['misaki', 'b759', 'b1036', 7, '私は、あの男の', '……友人です。'],
  ['misaki', 'b765', 'b1037', 7, 'ちょっと聞いて', 'ほしいっしょ。'],
  ['misaki', 'b767', 'b1038', 4, '五年間、', 'そうしてきたんです。'],
  ['misaki', 'b769', 'b1039', 6, '五年前の春に', '亡くなってるの。'],
  ['misaki', 'b771', 'b1040', 6, '雨の日だけ、', '来る人ですから。'],
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
console.log('OK: split b696->b1033, b724->b1034, b758->b1035, b759->b1036, b765->b1037, b767->b1038, b769->b1039, b771->b1040');
