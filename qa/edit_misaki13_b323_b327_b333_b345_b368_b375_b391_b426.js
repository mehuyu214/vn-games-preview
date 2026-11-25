// W2 美咲の最長行（b323／b327／b333／b345／b368／b375／b391／b426、13字・50件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_misaki13_b323_b327_b333_b345_b368_b375_b391_b426.js）：
// - 美咲 b323／b327／b333／b345／b368／b375／b391／b426 は13字で美咲の最長行（14字行は0件）。
//   b323 は美咲、元の jump=b281 を後半へ引き継ぎ。face=sleepy・char=true を後半へ継承。「、」の後（7字）で分割。
//   b327 は悠太、元の jump=b699 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b333 は悠太、元の jump=b50 を後半へ引き継ぎ。「し」の後（7字）で分割。
//   b345 は悠太、元の jump=b164 を後半へ引き継ぎ。「当」の後（7字）で分割。
//   b368 は悠太、元の jump=b101 を後半へ引き継ぎ。「い」の後（8字）で分割。
//   b375 は美咲、元の jump=b174 を後半へ引き継ぎ。face=sad・char=true を後半へ継承。「こ」の後（7字）で分割。
//   b391 は店長、元の jump=b701 を後半へ引き継ぎ。「返」の後（7字）で分割。
//   b426 は悠太、元の jump=b196 を後半へ引き継ぎ。「全」の後（7字）で分割。
// 方式は qa/edit_misaki13_b283_b287_b291_b301_b304_b308_b309_b318.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b1080〜b1087（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_misaki13_b323_b327_b333_b345_b368_b375_b391_b426.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b323', 'b1080', 7, '……幸せって、', 'こういうこと'],
  ['misaki', 'b327', 'b1081', 7, '大丈夫ですか、', '座りますか。'],
  ['misaki', 'b333', 'b1082', 7, '　ずっと保管し', 'てたんですか'],
  ['misaki', 'b345', 'b1083', 7, '残り半分は本当', 'なんですけど'],
  ['misaki', 'b368', 'b1084', 8, 'もったいぶらない', 'でください'],
  ['misaki', 'b375', 'b1085', 7, '五年、開けたこ', 'となかったの'],
  ['misaki', 'b391', 'b1086', 7, '傘は途中で裏返', 'ったけどね。'],
  ['misaki', 'b426', 'b1087', 7, '五年分の埃、全', '部落とします'],
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
console.log('OK: split b323->b1080, b327->b1081, b333->b1082, b345->b1083, b368->b1084, b375->b1085, b391->b1086, b426->b1087');
