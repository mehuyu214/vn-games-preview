// W2 凛の30字行 c217／c233／c234／c235／c242／c246／c249／c250 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin30_c217_c233_c234_c235_c242_c246_c249_c250.js）：
// - 凛の最長は30字（14件）、桜の最長は28字、美咲12字、優奈12字、セレナ25字（e14）。
//   c217 は凛、元の後続は c218。「大丈夫よ。数値は味方。」（11字）で分割。
//   c233 は悠太、元の後続は c234。「はい、聞きます。」（8字）で分割。
//   c234 は凛、元の後続は c235。「あの夜、消してと言った私を、」（14字）で分割。
//   c235 は悠太、元の後続は c236。「凛さん。俺は、凛さんが好きだからです、」（19字）で分割。
//   c242 は悠太、元の後続は c243。「無理、してませんか。」（10字）で分割。
//   c246 は悠太、元の後続は c247。「凛さん、声は我慢しなくていいんですよ、」（19字）で分割。
//   c249 は凛、元の後続は c250。「悠太、悠太……わたし、初めてなの、」（17字）で分割。
//   c250 は悠太、元の後続は c251。「凛、ゆっくりでいいです。」（12字）で分割。
// 方式は qa/edit_rin30_c169_c174_c181_c192_c196_c204_c205_c211.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c467〜c474（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin30_c217_c233_c234_c235_c242_c246_c249_c250.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c217', 'c467', 11, '大丈夫よ。数値は味方。', '教授、行ってきます、見ててくださいね。'],
  ['rin', 'c233', 'c468', 8, 'はい、聞きます。', '何でも言ってください、凛さん、全部聞きます。'],
  ['rin', 'c234', 'c469', 14, 'あの夜、消してと言った私を、', 'あなたは止めてくれたわ、悠太は。'],
  ['rin', 'c235', 'c470', 19, '凛さん。俺は、凛さんが好きだからです、', 'それだけです、本当に。'],
  ['rin', 'c242', 'c471', 10, '無理、してませんか。', '痛くないですか、凛さん、本当に、大丈夫。'],
  ['rin', 'c246', 'c472', 19, '凛さん、声は我慢しなくていいんですよ、', '今夜は、誰もいません。'],
  ['rin', 'c249', 'c473', 17, '悠太、悠太……わたし、初めてなの、', 'だから、その、優しく……。'],
  ['rin', 'c250', 'c474', 12, '凛、ゆっくりでいいです。', '俺が合わせますから、怖くないですよ。'],
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
console.log('OK: split c217->c467, c233->c468, c234->c469, c235->c470, c242->c471, c246->c472, c249->c473, c250->c474');
