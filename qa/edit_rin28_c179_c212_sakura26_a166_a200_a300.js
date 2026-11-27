// W2 凛の28字行 c179／c212 と桜の26字行 a166／a200／a300 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin28_c179_c212_sakura26_a166_a200_a300.js、台詞＝name ありのみ）：
// - 凛の台詞の最長は28字（2件：c179・c212）。
//   桜の台詞最長は26字（3件：a166・a200・a300）、美咲12字、優奈12字、セレナ25字（e14）。
//   c179 は真壁、元の後続は c180。「誰のミスか、とは聞いていない」（14字）で分割。
//   c212 は悠太、元の後続は c213。「（心拍数が誤差どころじゃない。」（15字）で分割。
//   a166 は藤堂、元の後続は a167。「フィルムの在処さえ分かれば。」（14字）で分割。
//   a200 はさくら、元の jump は a206。「……うん。うん、そうだね。」（13字）で分割。
//   a300 はさくら、元の jump は a193。「悠太が帰るって、噂で聞いて。」（14字）で分割。
// 方式は qa/edit_rin28_c16_c28_c33_c52_c74_c107_c143_c146.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c517・c518（凛）、a369〜a371（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin28_c179_c212_sakura26_a166_a200_a300.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c179', 'c517', 14, '誰のミスか、とは聞いていない', 'んだけどね、私は、最初から。'],
  ['rin', 'c212', 'c518', 15, '（心拍数が誤差どころじゃない。', 'もはや計測不能だ、これは）'],
  ['sakura', 'a166', 'a369', 14, 'フィルムの在処さえ分かれば。', '会場は、すぐ元に戻せます'],
  ['sakura', 'a200', 'a370', 13, '……うん。うん、そうだね。', 'わたしも、怖いけど。見たい'],
  ['sakura', 'a300', 'a371', 14, '悠太が帰るって、噂で聞いて。', '偶然なんて、嘘。ごめんね'],
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
console.log('OK: split c179->c517, c212->c518, a166->a369, a200->a370, a300->a371');
