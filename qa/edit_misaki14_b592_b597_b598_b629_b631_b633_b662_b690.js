// W2 美咲の次点最長行（b592／b597／b598／b629／b631／b633／b662／b690、14字・23件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_misaki14_b592_b597_b598_b629_b631_b633_b662_b690.js）：
// - 美咲 b592／b597／b598／b629／b631／b633／b662／b690 は14字で美咲の次点最長行（23件同率の先頭8件）。
//   b592 は悠太、元の jump=b360 を後半へ引き継ぎ。「る」の後（8字）で分割。
//   b597 は悠太、元の jump=b448 を後半へ引き継ぎ。「て」の後（8字）で分割。
//   b598 は美咲、元の jump=b753 を後半へ引き継ぎ。face=serious を後半へ継承。「、」の後（6字）で分割。
//   b629 は悠太、元の jump=b871 を後半へ引き継ぎ。「る」の後（9字）で分割。
//   b631 は藤井、元の jump=b408 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   b633 は美咲、元の jump=b372 を後半へ引き継ぎ。face=surprise を後半へ継承。「、」の後（4字）で分割。
//   b662 は美咲、元の jump=b413 を後半へ引き継ぎ。face=confused・char=true を後半へ継承。「い」の後（8字）で分割。
//   b690 は店長、元の jump=b464 を後半へ引き継ぎ。「は」の後（9字）で分割。
// 方式は qa/edit_misaki14_b545_..._b584.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b1025〜b1032（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_misaki14_b592_b597_b598_b629_b631_b633_b662_b690.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b592', 'b1025', 8, 'もう箸が進んでる', 'んですけど。'],
  ['misaki', 'b597', 'b1026', 8, '俺、何も分かって', 'ないですよ。'],
  ['misaki', 'b598', 'b1027', 6, '傘のことも、', 'あの人のことも、'],
  ['misaki', 'b629', 'b1028', 9, '……俺も共犯にする', '気ですね、'],
  ['misaki', 'b631', 'b1029', 6, '届けるのは、', 'この店の仕事さ。'],
  ['misaki', 'b633', 'b1030', 4, 'あれは、', 'どういう意味ですか。'],
  ['misaki', 'b662', 'b1031', 8, 'ろくなことがない', 'んですよね。'],
  ['misaki', 'b690', 'b1032', 9, '今日は主役の邪魔は', 'しないよ。'],
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
console.log('OK: split b592->b1025, b597->b1026, b598->b1027, b629->b1028, b631->b1029, b633->b1030, b662->b1031, b690->b1032');
