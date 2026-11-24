// W2 優奈の15字最長行（d199b／d202）＋美咲の17字最長行（b653／b667）の分割（文面不変・分割のみ）
// 実測（qa/measure_d199b_d202_b653_b667.js）：
// - 優奈 d199b／d202 は15字で優奈の同率最長行（次点も15字の d204／d266／d269／d275c／d330／d336）。
//   d199b は榊、元の jump=d672 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d202 は優奈、元の jump=d560 を後半へ引き継ぎ。「。」の後（3字）で分割。face=smile・char=true を後半へ継承。
// - 美咲 b653／b667 は17字で美咲の同率最長行（次点は16字の b09／b11／b26／b60／b61／b76）。
//   b653 は美咲、元の jump=b535 を後半へ引き継ぎ。「、」の後（9字）で分割。face=serious を後半へ継承。
//   b667 は悠太、元の jump=b346 を後半へ引き継ぎ。「』」の後（9字）で分割。
// 方式は qa/edit_d156b_d159_d176b_d183_d193_d196b_b520_b586_b624_b629_b632_b637.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d947〜d948（優奈）・b874〜b875（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d199b_d202_b653_b667.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd199b', 'd947', 7, '祖母の想いを、', '届けたいんです。'],
  ['yuna', 'd202', 'd948', 3, 'はい。', '毎週、ここに来る方です。'],
  ['misaki', 'b653', 'b874', 9, '……いただく前に、', 'まず供養するね。'],
  ['misaki', 'b667', 'b875', 9, 'だから『最後の雨』', 'なんて言い方を。'],
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
console.log('OK: split d199b->d947, d202->d948, b653->b874, b667->b875');
