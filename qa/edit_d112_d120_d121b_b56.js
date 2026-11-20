// W2 優奈の同率次点最長台詞（d112／d120／d121b・23字）＋美咲の次点最長台詞（b56・27字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d112_d120_d121b_b56.js）：
// - 優奈 d112／d120／d121b は23字で優奈の同率最長行（d134／d134c／d154／d156／d168 も23字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d112 は優奈（face=confused・char=true を後半へ継承）、元の jump=d471 を後半へ引き継ぎ。「理由は、」の読点の後（16字）で分割。
//   d120 は優奈（face=sad・char=true を後半へ継承）、元の jump=d506 を後半へ引き継ぎ。1つ目の「。」の後（15字）で分割。
//   d121b は白鳥、jump なし（後続は d122 逐次）。2つ目の「。」の後（14字）で分割。
// - 美咲 b56 は27字で美咲の次点最長行（b58／b101／b116／b147／b156／b176／b207 も27字で同率だが本ランは前ラン次回候補の1行のみ対象）。
//   b56 は美咲、元の jump=b399 を後半へ引き継ぎ。1つ目の「。」の後（8字）で分割。
// 方式は qa/edit_d22_d45_d54_d63_d65_b125_b174_b181_b201_b222_b243_b279.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d626〜d628（優奈）・b554（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d112_d120_d121b_b56.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd112', 'd626', 16, '館長、わたしまで呼ばれた理由は、', '何でしょうか。'],
  ['yuna', 'd120', 'd627', 15, 'わたしは、規則を破っています。', 'それは事実です。'],
  ['yuna', 'd121b', 'd628', 14, 'ええ。お茶、もう一杯どうぞ。', '話は、それからです'],
  ['misaki', 'b56', 'b554', 8, '待ってください。', '傘、持って……せめて、お名前だけでも。'],
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
  secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split d112->d626, d120->d627, d121b->d628, b56->b554');
