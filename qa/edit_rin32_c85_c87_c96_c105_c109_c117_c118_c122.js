// W2 凛の32字行 c85／c87／c96／c105／c109／c117／c118／c122 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin32_c85_c87_c96_c105_c109_c117_c118_c122.js）：
// - 凛の台詞の最長は32字（29件：c85・c87・c96・c105・c109・c117・c118・c122・c128・c144・c150・c151・c161・c162・c168・c177・c189・c190・c191・c199・c200・c203・c241・c243・c257・c278・c282・c283・c288）。33字以上は0件。桜の台詞31字以上は0件。
//   c85 は小野寺、元の後続は c86。「な、生データ……提、出……ですかぁ……」（19字）で分割。
//   c87 は真壁、元の後続は c88。「楽しみにしているよ。」（10字）で分割。
//   c96 は悠太、元の後続は c97。「凛さん、コーヒー淹れます。」（13字）で分割。
//   c105 は凛、元の後続は c106。「次の検体、用意して。」（10字）で分割。
//   c109 は小野寺、元の後続は c110。「差し入れですぅ！　」（9字）で分割。
//   c117 は凛、元の後続は c118。「正直でよろしい。」（8字）で分割。
//   c118 は悠太、元の後続は c119。「今さらです。」（6字）で分割。
//   c122 は凛、元の後続は c123。「見て、悠太。」（6字）で分割。
// 方式は qa/edit_rin32_c39_c41_c48_c51_c64_c72_c82_c83.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c359〜c366（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin32_c85_c87_c96_c105_c109_c117_c118_c122.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c85', 'c359', 19, 'な、生データ……提、出……ですかぁ……', '本当に、そんな、急に……。'],
  ['rin', 'c87', 'c360', 10, '楽しみにしているよ。', '……じゃあ、本番で会おう、凛さん、助手くん。'],
  ['rin', 'c96', 'c361', 13, '凛さん、コーヒー淹れます。', '砂糖入りで、倒れる前に飲んでください。'],
  ['rin', 'c105', 'c362', 10, '次の検体、用意して。', '誤差は許さないわよ、悠太、頼むわね、本気で。'],
  ['rin', 'c109', 'c363', 9, '差し入れですぅ！　', '夜食のおにぎり、置いていきますね、熱いお茶も！'],
  ['rin', 'c117', 'c364', 8, '正直でよろしい。', 'じゃあ共犯、確定ね、悠太。もう逃げられないわよ。'],
  ['rin', 'c118', 'c365', 6, '今さらです。', '記録係は俺に任せてください、全部、最初から最後まで。'],
  ['rin', 'c122', 'c366', 6, '見て、悠太。', 'ここの値、元通り再現したわ。やっと、ここまで来たの。'],
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
console.log('OK: split c85->c359, c87->c360, c96->c361, c105->c362, c109->c363, c117->c364, c118->c365, c122->c366');
