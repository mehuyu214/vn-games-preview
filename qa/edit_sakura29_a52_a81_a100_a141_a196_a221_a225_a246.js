// W2 桜の29字行 a52／a81／a100／a141／a196／a221／a225／a246 の分割（文面不変・分割のみ）
// 実測（qa/measure_sakura29_a52_a81_a100_a141_a196_a221_a225_a246.js）：
// - 桜の台詞の最長は29字（9件：a52・a81・a100・a141・a196・a221・a225・a246・a283）。凛の最長は30字（45件）、美咲12字、優奈12字、セレナ25字（e14）。
//   a52 はさくら、元の後続は a53。「……昔から、変わらないね悠太は。」（16字）で分割。
//   a81 はさくら、元の後続は a82。「ねえ、個展のメイン写真、迷ってて。」（17字）で分割。
//   a100 はさくら、元の後続は a101。「おじいちゃん、悠太が好きだったな。」（17字）で分割。
//   a141 はさくら、元の jump=a144。「約束なの。おじいちゃんとの。」（14字）で分割。
//   a196 はさくら、元の後続は a197。「うん。でも、もう一人じゃない。」（15字）で分割。
//   a221 は藤堂、元の jump=a306。「……父が、守られていたとは。」（14字）で分割。
//   a225 は藤堂、元の後続は a226。「……皆さんで、決めてください。」（15字）で分割。
//   a246 はさくら、元の jump=a308。「悠太。わたし、嘘つかないから。」（15字）で分割。
// 方式は qa/edit_rin31_c238_c239_c259_c263_c264_c277_c289_c290.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード a352〜a359（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_sakura29_a52_a81_a100_a141_a196_a221_a225_a246.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['sakura', 'a52', 'a352', 16, '……昔から、変わらないね悠太は。', 'ごめん。今は、まだ言えない'],
  ['sakura', 'a81', 'a353', 17, 'ねえ、個展のメイン写真、迷ってて。', '公園の桜か、駅の時計台か'],
  ['sakura', 'a100', 'a354', 17, 'おじいちゃん、悠太が好きだったな。', '『あの子は目がいい』って'],
  ['sakura', 'a141', 'a355', 14, '約束なの。おじいちゃんとの。', '詳しくは、まだ言えない。ごめん'],
  ['sakura', 'a196', 'a356', 15, 'うん。でも、もう一人じゃない。', '悠太が、帰ってきてくれたから'],
  ['sakura', 'a221', 'a357', 14, '……父が、守られていたとは。', '先代は、我が家を脅すどころか。'],
  ['sakura', 'a225', 'a358', 15, '……皆さんで、決めてください。', '私はもう、怯えるのをやめます'],
  ['sakura', 'a246', 'a359', 15, '悠太。わたし、嘘つかないから。', '今から言うのは、全部ほんと。'],
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
console.log('OK: split a52->a352, a81->a353, a100->a354, a141->a355, a196->a356, a221->a357, a225->a358, a246->a359');
