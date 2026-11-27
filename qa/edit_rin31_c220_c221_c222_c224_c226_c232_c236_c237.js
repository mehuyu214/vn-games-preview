// W2 凛の31字行 c220／c221／c222／c224／c226／c232／c236／c237 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin31_c220_c221_c222_c224_c226_c232_c236_c237.js）：
// - 凛の台詞の最長は31字（16件）。32字以上は0件。桜の最長は29字（9件）、美咲12字、優奈12字、セレナ25字（e14）。
//   c220 は真壁、元の後続は c221。「完敗だ。うちも見習わないと。」（14字）で分割。
//   c221 は悠太、元の後続は c222。「真壁先生、ありがとうございました。」（17字）で分割。
//   c222 は小野寺、元の後続は c223。「せ、先輩ぃ……よかったぁ、」（13字）で分割。
//   c224 は凛、元の後続は c225。「本当ですか。……守れた。」（12字）で分割。
//   c226 は凛、元の後続は c227。「悠太、話いい。」（7字）で分割。
//   c232 は凛、元の後続は c233。「悠太、今日の話。」（8字）で分割。
//   c236 は凛、元の後続は c237。「……先に言われた。」（9字）で分割。
//   c237 は凛、元の後続は c238。「私もよ、悠太。私も、あなたが好き。」（17字）で分割。
// 方式は qa/edit_rin31_c170_c173_c176_c178_c183_c184_c185_c187.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c420〜c427（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin31_c220_c221_c222_c224_c226_c232_c236_c237.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c220', 'c420', 14, '完敗だ。うちも見習わないと。', '……お見事だった、凛さん、心から。'],
  ['rin', 'c221', 'c421', 17, '真壁先生、ありがとうございました。', '色々と、本当に、感謝します。'],
  ['rin', 'c222', 'c422', 13, 'せ、先輩ぃ……よかったぁ、', '本当によかったぁ、私、嬉しくて……！'],
  ['rin', 'c224', 'c423', 12, '本当ですか。……守れた。', '全部、守れたんですね、私たち、やっと。'],
  ['rin', 'c226', 'c424', 7, '悠太、話いい。', '今夜、私から言いたいことがあるの、聞いてほしい。'],
  ['rin', 'c232', 'c425', 8, '悠太、今日の話。', 'データの話じゃないの、本当に違うの、今日はね。'],
  ['rin', 'c236', 'c426', 9, '……先に言われた。', '誤差ゼロで言われたわ、悠太に、完璧な精度で。'],
  ['rin', 'c237', 'c427', 17, '私もよ、悠太。私も、あなたが好き。', '大好き、なの、ずっと前から。'],
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
console.log('OK: split c220->c420, c221->c421, c222->c422, c224->c423, c226->c424, c232->c425, c236->c426, c237->c427');
