// W2 美咲の最長行（b689／b691／b698／b709／b715／b719／b752／b763、13字・18件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_misaki13_b689_b691_b698_b709_b715_b719_b752_b763.js）：
// - 美咲 b689／b691／b698／b709／b715／b719／b752／b763 は13字で美咲の最長台詞行（14字行は0件）。
//   13字を超える件は全て地の文（name=""）のため分割対象外（前ランと同様）。
//   b689 は悠太、元の jump=b426 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   b691 は悠太、元の jump=b433 を後半へ引き継ぎ。「は」の後（5字）で分割。
//   b698 は悠太、元の jump=b62 を後半へ引き継ぎ。「』」の後（8字）で分割。
//   b709 は美咲、元の jump=b412 を後半へ引き継ぎ。face=smile を後半へ継承。「しか」の後（6字）で分割。
//   b715 は藤井、元の jump=b500 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b719 は相沢、元の jump=b226 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b752 は悠太、元の jump=b295 を後半へ引き継ぎ。「の」の後（6字）で分割。
//   b763 は美咲、元の jump=b337 を後半へ引き継ぎ。face=surprise を後半へ継承。「、」の後（7字）で分割。
// 方式は qa/edit_misaki13_b612_b614_b630_b641_b657_b659_b664_b682.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b1112〜b1119（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_misaki13_b689_b691_b698_b709_b715_b719_b752_b763.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b689', 'b1112', 9, '柄の傷、一つずつ、', '丁寧に。'],
  ['misaki', 'b691', 'b1113', 5, '今日だけは', '文句なしに許す。'],
  ['misaki', 'b698', 'b1114', 8, '『来たんだねえ』', 'って何です'],
  ['misaki', 'b709', 'b1115', 6, '雨の日にしか', '動かないから。'],
  ['misaki', 'b715', 'b1116', 7, '……ごめんね、', 'お嬢ちゃん。'],
  ['misaki', 'b719', 'b1117', 5, '……彼を、', '助けられなかった'],
  ['misaki', 'b752', 'b1118', 6, '今日はなんの', 'お弁当ですか。'],
  ['misaki', 'b763', 'b1119', 7, '『木製柄の傘、', '紙袋同封』。'],
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
console.log('OK: split b689->b1112, b691->b1113, b698->b1114, b709->b1115, b715->b1116, b719->b1117, b752->b1118, b763->b1119');
