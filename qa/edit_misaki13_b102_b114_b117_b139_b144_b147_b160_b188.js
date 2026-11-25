// W2 美咲の最長行（b102／b114／b117／b139／b144／b147／b160／b188、13字・74件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_misaki13_b102_b114_b117_b139_b144_b147_b160_b188.js）：
// - 美咲 b102／b114／b117／b139／b144／b147／b160／b188 は13字で美咲の最長行（14字行は0件）。
//   b102 は美咲、元の jump=b686 を後半へ引き継ぎ。face=surprise を後半へ継承。「、」の後（5字）で分割。
//   b114 は美咲、元の jump=b576 を後半へ引き継ぎ。face=serious を後半へ継承。「店」の後（6字）で分割。
//   b117 は美咲、元の jump=b735 を後半へ引き継ぎ。face=smile・char=true を後半へ継承。「が」の後（7字）で分割。
//   b139 は店長、元の jump=b580 を後半へ引き継ぎ。「か」の後（7字）で分割。
//   b144 は悠太、元の jump=b634 を後半へ引き継ぎ。「の」の後（7字）で分割。
//   b147 は店長、元の jump=b558 を後半へ引き継ぎ。「て」の後（6字）で分割。
//   b160 は藤井、元の jump=b666 を後半へ引き継ぎ。「　」の後（5字）で分割。
//   b188 は悠太、元の jump=b671 を後半へ引き継ぎ。「な」の後（7字）で分割。
// 方式は qa/edit_misaki13_b06_b10_b37_b39_b51_b62_b84_b92.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b1056〜b1063（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_misaki13_b102_b114_b117_b139_b144_b147_b160_b188.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b102', 'b1056', 5, '……誰に、', '似ているって……'],
  ['misaki', 'b114', 'b1057', 6, '『持ち主来店', 'まで永久保管。'],
  ['misaki', 'b117', 'b1058', 7, 'うん。棚卸しが', '終わったら、'],
  ['misaki', 'b139', 'b1059', 7, 'まあ、なんとか', 'なるっしょ。'],
  ['misaki', 'b144', 'b1060', 7, 'じゃあ雨の日の', 'シフトも……'],
  ['misaki', 'b147', 'b1061', 6, '言うと、待て', 'なくなるだろ。'],
  ['misaki', 'b160', 'b1062', 5, '閉店！？　', 'あたしの縄張りが'],
  ['misaki', 'b188', 'b1063', 7, '（顔向けできな', 'かったのか。'],
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
console.log('OK: split b102->b1056, b114->b1057, b117->b1058, b139->b1059, b144->b1060, b147->b1061, b160->b1062, b188->b1063');
