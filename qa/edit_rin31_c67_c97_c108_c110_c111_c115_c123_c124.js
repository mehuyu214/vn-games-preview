// W2 凛の31字行 c67／c97／c108／c110／c111／c115／c123／c124 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin31_c67_c97_c108_c110_c111_c115_c123_c124.js）：
// - 凛の台詞の最長は31字（40件）。32字以上は0件。桜の最長は29字（9件）、美咲12字、優奈12字、セレナ25字（e14）。
//   c67 は凛、元の後続は c68。「……肝に銘じます、教授。」（12字）で分割。
//   c97 は凛、元の後続は c98。「余計な世話。……でも、ありがとう、」（17字）で分割。
//   c108 は凛、元の後続は c109。「……ふふ、言うようになったわね、悠太。」（19字）で分割。
//   c110 は凛、元の後続は c111。「小野寺。あなた、帰ったはずではなかったの、」（21字）で分割。
//   c111 は小野寺、元の後続は c112。「心配で……お二人のお幸せ……」（14字）で分割。
//   c115 は凛、元の後続は c116。「悠太。あなた、帰ったはずよ。」（14字）で分割。
//   c123 は悠太、元の後続は c124。「結論は変わらない。研究は正しかったんですね、」（22字）で分割。
//   c124 は悠太、元の後続は c125。「凛さん、少し寝てください。」（13字）で分割。
// 方式は qa/edit_sakura30_a288_rin31_c07_c10_c11_c13_c29_c34_c40_c50.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c396〜c403（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin31_c67_c97_c108_c110_c111_c115_c123_c124.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c67', 'c396', 12, '……肝に銘じます、教授。', 'その通りですね、本当に、その通りです。'],
  ['rin', 'c97', 'c397', 17, '余計な世話。……でも、ありがとう、', '助かるわ、悠太、いただくわ。'],
  ['rin', 'c108', 'c398', 19, '……ふふ、言うようになったわね、悠太。', '頼もしいわ、その調子で。'],
  ['rin', 'c110', 'c399', 21, '小野寺。あなた、帰ったはずではなかったの、', '確か、命令したのに。'],
  ['rin', 'c111', 'c400', 14, '心配で……お二人のお幸せ……', 'じゃなくて、ご無事を祈ってまして！'],
  ['rin', 'c115', 'c401', 14, '悠太。あなた、帰ったはずよ。', '何しに来たの、こんな時間に、一体。'],
  ['rin', 'c123', 'c402', 22, '結論は変わらない。研究は正しかったんですね、', '凛さん、やっぱり。'],
  ['rin', 'c124', 'c403', 13, '凛さん、少し寝てください。', '顔色が、本当に悪いですよ、心配です。'],
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
console.log('OK: split c67->c396, c97->c397, c108->c398, c110->c399, c111->c400, c115->c401, c123->c402, c124->c403');
