// W2 優奈の同率最長台詞（d144／d149／d151／d157／d204／d227・21字）＋美咲の同率最長台詞（b88／b107／b122／b142／b144・24字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d144_d149_d151_d157_d204_d227_b88_b107_b122_b142_b144.js）：
// - 優奈 d144／d149／d151／d157／d204／d227 は21字で優奈の同率最長行（次点は21字の d230／d240b）。
//   d144 は悠太、元の jump=d473 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d149 は優奈（face=sad・char=true を後半へ継承）、元の jump=d338 を後半へ引き継ぎ。「。」の後（14字）で分割。
//   d151 は白鳥、元の jump=d474 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   d157 は悠太、元の jump=d433 を後半へ引き継ぎ。「。」の後（7字）で分割。
//   d204 は優奈（face=serious・char=true を後半へ継承）、元の jump=d352 を後半へ引き継ぎ。「。」の後（15字）で分割。
//   d227 は園田、元の jump=d489 を後半へ引き継ぎ。「。」の後（11字）で分割。
// - 美咲 b88／b107／b122／b142／b144 は24字で美咲の同率最長行（次点は24字の b146／b154／b163）。
//   b88 は悠太、元の jump=b484 を後半へ引き継ぎ。「……」の後（11字）で分割。
//   b107 は藤井、元の jump=b408 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   b122 は悠太、元の jump=b453 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b142 は美咲（face=surprise を後半へ継承）、元の jump=b372 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   b144 は悠太、元の jump=b456 を後半へ引き継ぎ。「……」の後（13字）で分割。
// 方式は qa/edit_d91_d92_b49_b71_b74.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d703〜d708（優奈）・b630〜b634（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d144_d149_d151_d157_d204_d227_b88_b107_b122_b142_b144.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd144', 'd703', 8, '目録に無い本は、', 'こうして生まれたんですね。'],
  ['yuna', 'd149', 'd704', 14, '……わたしも、同じなんです。', '祖母と、同じ。'],
  ['yuna', 'd151', 'd705', 8, 'あら、二人とも。', 'ちょうどお茶の時間ですよ。'],
  ['yuna', 'd157', 'd706', 7, '（許可の判子。', '館長なりの、背中の押し方だ。'],
  ['yuna', 'd204', 'd707', 15, '明日……はい、明日、渡します。', '決めました。'],
  ['yuna', 'd227', 'd708', 11, '届けたのも、あんただ。', '若い人は、偉いねえ。'],
  ['misaki', 'b88', 'b630', 11, '傘はこの店に預けて……', 'それで、ここで働き始めた。'],
  ['misaki', 'b107', 'b631', 10, '忘れ物だよ、忘れ物。', '届けるのは、この店の仕事さ。'],
  ['misaki', 'b122', 'b632', 7, '（前の店主が、', '今の店長に引き継いだ、ってことか？'],
  ['misaki', 'b142', 'b633', 10, '『大島に引き継ぐ』。', 'あれは、どういう意味ですか。'],
  ['misaki', 'b144', 'b634', 13, 'じゃあ雨の日のシフトも……', '美咲さんの雨シフトは、'],
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
console.log('OK: split d144->d703, d149->d704, d151->d705, d157->d706, d204->d707, d227->d708, b88->b630, b107->b631, b122->b632, b142->b633, b144->b634');
