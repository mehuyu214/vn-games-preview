// W2 美咲の最長行（b06／b10／b37／b39／b51／b62／b84／b92、13字・82件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_misaki13_first8.js）：
// - 美咲 b06／b10／b37／b39／b51／b62／b84／b92 は13字で美咲の最長行（14字行は0件）。
//   b06 は美咲、元の jump=b299 を後半へ引き継ぎ。face=smile を後半へ継承。「一番の」の後（8字）で分割。
//   b10 は店長、元の jump=b391 を後半へ引き継ぎ。「、」の後（3字）で分割。
//   b37 は美咲、元の jump=b329 を後半へ引き継ぎ。face=sad・char=true を後半へ継承。「。」の後（6字）で分割。
//   b39 は美咲、元の jump=b475 を後半へ引き継ぎ。face=sad を後半へ継承。「。」の後（4字）で分割。
//   b51 は美咲、元の jump=b656 を後半へ引き継ぎ。face=sad を後半へ継承。「、」の後（9字）で分割。
//   b62 は店長、元の jump=b542 を後半へ引き継ぎ。「、」の後（3字）で分割。
//   b84 は悠太、元の jump=b522 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   b92 は悠太、元の jump=b510 を後半へ引き継ぎ。「、」の後（3字）で分割。
// 方式は qa/edit_misaki14_b772_..._b878.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b1048〜b1055（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_misaki13_b06_b10_b37_b39_b51_b62_b84_b92.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b06', 'b1048', 8, '食べるのが一番の', '供養だよ。'],
  ['misaki', 'b10', 'b1049', 3, 'まあ、', 'なんとかなるっしょ。'],
  ['misaki', 'b37', 'b1050', 6, '……あった。', 'まだ、あった。'],
  ['misaki', 'b39', 'b1051', 4, '違うの。', 'ほら、柄のところ。'],
  ['misaki', 'b51', 'b1052', 9, 'あの……あの時の、', 'お礼を、'],
  ['misaki', 'b62', 'b1053', 3, 'まあ、', 'なんとかなるっしょ。'],
  ['misaki', 'b84', 'b1054', 6, '傘と紙袋を、', '渡してくれた。'],
  ['misaki', 'b92', 'b1055', 3, '友人、', 'って言ってましたね。'],
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
console.log('OK: split b06->b1048, b10->b1049, b37->b1050, b39->b1051, b51->b1052, b62->b1053, b84->b1054, b92->b1055');
