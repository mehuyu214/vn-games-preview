// W2 凛の最長台詞 c194／c209／c215（35字）／c04／c20／c66／c75／c77（34字）の分割（文面不変・分割のみ）
// 実測（qa/measure_rin35_c194_c209_c215.js）：
// - 凛の台詞の最長は35字（3件：c194・c209・c215）。36字以上は0件。34字は16件。
//   c194 は高峰、元の後続は c195。「気づかないふりが、一番の指導だよ。」（17字）で分割。
//   c209 は凛、face=smile・char=true を後半へ継承。元の後続は c210。「最終電車まであと58分。」（12字）で分割。
//   c215 は小野寺、元の後続は c216。「き、緊張でお腹が……」（10字）で分割。
//   c04 は凛、face=serious・char=true を後半へ継承。元の後続は c05。「悠太、そっちの照合は進んでる。」（15字）で分割。
//   c20 は悠太、元の後続は c21。「……消しました。」（8字）で分割。
//   c66 は高峰、元の後続は c67。「データは人を裏切らんよ。」（12字）で分割。
//   c75 は小野寺、元の後続は c76。「違いますよね！　そうですよね、」（15字）で分割。
//   c77 は凛、face=serious・char=true を後半へ継承。元の後続は c78。「最終電車まであと9時間4分。」（14字）で分割。
// 方式は qa/edit_sakura32_rin35_a274_a299_c73_c90_c92_c101_c186_c188.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c300〜c307（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin35_c194_c209_c215_c04_c20_c66_c75_c77.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c194', 'c300', 17, '気づかないふりが、一番の指導だよ。', '君たちは自力で直せた、それが答えだ。'],
  ['rin', 'c209', 'c301', 12, '最終電車まであと58分。', '今日こそ、二人で乗るわよ、悠太、帰りましょう。'],
  ['rin', 'c215', 'c302', 10, 'き、緊張でお腹が……', '先輩、本当に大丈夫ですか、倒れたりしませんか……。'],
  ['rin', 'c04', 'c303', 15, '悠太、そっちの照合は進んでる。', '残りは図3だけのはずよ、違わないわね。'],
  ['rin', 'c20', 'c304', 8, '……消しました。', '本当に、いいんですかこれで、凛さん、後悔しませんか。'],
  ['rin', 'c66', 'c305', 12, 'データは人を裏切らんよ。', '人がデータを裏切るだけだ、覚えておきなさい。'],
  ['rin', 'c75', 'c306', 15, '違いますよね！　そうですよね、', 'きっと気のせいですよね、ね、悠太さん！'],
  ['rin', 'c77', 'c307', 14, '最終電車まであと9時間4分。', '今日も遅くなるわよ、二人とも、覚悟して。'],
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
console.log('OK: split c194->c300, c209->c301, c215->c302, c04->c303, c20->c304, c66->c305, c75->c306, c77->c307');
