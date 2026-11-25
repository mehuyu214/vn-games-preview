// W2 美咲の最長行（b612／b614／b630／b641／b657／b659／b664／b682、13字・26件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_misaki13_b612_b614_b630_b641_b657_b659_b664_b682.js）：
// - 美咲 b612／b614／b630／b641／b657／b659／b664／b682 は13字で美咲の最長台詞行（14字行は0件）。
//   13字を超える20件は全て地の文（name=""）のため分割対象外。
//   b612 は美咲、元の jump=b754 を後半へ引き継ぎ。face=cry を後半へ継承。「ん」の後（8字）で分割。
//   b614 は美咲、元の jump=b431 を後半へ引き継ぎ。face=cry を後半へ継承。「、」の後（4字）で分割。
//   b630 は悠太、元の jump=b484 を後半へ引き継ぎ。「で」の後（7字）で分割。
//   b641 は美咲、元の jump=b424 を後半へ引き継ぎ。face=sad を後半へ継承。「人」の後（6字）で分割。
//   b657 は悠太、元の jump=b446 を後半へ引き継ぎ。「く」の後（6字）で分割。
//   b659 は悠太、元の jump=b523 を後半へ引き継ぎ。「ち」の後（6字）で分割。
//   b664 は店長、元の jump=b417 を後半へ引き継ぎ。「っ」の後（6字）で分割。
//   b682 は悠太、元の jump=b244 を後半へ引き継ぎ。「が」の後（8字）で分割。
// 方式は qa/edit_misaki13_b515_b517_b561_b576_b580_b595_b600_b601.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b1104〜b1111（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_misaki13_b612_b614_b630_b641_b657_b659_b664_b682.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b612', 'b1104', 8, 'わたし、お父さん', 'のことで、'],
  ['misaki', 'b614', 'b1105', 4, 'それが、', 'あなたの答えです。'],
  ['misaki', 'b630', 'b1106', 7, 'それで、ここで', '働き始めた。'],
  ['misaki', 'b641', 'b1107', 6, '一緒にいた人', 'なんだと思う。'],
  ['misaki', 'b657', 'b1108', 6, '話がまったく', '見えてこない。'],
  ['misaki', 'b659', 'b1109', 6, 'この店で待ち', '続けてたのか。'],
  ['misaki', 'b664', 'b1110', 6, 'あの人は笑っ', 'て言ったんだ。'],
  ['misaki', 'b682', 'b1111', 8, '美咲さんのことが', '……好きで'],
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
console.log('OK: split b612->b1104, b614->b1105, b630->b1106, b641->b1107, b657->b1108, b659->b1109, b664->b1110, b682->b1111');
