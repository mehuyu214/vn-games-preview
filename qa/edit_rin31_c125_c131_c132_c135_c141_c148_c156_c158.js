// W2 凛の31字行 c125／c131／c132／c135／c141／c148／c156／c158 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin31_c125_c131_c132_c135_c141_c148_c156_c158.js）：
// - 凛の台詞の最長は31字（32件）。32字以上は0件。桜の最長は29字（9件）、美咲12字、優奈12字、セレナ25字（e14）。
//   c125 は凛、元の後続は c126。「平気よ、まだ平気。……あと少し」（15字）で分割。
//   c131 は悠太、元の後続は c132。「コーヒーです、熱いやつ。」（12字）で分割。
//   c132 は凛、元の後続は c133。「助かるわ。……ふふ、覚えたわね、助手くん。」（21字）で分割。
//   c135 は凛、元の後続は c136。「最終電車まであと26分。」（12字）で分割。
//   c141 は小野寺、元の後続は c142。「す、すみません……すみません、」（15字）で分割。
//   c148 は悠太、元の後続は c149。「時刻つきです。」（7字）で分割。
//   c156 は凛、元の後続は c157。「教授、ご報告が遅れました。」（13字）で分割。
//   c158 は凛、元の後続は c159。「……はい、教授。」（8字）で分割。
// 方式は qa/edit_rin31_c67_c97_c108_c110_c111_c115_c123_c124.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c404〜c411（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin31_c125_c131_c132_c135_c141_c148_c156_c158.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c125', 'c404', 15, '平気よ、まだ平気。……あと少し', 'だけ、付き合って、悠太、お願い。'],
  ['rin', 'c131', 'c405', 12, 'コーヒーです、熱いやつ。', '凛さん仕様の濃さで淹れました、どうぞ。'],
  ['rin', 'c132', 'c406', 21, '助かるわ。……ふふ、覚えたわね、助手くん。', '合格よ、その濃さは。'],
  ['rin', 'c135', 'c407', 12, '最終電車まであと26分。', '今日も乗らないけどね、私は、最初から。'],
  ['rin', 'c141', 'c408', 15, 'す、すみません……すみません、', '私、私のせいで、きっと私の……。'],
  ['rin', 'c148', 'c409', 7, '時刻つきです。', '貼り間違いの発生時刻まで特定できますよ、これで。'],
  ['rin', 'c156', 'c410', 13, '教授、ご報告が遅れました。', '提出物は私が責任を持って仕上げます。'],
  ['rin', 'c158', 'c411', 8, '……はい、教授。', 'ありがとうございます、その言葉、胸に刻みます。'],
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
console.log('OK: split c125->c404, c131->c405, c132->c406, c135->c407, c141->c408, c148->c409, c156->c410, c158->c411');
