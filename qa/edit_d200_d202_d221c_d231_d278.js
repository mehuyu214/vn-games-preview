// W2 優奈の同率最長台詞（d200／d202／d221c／d231／d278・41字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d200_d202_d221c_d231_d278.js）：
// - 優奈 d200／d202／d221c／d231／d278 は41字で優奈の最長行（次点 d08／d15／d17:40字）。
//   d200 は悠太、d202 は優奈（face=smile）、d221c は園田、d231 は悠太、d278 は優奈（face=sad）。
// 方式は qa/edit_d148_d153_b06_b47_b77_b102_b115_b149_b225.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d388〜d392（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d200_d202_d221c_d231_d278.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd200', 'd388', 23, '（脅威じゃなかった。最初から、同志だったんだ。', '疑ってしまったことを、少し反省した）'],
  ['yuna', 'd202', 'd389', 27, 'はい。毎週、ここに来る方です。窓際の席の、あの方です。', 'もう、ご存じかもしれませんね'],
  ['yuna', 'd221c', 'd390', 26, 'わしも、同じだったのに。言えなかったのは、わしもだ。', 'お互いに、馬鹿同士だったんだな'],
  ['yuna', 'd231', 'd391', 20, '（届いた。半世紀の手紙が、ついに届いた。', '書架の影で、俺は少しだけ泣きそうになった）'],
  ['yuna', 'd278', 'd392', 24, 'あれは、祖母の言葉です。わたしの言葉じゃ、ない。', 'わたしの言葉は、まだ製本中なんです'],
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
console.log('OK: split d200->d388, d202->d389, d221c->d390, d231->d391, d278->d392');
