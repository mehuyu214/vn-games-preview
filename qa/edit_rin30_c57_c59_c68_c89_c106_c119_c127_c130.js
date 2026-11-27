// W2 凛の30字行 c57／c59／c68／c89／c106／c119／c127／c130 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin30_c57_c59_c68_c89_c106_c119_c127_c130.js）：
// - 凛の最長は30字（38件）、桜の最長は28字、美咲12字、優奈12字、セレナ25字（e14）。
//   c57 は凛、元の後続は c58。「気のせいよ。データの見すぎで、」（15字）で分割。
//   c59 は悠太、元の後続は c60。「（教授の字……？　これ、」（12字）で分割。
//   c68 は高峰、元の後続は c69。「じゃ、私は昼寝……じゃなくて会議だった、」（20字）で分割。
//   c89 は悠太、元の後続は c90。「凛さん。真壁先生、どこまで」（13字）で分割。
//   c106 は悠太、元の後続は c107。「はい。記録、元データと完全に一致しました」（20字）で分割。
//   c119 は悠太、元の jump=c120。「（帰らなくて正解だった。」（12字）で分割。
//   c127 は悠太、元の後続は c128。「30分だけ仮眠を。」（9字）で分割。
//   c130 は凛、元の後続は c131。「……じゃあ30分だけ。」（11字）で分割。
// 方式は qa/edit_sakura29_a283_rin30_c22_c24_c26_c38_c42_c47_c55.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c443〜c450（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin30_c57_c59_c68_c89_c106_c119_c127_c130.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c57', 'c443', 15, '気のせいよ。データの見すぎで、', '目が疲れているだけ、ほんとに。'],
  ['rin', 'c59', 'c444', 12, '（教授の字……？　これ、', 'いつの書き込みなんだ、一体いつから）'],
  ['rin', 'c68', 'c445', 20, 'じゃ、私は昼寝……じゃなくて会議だった、', 'ははは、忘れてたよ。'],
  ['rin', 'c89', 'c446', 13, '凛さん。真壁先生、どこまで', '知ってるんでしょう、うちの事情を。'],
  ['rin', 'c106', 'c447', 20, 'はい。記録、元データと完全に一致しました', '、今のも寸分違わず。'],
  ['rin', 'c119', 'c448', 12, '（帰らなくて正解だった。', 'それだけは確かだ、うん、間違いない）'],
  ['rin', 'c127', 'c449', 9, '30分だけ仮眠を。', '肩、貸しますから、凛さん、遠慮なくどうぞ。'],
  ['rin', 'c130', 'c450', 11, '……じゃあ30分だけ。', '誤差なく起こしてね、悠太、頼んだわよ。'],
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
console.log('OK: split c57->c443, c59->c444, c68->c445, c89->c446, c106->c447, c119->c448, c127->c449, c130->c450');
