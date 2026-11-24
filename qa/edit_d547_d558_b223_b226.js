// W2 優奈の16字最長行（d547／d558）＋美咲の17字最長行（b223／b226）の分割（文面不変・分割のみ）
// 実測（qa/measure_d547_d558_b223_b226.js）：
// - 優奈 d547／d558 は16字で優奈の同率最長行（次点も16字の d573／d576／d599／d620／d667／d711）。
//   d547 は白鳥、元の jump=d483 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d558 は優奈、元の jump=d420 を後半へ引き継ぎ。「、」の後（6字）で分割。face=smile・char=true を後半へ継承。
// - 美咲 b223／b226 は17字で美咲の同率最長行（次点も17字の b230／b234／b271／b280／b300／b302）。
//   b223 は相沢、元の jump=b611 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   b226 は相沢、元の jump=b613 を後半へ引き継ぎ。「、」の後（7字）で分割。
// 方式は qa/edit_d478_d501_d508_d527_d537_d545_b153_b164_b170_b175_b210_b211.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d923〜d924（優奈）・b850〜b851（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d547_d558_b223_b226.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd547', 'd923', 5, '梓さんは、', '私の前の前の館長です。'],
  ['yuna', 'd558', 'd924', 6, '……これで、', 'この本はもう大丈夫。'],
  ['misaki', 'b223', 'b850', 8, '……柄の中身に、', '気づいたんですね。'],
  ['misaki', 'b226', 'b851', 7, '顔向けできず、', '傘だけでも返そう、と'],
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
console.log('OK: split d547->d923, d558->d924, b223->b850, b226->b851');
