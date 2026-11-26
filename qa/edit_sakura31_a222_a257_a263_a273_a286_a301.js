// W2 桜の残る31字行 a222／a257／a263／a273／a286／a301 の分割（文面不変・分割のみ）
// 実測（qa/measure_sakura31_a222_a257_a263_a273_a286_a301.js）：
// - 桜の台詞の最長は31字（6件：a222・a257・a263・a273・a286・a301）。32字以上は0件。
//   a222 は店主、元の後続は a223。「あの人はな、口の堅い男だった。」（15字）で分割。
//   a257 はさくら、元の後続は a258。「んっ……恥ずかしい、見ないで。」（15字）で分割。
//   a263 はさくら、元の後続は a264。「んあっ……きた、熱いのが、きた……。」（18字）で分割。
//   a273 は悠太、元の後続は a274。「灯里。……いい名前だ。じいちゃんも。」（18字）で分割。
//   a286 は藤堂、元の後続は a287。「先日は、ありがとうございました。」（16字）で分割。
//   a301 は藤堂、元の jump=a36 を後半へ引き継ぎ。「もし保管されていれば、買い取りたい。」（18字）で分割。
// 方式は qa/edit_rin34_sakura31_c273_c276_c279_a12_a89_a171_a199_a216.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード a337〜a342（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_sakura31_a222_a257_a263_a273_a286_a301.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['sakura', 'a222', 'a337', 15, 'あの人はな、口の堅い男だった。', '墓まで持っていくつもりだったんだ'],
  ['sakura', 'a257', 'a338', 15, 'んっ……恥ずかしい、見ないで。', '……ううん、見て。悠太だけは見て'],
  ['sakura', 'a263', 'a339', 18, 'んあっ……きた、熱いのが、きた……。', '……悠太、わたし、幸せだよ'],
  ['sakura', 'a273', 'a340', 18, '灯里。……いい名前だ。じいちゃんも。', 'きっと笑ってる。空の暗室で'],
  ['sakura', 'a286', 'a341', 16, '先日は、ありがとうございました。', 'おかげで、家も静かになりました'],
  ['sakura', 'a301', 'a342', 18, 'もし保管されていれば、買い取りたい。', '金額は、言い値で構いません'],
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
console.log('OK: split a222->a337, a257->a338, a263->a339, a273->a340, a286->a341, a301->a342');
