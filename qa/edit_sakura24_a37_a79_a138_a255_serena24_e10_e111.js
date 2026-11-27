// W2 桜の24字行 a37／a79／a138／a255、セレナの24字行 e10／e111 の分割（文面不変・分割のみ）
// 実測（qa/measure_sakura24_a37_a79_a138_a255_serena24_e10_e111.js、台詞＝name ありのみ）：
// - 桜の台詞の最長は24字（4件：a37・a79・a138・a255）、セレナの最長は24字（2件：e10・e111）。
//   美咲12字、優奈12字、凛の最長は24字（8件：c195・c316・c320・c338・c364・c409・c414・c424）は次回以降。
//   a37 はさくら、jump なし（後続 a38）。「……ありません。」（8字）で分割。
//   a79 は店主、jump なし（後続 a80）。「……昔話はこのへんにして。」（13字）で分割。
//   a138 はさくら、jump なし（後続 a139）。「こ、これは、その……。」（11字）で分割。
//   a255 はさくら、jump なし（後続 a256）。「うん。悠太となら、大丈夫。」（13字）で分割。
//   e10 は悠太、jump なし（後続 e11）。「セレナさんですね。」（9字）で分割。
//   e111 はセレナ、jump なし（後続 e112）。「わたくしの婚約者のふりを、」（13字）で分割。
// 方式は qa/edit_rin25_c188_c302_c321_c325_c342_c416.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード a376〜a379（桜）、e288〜e289（セレナ）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_sakura24_a37_a79_a138_a255_serena24_e10_e111.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['sakura', 'a37', 'a376', 8, '……ありません。', '未現像の古いロールは、ありません'],
  ['sakura', 'a79', 'a377', 13, '……昔話はこのへんにして。', '一杯どうだ、冷えてるぞ'],
  ['sakura', 'a138', 'a378', 11, 'こ、これは、その……。', '……見ちゃったんだ。そっか'],
  ['sakura', 'a255', 'a379', 13, 'うん。悠太となら、大丈夫。', 'ねえ、もっと近くに来て'],
  ['serena', 'e10', 'e288', 9, 'セレナさんですね。', '今日からよろしくお願いします。'],
  ['serena', 'e111', 'e289', 13, 'わたくしの婚約者のふりを、', 'していただけませんか。'],
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
console.log('OK: split a37->a376, a79->a377, a138->a378, a255->a379, e10->e288, e111->e289');
