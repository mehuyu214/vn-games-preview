// W2 優奈の同率最長台詞（d487／d554・22字）＋美咲の同率最長台詞（b285／b287／b491・25字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d487_d554_b285_b287_b491.js）：
// - 優奈 d487／d554 は22字で優奈の同率最長行（次点は21字の d05／d21／d33／d41／d50／d56）。
//   d487 は園田、元の jump=d221b を後半へ引き継ぎ。「。」の後（8字）で分割。
//   d554 は悠太、元の jump=d380 を後半へ引き継ぎ。「、」の後（14字）で分割。
// - 美咲 b285／b287／b491 は25字で美咲の同率最長行（次点は24字の b11／b14／b28／b29／b33）。
//   b285 は美咲（face=smile を後半へ継承）、元の jump=b440 を後半へ引き継ぎ。「。」の後（18字）で分割。
//   b287 は藤井、元の jump=b441 を後半へ引き継ぎ。「。」の後（13字）で分割。
//   b491 は藤井、元の jump=b167 を後半へ引き継ぎ。「。」の後（21字）で分割。文末に句点なし（原文のまま）。
// 方式は qa/edit_d431_d434_d446_b254_b280_b281.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d693〜d694（優奈）・b619〜b621（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d487_d554_b285_b287_b491.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd487', 'd693', 8, '本当に、馬鹿だ。', 'わしも、同じ馬鹿だったのに。'],
  ['yuna', 'd554', 'd694', 14, '背表紙の壊れた本たちですね、', '任せてください。'],
  ['misaki', 'b285', 'b619', 18, '最初のお客さんは、もう決まってるの。', '内緒だけどね。'],
  ['misaki', 'b287', 'b620', 13, 'あたしは卵焼きの大盛りで。', '常連第一号はあたしだよ。'],
  ['misaki', 'b491', 'b621', 21, '目当ての医者がいるんだとか、本人の口から。', '治療だよ'],
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
console.log('OK: split d487->d693, d554->d694, b285->b619, b287->b620, b491->b621');
