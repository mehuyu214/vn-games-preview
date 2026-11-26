// W2 凛の32字行 c128／c144／c150／c151／c161／c162／c168／c177 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin32_c128_c144_c150_c151_c161_c162_c168_c177.js）：
// - 凛の台詞の最長は32字（21件：c128・c144・c150・c151・c161・c162・c168・c177・c189・c190・c191・c199・c200・c203・c241・c243・c257・c278・c282・c283・c288）。33字以上は0件。桜の台詞31字以上は0件。
//   c128 は凛、元の後続は c129。「学部生の肩で寝る大学院生……」（14字）で分割。
//   c144 は凛、元の後続は c145。「責任者は私。筋は通すわ。」（12字）で分割。
//   c150 は悠太、元の後続は c151。「訂正文書、俺も一緒に書きましょう、」（17字）で分割。
//   c151 は凛、元の後続は c152。「あなたは関係ないわ。」（10字）で分割。
//   c161 は悠太、元の後続は c162。「真壁先生、話があります。」（12字）で分割。
//   c162 は真壁、元の後続は c163。「助手くんから先手とはね。」（12字）で分割。
//   c168 は凛、元の後続は c169。「提出まであと31分。」（10字）で分割。
//   c177 は真壁、元の後続は c178。「一つだけ聞かせて。」（9字）で分割。
// 方式は qa/edit_rin32_c85_c87_c96_c105_c109_c117_c118_c122.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c367〜c374（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin32_c128_c144_c150_c151_c161_c162_c168_c177.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c128', 'c367', 14, '学部生の肩で寝る大学院生……', '噂になったら、どうするのよ、私たち。'],
  ['rin', 'c144', 'c368', 12, '責任者は私。筋は通すわ。', 'それが研究者の矜持でしょう、違うかしら。'],
  ['rin', 'c150', 'c369', 17, '訂正文書、俺も一緒に書きましょう、', '凛さん、一人じゃなく、二人で。'],
  ['rin', 'c151', 'c370', 10, 'あなたは関係ないわ。', '巻き込むわけにはいかないの、悠太、悪いけど。'],
  ['rin', 'c161', 'c371', 12, '真壁先生、話があります。', 'うちは訂正版を提出します、正直に、全部。'],
  ['rin', 'c162', 'c372', 12, '助手くんから先手とはね。', '……いいよ、その正直さ、嫌いじゃないよ。'],
  ['rin', 'c168', 'c373', 10, '提出まであと31分。', '今日の最終は、これよ、悠太、分かるでしょう。'],
  ['rin', 'c177', 'c374', 9, '一つだけ聞かせて。', '訂正の理由は、何だったのかな、凛さん、正直に。'],
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
console.log('OK: split c128->c367, c144->c368, c150->c369, c151->c370, c161->c371, c162->c372, c168->c373, c177->c374');
