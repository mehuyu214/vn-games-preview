// W2 凛の32字行 c189／c190／c191／c199／c200／c203／c241／c243 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin32_c189_c190_c191_c199_c200_c203_c241_c243.js）：
// - 凛の台詞の最長は32字（13件：c189・c190・c191・c199・c200・c203・c241・c243・c257・c278・c282・c283・c288）。33字以上は0件。桜の台詞31字以上は0件。
//   c189 は真壁、元の後続は c190。「参ったな。隠せば終わりだったのに、」（17字）で分割。
//   c190 は高峰、元の後続は c191。「凛くん、小野寺くん。よく言った。」（16字）で分割。
//   c191 は凛、元の後続は c192。「教授……もしかして、」（10字）で分割。
//   c199 は凛、元の後続は c200。「悠太、あなたは関係……ないはず、」（16字）で分割。
//   c200 は真壁、元の後続は c201。「助手くんまで頭を下げるか。」（13字）で分割。
//   c203 は悠太、元の後続は c204。「再実験の手順を補足します。」（13字）で分割。
//   c241 は凛、元の後続は c242。「んっ……悠太、近い……顔が熱い……」（17字）で分割。
//   c243 は凛、元の後続は c244。「してないわ。……もっと、こっちに来て、」（19字）で分割。
// 方式は qa/edit_rin32_c128_c144_c150_c151_c161_c162_c168_c177.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c375〜c382（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin32_c189_c190_c191_c199_c200_c203_c241_c243.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c189', 'c375', 17, '参ったな。隠せば終わりだったのに、', 'しないんだ、君たちは、正直に。'],
  ['rin', 'c190', 'c376', 16, '凛くん、小野寺くん。よく言った。', 'よく直した、立派だよ、二人とも。'],
  ['rin', 'c191', 'c377', 10, '教授……もしかして、', '最初から知っていたんですか、全部を、ずっと。'],
  ['rin', 'c199', 'c378', 16, '悠太、あなたは関係……ないはず、', 'なのに、どうして、そこまで……。'],
  ['rin', 'c200', 'c379', 13, '助手くんまで頭を下げるか。', '……いい研究室だ、本当に、羨ましいよ。'],
  ['rin', 'c203', 'c380', 13, '再実験の手順を補足します。', '全工程、私が記録しましたから、正確に。'],
  ['rin', 'c241', 'c381', 17, 'んっ……悠太、近い……顔が熱い……', '心臓が、うるさいの、聞こえる。'],
  ['rin', 'c243', 'c382', 19, 'してないわ。……もっと、こっちに来て、', '悠太、お願い、離れないで。'],
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
console.log('OK: split c189->c375, c190->c376, c191->c377, c199->c378, c200->c379, c203->c380, c241->c381, c243->c382');
