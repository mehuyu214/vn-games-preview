// W2 桜の30字行 a288 と凛の31字行 c07／c10／c11／c13／c29／c34／c40／c50 の分割（文面不変・分割のみ）
// 実測（qa/measure_sakura30_a288.js / qa/measure_rin31_c07_c10_c11_c13_c29_c34_c40_c50.js）：
// - 桜の台詞の最長は30字（1件：a288）。31字以上は0件。29字は9件。
//   a288 は藤堂、元の後続は a289。「分からないままが、穏当なのです。」（16字）で分割。
// - 凛の台詞の最長は31字（48件）。32字以上は0件。美咲の最長は12字、優奈の最長は12字、セレナの最長は25字（e14）。
//   c07 は小野寺、元の後続は c08。「せ、先輩！　コピーのお仕事、」（14字）で分割。
//   c10 は凛、元の後続は c11。「悠太、その図3、生データと一列ずつ照合して。」（22字）で分割。
//   c11 は悠太、元の後続は c12。「はい。……あれ、3列目から値が合わないです、」（22字）で分割。
//   c13 は悠太、元の後続は c14。「（凛さんの手が止まった。」（12字）で分割。
//   c29 は凛、元の後続は c30。「……強情ね、ほんと。」（10字）で分割。
//   c34 は凛、元の後続は c35。「図3は壊れてる。」（8字）で分割。
//   c40 は悠太、元の後続は c41。「高峰先生の、現役最後の研究も終わってしまう……」（23字）で分割。
//   c50 は悠太、元の後続は c51。「俺も手伝います。」（8字）で分割。
// 方式は qa/edit_sakura30_a18_a21_a41_a58_a134_a177_a192_a217.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード a351（桜）、c388〜c395（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_sakura30_a288_rin31_c07_c10_c11_c13_c29_c34_c40_c50.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['sakura', 'a288', 'a351', 16, '分からないままが、穏当なのです。', '知らない幸せも、ありますから'],
  ['rin', 'c07', 'c388', 14, 'せ、先輩！　コピーのお仕事、', '全部終わりましたぁ、見てください！'],
  ['rin', 'c10', 'c389', 22, '悠太、その図3、生データと一列ずつ照合して。', '念入りに頼むわね。'],
  ['rin', 'c11', 'c390', 22, 'はい。……あれ、3列目から値が合わないです、', '凛さん、全部です。'],
  ['rin', 'c13', 'c391', 12, '（凛さんの手が止まった。', 'こんな姿、今まで一度も見たことがない）'],
  ['rin', 'c29', 'c392', 10, '……強情ね、ほんと。', 'サンプルみたいに頑固なんだから、あなたは。'],
  ['rin', 'c34', 'c393', 8, '図3は壊れてる。', '原因は小野寺の貼り間違いよ、先週の締切前のね。'],
  ['rin', 'c40', 'c394', 23, '高峰先生の、現役最後の研究も終わってしまう……', 'それは、まずい。'],
  ['rin', 'c50', 'c395', 8, '俺も手伝います。', '再実験、二人で終わらせましょう、凛さん、必ず。'],
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
console.log('OK: split a288->a351, c07->c388, c10->c389, c11->c390, c13->c391, c29->c392, c34->c393, c40->c394, c50->c395');
