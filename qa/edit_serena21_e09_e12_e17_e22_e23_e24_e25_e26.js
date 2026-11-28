// W2 セレナの21字行の先頭8件（e09・e12・e17・e22・e23・e24・e25・e26）の分割（文面不変・分割のみ）
// 実測（qa/measure_serena21_e09_e12_e17_e22_e23_e24_e25_e26.js、台詞＝name ありのみ）：
// - セレナの台詞の最長は21字（35件：e09・e12・e17・e22・e23・e24・e25・e26・e27・e35・e37・e44・
//   e51・e53・e57・e59・e66・e85・e87・e92・e102・e103・e106・e109・e136・e147・e172・e174・e178・
//   e192・e199・e208・e218・e219・e238・e267・e283）。
//   桜の台詞最長は20字、美咲12字、優奈12字、凛の最長は20字。
//   e09 はセレナ、jump なし（次ノードへ）。「まあ、ようこそいらっ」（10字）で分割。
//   e12 は悠太、jump なし（次ノードへ）。「いえ、それより日本語」（10字）で分割。
//   e17 はベルタ、jump なし（次ノードへ）。「判定、お嬢様はたいそう」（11字）で分割。
//   e22 は悠太、jump なし（次ノードへ）。「慣用句です。まず『猫の」（11字）で分割。
//   e23 はセレナ、jump なし（次ノードへ）。「猫の足も借りたい、ですわね。」（14字）で分割。
//   e24 は悠太、jump なし（次ノードへ）。「手、です。足じゃありませんよ、」（14字）で分割。
//   e25 はセレナ、jump なし（次ノードへ）。「ふふ、そうでしたわ。」（10字）で分割。
//   e26 は悠太、jump なし（次ノードへ）。「（訂正した瞬間、笑った。」（12字）で分割。
// 方式は qa/edit_rin21_c464_c465_c478_sakura21_a111_a185_a227_a307_a309.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード e312〜e319（セレナ）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_serena21_e09_e12_e17_e22_e23_e24_e25_e26.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['serena', 'e09', 'e312', 10, 'まあ、ようこそいらっ', 'しゃいましたわ、先生。'],
  ['serena', 'e12', 'e313', 10, 'いえ、それより日本語', 'がお上手で驚きました。'],
  ['serena', 'e17', 'e314', 11, '判定、お嬢様はたいそう', '緊張しておられます。'],
  ['serena', 'e22', 'e315', 11, '慣用句です。まず『猫の', '手も借りたい』から。'],
  ['serena', 'e23', 'e316', 14, '猫の足も借りたい、ですわね。', '覚えましたわ。'],
  ['serena', 'e24', 'e317', 14, '手、です。足じゃありませんよ', '、セレナさん。'],
  ['serena', 'e25', 'e318', 10, 'ふふ、そうでしたわ。', 'ありがとうございます。'],
  ['serena', 'e26', 'e319', 12, '（訂正した瞬間、笑った。', '今、確かに笑った）'],
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
console.log('OK: split e09->e312, e12->e313, e17->e314, e22->e315, e23->e316, e24->e317, e25->e318, e26->e319');
