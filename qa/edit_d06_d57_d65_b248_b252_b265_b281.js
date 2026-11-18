// W2 優奈の同率最長台詞（d06／d57／d65・37字）＋美咲の同率最長台詞（b248／b252／b265／b281・37字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d06_d57_d65_b248_b252_b265_b281.js）：
// - 優奈 d06／d57／d65 は37字で優奈の同率最長行（d66／d74／d85／d91／d96 も37字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d06 は悠太（地の文）、後続は d07。（は前半に、）は後半へ。省略記号「……」は U+2026×2 を文字インデックスで確認済み。
//   d57 は悠太、後続は d58。「。」の後で分割。d65 は悠太、後続は d66。「。」の後で分割。
// - 美咲 b248／b252／b265／b281 は37字で美咲の同率最長行（次点 b05／b28／b31／b34:36字）。
//   b248 は相沢、後続は b249。「。」の後で分割。b252 は美咲（face=sad・char=true）、後続は b253。「。」の後で分割。
//   b265 は悠太、後続は b266。「。」の後で分割。b281 は悠太、後続は b282。「。」の後で分割。
//   b248／b252／b265 の省略記号「……」は U+2026×2 を文字インデックスで確認済み。
// 方式は qa/edit_d207_d228_d232_d240b_d241_b223_b234.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d443〜d445（優奈）・b356〜b359（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d06_d57_d65_b248_b252_b265_b281.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd06', 'd443', 18, '（三万冊が『簡単』の範囲なのか……。', '司書の物差しは、やっぱり普通じゃない）'],
  ['yuna', 'd57', 'd444', 27, 'じゃあ優奈さんは、廃棄から守ってたんですね、あの本を。', '修理の名目で、ずっと'],
  ['yuna', 'd65', 'd445', 23, '決めるのは、ずっと直してきた人だと思うんです。', '俺は、その決断に付き合います'],
  ['misaki', 'b248', 'b356', 26, 'ええ。また、雨の日に。……きっと、また会いましょう。', '雨は、また降りますから'],
  ['misaki', 'b252', 'b357', 21, '……わたし、五年待って、何も言えなかった。', '目の前にいたのに、声が出なかった'],
  ['misaki', 'b265', 'b358', 20, '終わりに、って。……じゃあ、これからは。', '俺たちは、これからどうなるんですか'],
  ['misaki', 'b281', 'b359', 25, 'おやすみなさい、美咲さん。明日も、隣にいますから。', '明後日も、その先もずっと'],
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
console.log('OK: split d06->d443, d57->d444, d65->d445, b248->b356, b252->b357, b265->b358, b281->b359');
