// W2 凛の29字行 c253／c256／c260／c267 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin29_c253_c256_c260_c267.js）：
// - 凛の台詞の最長は29字（4件：c253・c256・c260・c267）。これで凛の29字行は残り0件。
//   桜の台詞最長は27字（4件：a71・a188・a223・a243）、美咲12字、優奈12字、セレナ25字（e14）。
//   c253 は凛、元の後続は c254。「わたしも。……ああっ、悠太、悠太ぁ」（17字）で分割。
//   c256 は悠太、元の後続は c257。「距離ゼロ、ですね。……凛さん、」（15字）で分割。
//   c260 は悠太、元の後続は c261。「データが証明するまでもなく、」（14字）で分割。
//   c267 は悠太、元の後続は c268。「聞かせてください。俺たちの、」（14字）で分割。
// 方式は qa/edit_rin29_c201_c202_c206_c210_c225_c227_c245_c247.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c505〜c508（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin29_c253_c256_c260_c267.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c253', 'c505', 17, 'わたしも。……ああっ、悠太、悠太ぁ', '……好き、好きなの……！'],
  ['rin', 'c256', 'c506', 15, '距離ゼロ、ですね。……凛さん、', '幸せですか、今、この瞬間は。'],
  ['rin', 'c260', 'c507', 14, 'データが証明するまでもなく、', '約束します、凛さん、一生です。'],
  ['rin', 'c267', 'c508', 14, '聞かせてください。俺たちの、', '最初の共同研究ですね、これは。'],
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
  const origEnd = !!node.end;
  const succ = origJump ? g.scenes.find(n => n.id === origJump) : g.scenes[idx + 1];
  if (!origEnd && !succ) throw new Error(`no successor: ${id}`);
  node.text = first;
  node.jump = newId;
  if (origEnd) delete node.end;
  const secondNode = { id: newId, name: node.name, text: second };
  if (node.face) secondNode.face = node.face;
  if (node.char) secondNode.char = node.char;
  if (node.r18) secondNode.r18 = node.r18;
  if (origEnd) secondNode.end = true;
  else secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${origEnd ? '(end)' : succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split c253->c505, c256->c506, c260->c507, c267->c508');
