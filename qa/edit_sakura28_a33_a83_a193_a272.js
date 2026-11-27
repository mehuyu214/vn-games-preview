// W2 桜の28字行 a33／a83／a193／a272 の分割（文面不変・分割のみ）
// 実測（qa/measure_sakura28_a33_a83_a193_a272.js）：
// - 桜の最長は28字（4件）、凛の最長は29字（28件）、美咲12字、優奈12字、セレナ25字（e14）。
//   a33 は藤堂、元の後続は a34。「失礼。藤堂誠一と申します。」（13字）で分割。
//   a83 はさくら、元の後続は a84。「……悠太って、昔からそう。」（13字）で分割。
//   a193 は悠太、元の後続は a194。「（嘘の理由が、これか）。」（12字）で分割。
//   a272 はさくら、元の jump は a299。「名前、考えたんだ。聞いて？」（13字）で分割。
// 方式は qa/edit_rin30_c251_c255_c266_c268_c269_c285.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード a361〜a364（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_sakura28_a33_a83_a193_a272.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['sakura', 'a33', 'a361', 13, '失礼。藤堂誠一と申します。', '古いフィルムのことで、伺いたく'],
  ['sakura', 'a83', 'a362', 13, '……悠太って、昔からそう。', '迷ったら両方、って言うんだよね'],
  ['sakura', 'a193', 'a363', 12, '（嘘の理由が、これか）。', '開けていいのは、俺だけってことか'],
  ['sakura', 'a272', 'a364', 13, '名前、考えたんだ。聞いて？', '『灯里』。あかり、って読むの。'],
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
  const origEnd = !!node.end;
  const succ = origJump ? g.scenes.find(n => n.id === origJump) : g.scenes[idx + 1];
  if (!origEnd && !succ) throw new Error(`no successor: ${id}`);
  node.text = first;
  node.jump = newId;
  if (origEnd) delete node.end;
  const secondNode = { id: newId, name: node.name, text: second };
  if (node.face) secondNode.face = node.face;
  if (node.char) secondNode.char = node.char;
  if (node.r18) secondNode.r18 = node.r18;
  if (origEnd) secondNode.end = true;
  else secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${origEnd ? '(end)' : succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split a33->a361, a83->a362, a193->a363, a272->a364');
