// W2 凛の32字行 c257／c278／c282／c283／c288 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin32_c257_c278_c282_c283_c288.js）：
// - 凛の台詞の最長は32字（5件：c257・c278・c282・c283・c288）。33字以上は0件。桜の台詞31字以上は0件。
//   c257 は凛、元の後続は c258。「幸せよ。再現性も、きっと高いわ。」（16字）で分割。
//   c278 は凛、元の後続は c279。「あの夜のことは忘れない。」（12字）で分割。
//   c282 は小野寺、元の後続は c283。「私、私、頑張りますから。」（12字）で分割。
//   c283 は高峰、元の後続は c284。「凛くん、向こうでも焦るなよ。」（14字）で分割。
//   c288 は凛、元の後続は c289。「最終電車まであと3分。」（11字）で分割。
// 方式は qa/edit_rin32_c189_c190_c191_c199_c200_c203_c241_c243.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c383〜c387（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin32_c257_c278_c282_c283_c288.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c257', 'c383', 16, '幸せよ。再現性も、きっと高いわ。', '……ふふ、ねえ悠太、ありがとう。'],
  ['rin', 'c278', 'c384', 12, 'あの夜のことは忘れない。', 'でも私たち、全部は話せなかったわ、結局。'],
  ['rin', 'c282', 'c385', 12, '私、私、頑張りますから。', '先輩の分まで、絶対に、研究室を守ります！'],
  ['rin', 'c283', 'c386', 14, '凛くん、向こうでも焦るなよ。', 'データは逃げないからね、いつだって。'],
  ['rin', 'c288', 'c387', 11, '最終電車まであと3分。', '……今日の3分は、短いわね、悠太、本当に。'],
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
console.log('OK: split c257->c383, c278->c384, c282->c385, c283->c386, c288->c387');
