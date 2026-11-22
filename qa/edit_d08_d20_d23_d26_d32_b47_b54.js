// W2 優奈の同率最長台詞（d08／d20／d23／d26／d32・19字）＋美咲の同率最長台詞（b47／b54・22字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d08_d20_d23_d26_d32_b47_b54.js）：
// - 優奈 d08／d20／d23／d26／d32 は19字で優奈の同率最長行（次点も19字の d43／d45／d49）。
//   d08 は悠太、元の jump=d393 を後半へ引き継ぎ。「、」の後（13字）で分割。
//   d20 は優奈（face=surprise・char=true を後半へ継承）、元の jump=d524 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d23 は悠太、jump なし・次は d24 を後半へ引き継ぎ。「、」の後（12字）で分割。
//   d26 は優奈（face=serious・char=true を後半へ継承）、元の jump=d534 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   d32 は優奈（face=sad・char=true を後半へ継承）、元の jump=d396 を後半へ引き継ぎ。「、」の後（8字）で分割。
// - 美咲 b47／b54 は22字で美咲の同率最長行（次点も22字の b95／b102／b129／b180／b195／b203）。
//   b47 は悠太、元の jump=b300 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   b54 は美咲（face=surprise を後半へ継承）、元の jump=b334 を後半へ引き継ぎ。「……」の後（10字）で分割。
// 方式は qa/edit_d528_d539_d561_b332_b389_b479_b534_b539_b552.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d754〜d758（優奈）・b683〜b684（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d08_d20_d23_d26_d32_b47_b54.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd08', 'd754', 13, '（開始に判子が要る図書館、', '初めて見た。'],
  ['yuna', 'd20', 'd755', 8, '……っ、それは、', '今すぐ返してください。'],
  ['yuna', 'd23', 'd756', 12, '（規則の人・優奈さんが、', '声を荒らげた）'],
  ['yuna', 'd26', 'd757', 9, '図書館規則第三条、', '資料の所在については'],
  ['yuna', 'd32', 'd758', 8, 'この本のことは、', 'どうか忘れてください。'],
  ['misaki', 'b47', 'b683', 10, '（雨の日だけ来る客。', '雨の日だけ出勤する先輩。'],
  ['misaki', 'b54', 'b684', 10, 'じゃあ、あの人は……', '今、どこにいるんですか。'],
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
console.log('OK: split d08->d754, d20->d755, d23->d756, d26->d757, d32->d758, b47->b683, b54->b684');
