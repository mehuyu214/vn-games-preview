// W2 凛の30字行 c136／c140／c147／c152／c153／c155／c157／c163 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin30_c136_c140_c147_c152_c153_c155_c157_c163.js）：
// - 凛の最長は30字（30件）、桜の最長は28字、美咲12字、優奈12字、セレナ25字（e14）。
//   c136 は悠太、元の後続は c137。「知ってます。俺も、もう帰る気はないですよ、」（21字）で分割。
//   c140 は凛、元の後続は c141。「小野寺、顔色が悪いわ。」（11字）で分割。
//   c147 は凛、元の後続は c148。「消さなかったの。」（8字）で分割。
//   c152 は悠太、元の後続は c153。「照合担当です。」（7字）で分割。
//   c153 は凛、元の後続は c154。「再実験の記録なら、時刻つきで全部あるわ。」（20字）で分割。
//   c155 は高峰、元の後続は c156。「やあ、騒がしいね今日は。」（12字）で分割。
//   c157 は高峰、元の後続は c158。「凛くん、焦るな。」（8字）で分割。
//   c163 は真壁、元の後続は c164。「助手くん、ちょっといいかな。」（14字）で分割。
// 方式は qa/edit_rin30_c57_c59_c68_c89_c106_c119_c127_c130.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c451〜c458（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin30_c136_c140_c147_c152_c153_c155_c157_c163.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c136', 'c451', 21, '知ってます。俺も、もう帰る気はないですよ、', '凛さん、最後まで。'],
  ['rin', 'c140', 'c452', 11, '小野寺、顔色が悪いわ。', 'あなたは今日、もう帰りなさい、命令よ。'],
  ['rin', 'c147', 'c453', 8, '消さなかったの。', '……あなた、怖い子ね、悠太、本当に、時々ね。'],
  ['rin', 'c152', 'c454', 7, '照合担当です。', '関係、大アリなんですよ、俺には、立派な関係が。'],
  ['rin', 'c153', 'c455', 20, '再実験の記録なら、時刻つきで全部あるわ。', '十分、戦えるはずよ。'],
  ['rin', 'c155', 'c456', 12, 'やあ、騒がしいね今日は。', '照合の件、聞いているよ、事務局から。'],
  ['rin', 'c157', 'c457', 8, '凛くん、焦るな。', 'データは逃げないからね、いつだって、昔から。'],
  ['rin', 'c163', 'c458', 14, '助手くん、ちょっといいかな。', '凛さんの様子はどうだい、最近は。'],
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
console.log('OK: split c136->c451, c140->c452, c147->c453, c152->c454, c153->c455, c155->c456, c157->c457, c163->c458');
