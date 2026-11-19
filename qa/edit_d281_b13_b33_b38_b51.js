// W2 優奈の同率最長台詞（d281・32字）＋美咲の次点最長台詞（b13／b33／b38／b51・34字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d281_b13_b33_b38_b51.js）：
// - 優奈 d281 は32字で優奈の同率最長行（次点は31字多数）。
//   d281 は悠太、後続は d282。2つ目の「。」の後で分割（文末に「。」なし）。
// - 美咲 b13／b33／b38／b51 は34字で美咲の次点最長行（b53／b58／b65／b83 も34字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b13 は店長、後続は b14。2つ目の「。」の後で分割（文末に「。」なし）。
//   b33 は悠太、後続は b34。「。」の後で分割。
//   b38 は悠太、後続は b39。1つ目の「。」の後で分割（文末に「。」なし）。
//   b51 は美咲（face=sad を後半へ継承）、後続は b52。文中に「。」なしのため「……」の後で分割（文末に「。」なし）。
// 方式は qa/edit_d14_d196b_d197_d218_d246_d276_b259_b277_b285_b287.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d523（優奈）・b442〜b445（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d281_b13_b33_b38_b51.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd281', 'd523', 14, '……うん。また明日、来ます。', '修理の続き。言える日まで、隣にいます'],
  ['misaki', 'b13', 'b442', 25, 'おっと、これは失敬。……まあ、なんとかなるっしょ。', '王冠、似合ってたろ'],
  ['misaki', 'b33', 'b443', 24, '（藤井さん、初対面の客にそれを言うのはどうかと。', '記憶力はすごいけど）'],
  ['misaki', 'b38', 'b444', 14, 'それ……ビニール傘、ですか。', 'ずいぶん大事そうに抱えて。落とし物ですか'],
  ['misaki', 'b51', 'b445', 23, 'あの……あの時の、お礼を、ずっと言いたくて……', 'わたし、あの日のことを'],
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
  secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split d281->d523, b13->b442, b33->b443, b38->b444, b51->b445');
