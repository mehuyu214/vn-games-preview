// W2 美咲の最長行（b433／b439／b444／b475／b479／b495／b505／b512、13字・42件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_misaki13_b433_b439_b444_b475_b479_b495_b505_b512.js）：
// - 美咲 b433／b439／b444／b475／b479／b495／b505／b512 は13字で美咲の最長台詞行（14字行は0件）。
//   b433 は悠太、元の jump=b239 を後半へ引き継ぎ。「た」の後（7字）で分割。
//   b439 は美咲、元の jump=b278 を後半へ引き継ぎ。face=love を後半へ継承。「子」の後（7字）で分割。
//   b444 は悠太、元の jump=b750 を後半へ引き継ぎ。「う」の後（8字）で分割。
//   b475 は美咲、元の jump=b751 を後半へ引き継ぎ。face=sad を後半へ継承。「、」の後（7字）で分割。
//   b479 は悠太、元の jump=b679 を後半へ引き継ぎ。「い」の後（6字）で分割。
//   b495 は悠太、元の jump=b786 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   b505 は悠太、元の jump=b731 を後半へ引き継ぎ。「い」の後（7字）で分割。
//   b512 は悠太、元の jump=b826 を後半へ引き継ぎ。「、」の後（7字）で分割。
// 方式は qa/edit_misaki13_b323_b327_b333_b345_b368_b375_b391_b426.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b1088〜b1095（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_misaki13_b433_b439_b444_b475_b479_b495_b505_b512.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b433', 'b1088', 7, 'むしろ拍手した', 'いくらいだ）'],
  ['misaki', 'b439', 'b1089', 7, '悠太くんとの子', 'が、ほしいの'],
  ['misaki', 'b444', 'b1090', 8, 'ずいぶん大事そう', 'に抱えて。'],
  ['misaki', 'b475', 'b1091', 7, '木でできてる、', '重い傘だよ。'],
  ['misaki', 'b479', 'b1092', 6, 'いつもの軽い', 'やつじゃない。'],
  ['misaki', 'b495', 'b1093', 4, '海外で、', '長くなるんですか。'],
  ['misaki', 'b505', 'b1094', 7, '目、逸らさない', 'でください。'],
  ['misaki', 'b512', 'b1095', 7, '二人で見ます、', '逃げません。'],
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
console.log('OK: split b433->b1088, b439->b1089, b444->b1090, b475->b1091, b479->b1092, b495->b1093, b505->b1094, b512->b1095');
