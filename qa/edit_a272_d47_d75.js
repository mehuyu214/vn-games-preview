// W2 各作品の最長台詞の分割（文面不変・分割のみ）
// 実測（qa/measure_a272_d47.js）：
// - 桜 a272 は60字で桜の最長行（次点 a192:56字）。子の名前「灯里」を告げる
//   クライマックス台詞で、句点の区切りで2ノードに分割する。
// - 優奈 d47 は49字で優奈の最長行（d75 と同率）。悠太の独白めいた観察台詞で
//   句点の区切りで2ノードに分割する。
// - 優奈 d75 は49字で優奈の次点最長行（園田の回想台詞）。同じく分割する。
// 方式は qa/edit_sakura_yuna_longlines.js（a246/d40）と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 新規ノード a299（桜）・d334・d335（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_a272_d47_d75.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

const SPLITS = [
  // [作品ID, 対象ID, 新規ID, 前半テキスト, 後半テキスト]
  ['sakura', 'a272', 'a299',
    '名前、考えたんだ。聞いて？『灯里』。あかり、って読むの。',
    '暗室の灯みたいに、暗い場所でも。誰かを守れる子に、なりますように'],
  ['yuna', 'd47', 'd334',
    '目録に無い本を、数か月も直し続けるんですか。',
    '修理の跡です。新しい糸と、古い糊。何度も手入れされてる'],
  ['yuna', 'd75', 'd335',
    '昔はここで、よく本を読んだもんだ。半世紀近く前かな。',
    '若い頃さ。勧められるままに、詩集なんか読んでね'],
];

for (const [gid, id, newId, first, second] of SPLITS) {
  const g = GAMES.find(x => x.id === gid);
  const idx = g.scenes.findIndex(n => n.id === id);
  if (idx < 0) throw new Error(`not found: ${id}`);
  const node = g.scenes[idx];
  if (node.text !== first + second) throw new Error(`text mismatch: ${id}`);
  if (node.choices || node.branch || node.jump) throw new Error(`not a plain node: ${id}`);
  const succ = g.scenes[idx + 1];
  if (!succ) throw new Error(`no successor: ${id}`);
  if (g.scenes.some(n => n.id === newId)) throw new Error(`id collision: ${newId}`);
  node.text = first;
  node.jump = newId;
  const secondNode = { id: newId, name: node.name, text: second };
  if (node.face) secondNode.face = node.face;
  if (node.char) secondNode.char = node.char;
  secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split a272->a299, d47->d334, d75->d335');
