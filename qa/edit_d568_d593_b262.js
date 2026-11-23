// W2 優奈の17字最長行（d568／d593）＋美咲の18字最長行（b262）の分割（文面不変・分割のみ）
// 実測（qa/measure_d568_d593_b262.js）：
// - 優奈 d568／d593 は17字で優奈の同率最長行（次点も17字の d604／d619／d625／d655／d721／d741）。
//   d568 は悠太、元の jump=d450 を後半へ引き継ぎ。「。」の後（13字）で分割。
//   d593 は優奈、face=serious・char=true を後半へ継承、元の jump=d213b を後半へ引き継ぎ。「、」の後（7字）で分割。
// - 美咲 b262 は18字で美咲の同率最長行（次点も18字の b285／b298／b299／b320／b336／b337／b390）。
//   b262 は美咲、face=shy・char=true を後半へ継承、元の jump=b565 を後半へ引き継ぎ。「。」の後（13字）で分割。
// 方式は qa/edit_d441_d460_d481_d518_d533_d540_b143_b157_b182_b186_b199_b225_b253.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d883〜d884（優奈）・b811（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d568_d593_b262.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd568', 'd883', 13, 'カウンターの上で止まった。', '……梓。'],
  ['yuna', 'd593', 'd884', 7, '半世紀越しの、', 'お届け物があります。'],
  ['misaki', 'b262', 'b811', 13, '悠太くん。さっきの、続き。', '聞かせて。'],
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
console.log('OK: split d568->d883, d593->d884, b262->b811');
