// W2 凛の29字行 c94／c112／c129／c149／c164／c166／c180／c193 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin29_c94_c112_c129_c149_c164_c166_c180_c193.js）：
// - 凛の最長は29字（20件）、桜の最長は27字（4件：a71・a188・a223・a243）、美咲12字、優奈12字、セレナ25字（e14）。
//   c94 は悠太、元の後続は c95。「（探るつもりが、こっちが探られ」（15字）で分割。
//   c112 は悠太、元の jump は c120。「分かってます。だから余計に、」（14字）で分割。
//   c129 は悠太、元の後続は c130。「噂の心配は、起きてから二人でしましょう。」（20字）で分割。
//   c149 は凛、元の後続は c150。「故意じゃない証拠になるわ。」（13字）で分割。
//   c164 は悠太、元の後続は c165。「発表の仕上げです。いつも通り、」（15字）で分割。
//   c166 は悠太、元の jump は c167。「（今はまだ言えない。言うな、」（14字）で分割。
//   c180 は悠太、元の後続は c181。「（来た。一番痛いところを、」（13字）で分割。
//   c193 は悠太、元の後続は c194。「（やっぱりだ。最初から、」（12字）で分割。
// 方式は qa/edit_rin29_c09_c14_c23_c35_c53_c56_c63_c65.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c489〜c496（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin29_c94_c112_c129_c149_c164_c166_c180_c193.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c94', 'c489', 15, '（探るつもりが、こっちが探られ', 'てる、完全に出し抜かれてる）'],
  ['rin', 'c112', 'c490', 14, '分かってます。だから余計に、', '守りたくなるんです、あの子を。'],
  ['rin', 'c129', 'c491', 20, '噂の心配は、起きてから二人でしましょう。', '今は寝てください。'],
  ['rin', 'c149', 'c492', 13, '故意じゃない証拠になるわ。', '訂正文書に添えましょう、それを。'],
  ['rin', 'c164', 'c493', 15, '発表の仕上げです。いつも通り、', '完璧ですよ、真壁先生、ええ。'],
  ['rin', 'c166', 'c494', 14, '（今はまだ言えない。言うな、', '絶対に言うな、俺、ここは黙れ）'],
  ['rin', 'c180', 'c495', 13, '（来た。一番痛いところを、', '正確に突いてくる人だ、この人は）'],
  ['rin', 'c193', 'c496', 12, '（やっぱりだ。最初から、', '全部知っていたんだ、教授はずっと）'],
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
console.log('OK: split c94->c489, c112->c490, c129->c491, c149->c492, c164->c493, c166->c494, c180->c495, c193->c496');
