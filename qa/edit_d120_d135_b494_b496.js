// W2 優奈の15字最長行（d120／d135）＋美咲の17字最長行（b494／b496）の分割（文面不変・分割のみ）
// 実測（qa/measure_d120_d135_b494_b496.js）：
// - 優奈 d120／d135 は15字で優奈の同率最長行（次点も15字の d156b／d159／d176b／d183／d193／d196b）。
//   d120 は優奈、元の jump=d627 を後半へ引き継ぎ。8字で分割。face=sad・char=true を後半へ継承。
//   d135 は園田、元の jump=d527 を後半へ引き継ぎ。「。」の後（3字）で分割。
// - 美咲 b494／b496 は17字で美咲の同率最長行（次点も17字の b520／b586／b624／b629／b632／b637）。
//   b494 は相沢、元の jump=b220 を後半へ引き継ぎ。「。」の後（14字）で分割。
//   b496 は相沢、元の jump=b236 を後半へ引き継ぎ。「。」の後（11字）で分割。
// 方式は qa/edit_d03_d44_d66_d72_d87_d111_b388_b407_b436_b459_b485_b488.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d939〜d940（優奈）・b866〜b867（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d120_d135_b494_b496.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd120', 'd939', 8, 'わたしは、規則を', '破っています。'],
  ['yuna', 'd135', 'd940', 3, 'ああ。', '梓さん、って言ったかな。'],
  ['misaki', 'b494', 'b866', 14, '……開けても、いいんですか。', '本当に'],
  ['misaki', 'b496', 'b867', 11, '……ね、そうでしょう。', '若いお二人に'],
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
console.log('OK: split d120->d939, d135->d940, b494->b866, b496->b867');
