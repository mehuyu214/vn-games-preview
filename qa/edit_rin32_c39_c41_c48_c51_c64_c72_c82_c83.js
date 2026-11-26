// W2 凛の32字行 c39／c41／c48／c51／c64／c72／c82／c83 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin32_c39_c41_c48_c51_c64_c72_c82_c83.js）：
// - 凛の台詞の最長は32字（37件：c39・c41・c48・c51・c64・c72・c82・c83・c85・c87・c96・c105・c109・c117・c118・c122・c128・c144・c150・c151・c161・c162・c168・c177・c189・c190・c191・c199・c200・c203・c241・c243・c257・c278・c282・c283・c288）。33字以上は0件。桜の台詞31字以上は0件。
//   c39 は凛、元の後続は c40。「間に合わせるしかない。」（11字）で分割。
//   c41 は凛、元の後続は c42。「だから消してほしかった。」（12字）で分割。
//   c48 は悠太、元の後続は c49。「正確すぎますよ。……」（10字）で分割。
//   c51 は凛、元の後続は c52。「悠太、これは共犯よ。」（10字）で分割。
//   c64 は凛、元の後続は c65。「教授、お帰りなさい。」（10字）で分割。
//   c72 は悠太、元の後続は c73。「ど、どうしたんですか急に。」（13字）で分割。
//   c82 は真壁、元の後続は c83。「失礼するよ。高峰研、」（10字）で分割。
//   c83 は凛、元の後続は c84。「真壁先生。何かご用でしょうか、」（15字）で分割。
// 方式は qa/edit_rin32_c05_c08_c12_c15_c21_c27_c31_c37.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c351〜c358（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin32_c39_c41_c48_c51_c64_c72_c82_c83.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c39', 'c351', 11, '間に合わせるしかない。', 'バレれば助成金は打ち切り、研究室は解散よ。'],
  ['rin', 'c41', 'c352', 12, 'だから消してほしかった。', '守る方法が、それしか思いつかなかったの。'],
  ['rin', 'c48', 'c353', 10, '正確すぎますよ。……', '凛さん、俺に決めさせてください、今夜のこと。'],
  ['rin', 'c51', 'c354', 10, '悠太、これは共犯よ。', '巻き込まれるわよ、本当にいいの、後悔しない。'],
  ['rin', 'c64', 'c355', 10, '教授、お帰りなさい。', '発表資料は順調に進んでいますから、ご安心を。'],
  ['rin', 'c72', 'c356', 13, 'ど、どうしたんですか急に。', '心当たりでもあるんですか、小野寺さん。'],
  ['rin', 'c82', 'c357', 10, '失礼するよ。高峰研、', '発表資料は順調そうだね、凛さん、見たところ。'],
  ['rin', 'c83', 'c358', 15, '真壁先生。何かご用でしょうか、', 'うちの研究室に、わざわざお越しで。'],
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
console.log('OK: split c39->c351, c41->c352, c48->c353, c51->c354, c64->c355, c72->c356, c82->c357, c83->c358');
