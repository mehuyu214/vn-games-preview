// W2 美咲の最長行（b283／b287／b291／b301／b304／b308／b309／b318、13字・58件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_misaki13_b283_b287_b291_b301_b304_b308_b309_b318.js）：
// - 美咲 b283／b287／b291／b301／b304／b308／b309／b318 は13字で美咲の最長行（14字行は0件）。
//   b283 は美咲、元の jump=b472 を後半へ引き継ぎ。face=smile・char=true を後半へ継承。「く」の後（6字）で分割。
//   b287 は藤井、元の jump=b620 を後半へ引き継ぎ。「き」の後（7字）で分割。
//   b291 は店長、元の jump=b389 を後半へ引き継ぎ。「か」の後（7字）で分割。
//   b301 は美咲、元の jump=b567 を後半へ引き継ぎ。face=sad を後半へ継承。「、」の後（5字）で分割。
//   b304 は店長、元の jump=b150 を後半へ引き継ぎ。「い」の後（7字）で分割。
//   b308 は悠太、元の jump=b649 を後半へ引き継ぎ。「だ」の後（7字）で分割。
//   b309 は悠太、元の jump=b28 を後半へ引き継ぎ。「は」の後（7字）で分割。
//   b318 は藤井、元の jump=b169 を後半へ引き継ぎ。「ら」の後（7字）で分割。
// 方式は qa/edit_misaki13_b229_b232_b240_b254_b262_b270_b275_b281.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b1072〜b1079（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_misaki13_b283_b287_b291_b301_b304_b308_b309_b318.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b283', 'b1072', 6, 'お腹、大きく', 'なってきたね。'],
  ['misaki', 'b287', 'b1073', 7, 'あたしは卵焼き', 'の大盛りで。'],
  ['misaki', 'b291', 'b1074', 7, 'まあ、なんとか', 'なるっしょ。'],
  ['misaki', 'b301', 'b1075', 5, '……まあ、', 'そんなものかな。'],
  ['misaki', 'b304', 'b1076', 7, 'おれのじゃない', 'んだ、本当は'],
  ['misaki', 'b308', 'b1077', 7, 'お客さん、まだ', '話の途中……'],
  ['misaki', 'b309', 'b1078', 7, '本当に、普段は', 'しっかり者で'],
  ['misaki', 'b318', 'b1079', 7, '天気予報とにら', 'めっこだって'],
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
console.log('OK: split b283->b1072, b287->b1073, b291->b1074, b301->b1075, b304->b1076, b308->b1077, b309->b1078, b318->b1079');
