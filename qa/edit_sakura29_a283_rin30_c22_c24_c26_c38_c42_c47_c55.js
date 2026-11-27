// W2 桜の29字行 a283 と凛の30字行 c22／c24／c26／c38／c42／c47／c55 の分割（文面不変・分割のみ）
// 実測（qa/measure_sakura29_a283_rin30.js）：
// - 桜の台詞の最長は29字（1件：a283）。凛の最長は30字（45件）、美咲12字、優奈12字、セレナ25字（e14）。
//   a283 はミキ、元の後続は a284。「盛況だね。……でもさくら、時々。」（16字）で分割。
//   c22 は凛、元の後続は c23。「今夜のことは誤差範囲よ。」（12字）で分割。
//   c24 は悠太、元の後続は c25。「消す前に、理由を聞かせてください。」（17字）で分割。
//   c26 は悠太、元の後続は c27。「じゃあ消しません。」（9字）で分割。
//   c38 は悠太、元の後続は c39。「一人で、毎晩。」（7字）で分割。
//   c42 は悠太、元の後続は c43。「（守るために嘘をつく人だったのか、」（17字）で分割。
//   c47 は凛、元の後続は c48。「……逃したわね。」（8字）で分割。
//   c55 は凛、元の後続は c56。「正解よ。近づかないのが一番安全。」（16字）で分割。
// 方式は qa/edit_sakura29_a52_a81_a100_a141_a196_a221_a225_a246.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード a360（桜）、c436〜c442（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_sakura29_a283_rin30_c22_c24_c26_c38_c42_c47_c55.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['sakura', 'a283', 'a360', 16, '盛況だね。……でもさくら、時々。', '遠く見てるよね。最近ずっと'],
  ['rin', 'c22', 'c436', 12, '今夜のことは誤差範囲よ。', '忘れてちょうだい、いいわね、約束よ。'],
  ['rin', 'c24', 'c437', 17, '消す前に、理由を聞かせてください。', 'でないと、俺は消せません。'],
  ['rin', 'c26', 'c438', 9, 'じゃあ消しません。', 'アクセスログも、証拠として残しておきます。'],
  ['rin', 'c38', 'c439', 7, '一人で、毎晩。', '発表までに、間に合うんですか、その量で本当に。'],
  ['rin', 'c42', 'c440', 17, '（守るために嘘をつく人だったのか、', 'この人は……知らなかった）'],
  ['rin', 'c47', 'c441', 8, '……逃したわね。', '私の12分、正確だったでしょう、悠太、ふふ。'],
  ['rin', 'c55', 'c442', 16, '正解よ。近づかないのが一番安全。', '賢い選択だわ、悠太、偉いわ。'],
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
console.log('OK: split a283->a360, c22->c436, c24->c437, c26->c438, c38->c439, c42->c440, c47->c441, c55->c442');
