// W2 桜の最長台詞 a274／a299（32字）／凛の最長台詞 c73／c90／c92／c101／c186／c188（35字）の分割（文面不変・分割のみ）
// 実測（qa/measure_sakura32_rin35_a274_a299.js）：
// - 桜の台詞の最長は32字（a274・a299 の2件）。33字以上は0件。
//   a274 は桜、face=laugh・char=true を後半へ継承。元の後続は a275。「うん。ねえ、フィルムみたいだね。」（16字）で分割。
//   a299 は桜、face=smile・char=true を後半へ継承。元の jump=a273 を後半へ引き継ぎ。「暗室の灯みたいに、暗い場所でも。」（16字）で分割。
// - 凛の台詞の最長は35字（9件：c73・c90・c92・c101・c186・c188・c194・c209・c215）。36字以上は0件。
//   c73 は小野寺、元の後続は c74。「先輩、最近ずっと夜遅くて。私のせいな気がして、」（23字）で分割。
//   c90 は凛、face=serious・char=true を後半へ継承。元の後続は c91。「知らないわ。知っていても同じこと。」（17字）で分割。
//   c92 は悠太、元の後続は c93。「真壁先生、一つだけ聞かせてください。」（18字）で分割。
//   c101 は小野寺、元の後続は c102。「で、でも……はいぃ……すみません……」（18字）で分割。
//   c186 は凛、face=serious・char=true を後半へ継承。元の後続は c187。「真壁先生、教授。これが全てです。」（16字）で分割。
//   c188 は凛、face=serious・char=true を後半へ継承。元の後続は c189。「誤差ゼロです。数値が、私たちの正直さを証明します、」（25字）で分割。
// 方式は qa/edit_sakura33_a55_a215_a261_a04_a98_a164_a170_a183.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード a330・a331（桜）、c294〜c299（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_sakura32_rin35_a274_a299_c73_c90_c92_c101_c186_c188.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['sakura', 'a274', 'a330', 16, 'うん。ねえ、フィルムみたいだね。', '時間を置くほど、幸せが濃くなるの'],
  ['sakura', 'a299', 'a331', 16, '暗室の灯みたいに、暗い場所でも。', '誰かを守れる子に、なりますように'],
  ['rin', 'c73', 'c294', 23, '先輩、最近ずっと夜遅くて。私のせいな気がして、', '眠れなくて、ずっと……。'],
  ['rin', 'c90', 'c295', 17, '知らないわ。知っていても同じこと。', '再実験を終わらせるだけよ、私たちは。'],
  ['rin', 'c92', 'c296', 18, '真壁先生、一つだけ聞かせてください。', 'その照合、全研究室一斉なんですか。'],
  ['rin', 'c101', 'c297', 18, 'で、でも……はいぃ……すみません……', '行きます……お先に失礼します……。'],
  ['rin', 'c186', 'c298', 16, '真壁先生、教授。これが全てです。', '再実験の全記録を、どうぞ見てください。'],
  ['rin', 'c188', 'c299', 25, '誤差ゼロです。数値が、私たちの正直さを証明します、', '必ず、見てください。'],
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
console.log('OK: split a274->a330, a299->a331, c73->c294, c90->c295, c92->c296, c101->c297, c186->c298, c188->c299');
