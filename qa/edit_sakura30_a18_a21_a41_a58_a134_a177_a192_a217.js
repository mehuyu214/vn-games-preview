// W2 桜の30字行 a18／a21／a41／a58／a134／a177／a192／a217 の分割（文面不変・分割のみ）
// 実測（qa/measure_sakura30_a18_a21_a41_a58_a134_a177_a192_a217.js）：
// - 桜の台詞の最長は30字（9件：a18・a21・a41・a58・a134・a177・a192・a217・a288）。31字以上は0件。凛の台詞32字以上は0件。セレナの最長は25字（e14）。
//   a18 はミキ、元の後続は a19。「あたしミキ。さくらの後輩っしょ。」（16字）で分割。
//   a21 は悠太、元の後続は a22。「（コーヒー……だよな、これ）。」（15字）で分割。
//   a41 は藤堂、元の後続は a42。「そうですか。……残念です。」（13字）で分割。
//   a58 はさくら、元の後続は a59。「ねえ悠太、お願いがあるの。」（13字）で分割。
//   a134 は悠太、元の後続は a135。「（あの缶を、移してるのか）。」（14字）で分割。
//   a177 は藤堂、元の jump は a302。「先代が、我が家の不祥事を撮った。」（16字）で分割。
//   a192 はさくら、元の jump は a300。「うん。夏休み、おじいちゃんが撮った。」（18字）で分割。
//   a217 はさくら、元の後続は a218。「藤堂さんは、真逆だと思ってた。」（15字）で分割。
// 方式は qa/edit_rin32_c257_c278_c282_c283_c288.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード a343〜a350（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_sakura30_a18_a21_a41_a58_a134_a177_a192_a217.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['sakura', 'a18', 'a343', 16, 'あたしミキ。さくらの後輩っしょ。', '話には聞いてたよ、夏の男って'],
  ['sakura', 'a21', 'a344', 15, '（コーヒー……だよな、これ）。', '……いただきます。濃い、ですね'],
  ['sakura', 'a41', 'a345', 13, 'そうですか。……残念です。', '名刺を置きます。思い出したら、ぜひ'],
  ['sakura', 'a58', 'a346', 13, 'ねえ悠太、お願いがあるの。', '今度の日曜、わたしの写真展、来て？'],
  ['sakura', 'a134', 'a347', 14, '（あの缶を、移してるのか）。', '（声をかけるか、このまま帰るか）'],
  ['sakura', 'a177', 'a348', 16, '先代が、我が家の不祥事を撮った。', 'そう聞かされて、育ちました。'],
  ['sakura', 'a192', 'a349', 18, 'うん。夏休み、おじいちゃんが撮った。', 'だから、駅で待ってたの。'],
  ['sakura', 'a217', 'a350', 15, '藤堂さんは、真逆だと思ってた。', 'おじいちゃんを、恨んでたんだね'],
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
console.log('OK: split a18->a343, a21->a344, a41->a345, a58->a346, a134->a347, a177->a348, a192->a349, a217->a350');
