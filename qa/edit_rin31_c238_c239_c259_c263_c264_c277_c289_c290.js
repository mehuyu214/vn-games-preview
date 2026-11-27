// W2 凛の31字行 c238／c239／c259／c263／c264／c277／c289／c290 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin31_c238_c239_c259_c263_c264_c277_c289_c290.js）：
// - 凛の台詞の最長は31字（8件）。32字以上は0件。桜の最長は29字（9件）、美咲12字、優奈12字、セレナ25字（e14）。
//   c238 は悠太、元の後続は c239。「（再現した。俺の気持ちが、」（13字）で分割。
//   c239 は凛、元の後続は c240。「助手と先輩は今夜で終わり。」（13字）で分割。
//   c259 は凛、元の後続は c260。「ねえ悠太。これからも、隣にいて。」（16字）で分割。
//   c263 は凛、元の後続は c264。「最終電車まであと……ううん、」（14字）で分割。
//   c264 は悠太、元の後続は c265。「帰る場所、同じですもんね。」（13字）で分割。
//   c277 は悠太、元の後続は c278。「（過去形だ。もう全部、」（11字）で分割。
//   c289 は悠太、元の後続は c290。「凛さん。向こうでも、」（10字）で分割。
//   c290 は凛、元の後続は c291。「あなたも。……ありがとう、悠太。」（16字）で分割。
// 方式は qa/edit_rin31_c220_c221_c222_c224_c226_c232_c236_c237.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c428〜c435（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin31_c238_c239_c259_c263_c264_c277_c289_c290.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c238', 'c428', 13, '（再現した。俺の気持ちが、', '向こうにも確かにあったんだ、やっと）'],
  ['rin', 'c239', 'c429', 13, '助手と先輩は今夜で終わり。', '今夜は、女として見て、悠太、お願い。'],
  ['rin', 'c259', 'c430', 16, 'ねえ悠太。これからも、隣にいて。', 'ずっとよ、約束してちょうだい。'],
  ['rin', 'c263', 'c431', 14, '最終電車まであと……ううん、', 'もう数えなくていいか、私たちには。'],
  ['rin', 'c264', 'c432', 13, '帰る場所、同じですもんね。', '俺たちの家に、二人で帰るんですから。'],
  ['rin', 'c277', 'c433', 11, '（過去形だ。もう全部、', '過去形になってる、俺たちは、終わってる）'],
  ['rin', 'c289', 'c434', 10, '凛さん。向こうでも、', '誤差ゼロでいてください、ずっと、約束です。'],
  ['rin', 'c290', 'c435', 16, 'あなたも。……ありがとう、悠太。', '元気でね、じゃあ、私は行くわ。'],
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
console.log('OK: split c238->c428, c239->c429, c259->c430, c263->c431, c264->c432, c277->c433, c289->c434, c290->c435');
