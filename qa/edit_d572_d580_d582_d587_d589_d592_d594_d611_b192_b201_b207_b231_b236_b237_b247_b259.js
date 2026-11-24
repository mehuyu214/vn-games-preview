// W2 優奈の最長行（d572／d580／d582／d587／d589／d592／d594／d611、14字・22件同率の先頭8件）＋美咲の次点最長行（b192／b201／b207／b231／b236／b237／b247／b259、14字・63件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_d572_d580_d582_d587_d589_d592_d594_d611_b192_b201_b207_b231_b236_b237_b247_b259.js）：
// - 優奈 d572／d580／d582／d587／d589／d592／d594／d611 は14字で優奈の最長行（22件同率の先頭8件）。
//   d572 は園田、元の jump=d390 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   d580 は優奈、元の jump=d464 を後半へ引き継ぎ。「、」の後（9字）で分割。face=angry・char=true を後半へ継承。
//   d582 は園田、元の jump=d491 を後半へ引き継ぎ。「に」の後（7字）で分割。
//   d587 は榊、元の jump=d438 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d589 は園田、元の jump=d426 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d592 は優奈、元の jump=d43 を後半へ引き継ぎ。「、」の後（8字）で分割。face=sad・char=true を後半へ継承。
//   d594 は悠太、元の jump=d364 を後半へ引き継ぎ。「ない」の後（8字）で分割。
//   d611 は悠太、元の jump=d361 を後半へ引き継ぎ。「、」の後（9字）で分割。
// - 美咲 b192／b201／b207／b231／b236／b237／b247／b259 は14字で美咲の次点最長行（63件同率の先頭8件）。
//   b192 は美咲、元の jump=b587 を後半へ引き継ぎ。「、」の後（8字）で分割。face=surprise・char=true を後半へ継承。
//   b201 は悠太、元の jump=b550 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b207 は美咲、元の jump=b561 を後半へ引き継ぎ。「。」の後（5字）で分割。face=sad を後半へ継承。
//   b231 は悠太、元の jump=b495 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b236 は美咲、元の jump=b497 を後半へ引き継ぎ。「、」の後（8字）で分割。face=cry・char=true を後半へ継承。
//   b237 は店長、元の jump=b615 を後半へ引き継ぎ。「、」の後（3字）で分割。
//   b247 は美咲、元の jump=b692 を後半へ引き継ぎ。「、」の後（7字）で分割。face=sad を後半へ継承。
//   b259 は悠太、元の jump=b645 を後半へ引き継ぎ。「。」の後（5字）で分割。
// 方式は qa/edit_b89_..._d565.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d1051〜d1058（優奈）・b985〜b992（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d572_d580_d582_d587_d589_d592_d594_d611_b192_b201_b207_b231_b236_b237_b247_b259.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd572', 'd1051', 9, '言えなかったのは、', 'わしもだ。'],
  ['yuna', 'd580', 'd1052', 9, '直していたんです、', 'あの本を。'],
  ['yuna', 'd582', 'd1053', 7, '昔の人のお茶に', '似てるんだよ。'],
  ['yuna', 'd587', 'd1054', 6, '身内として、', 'それが役目です。'],
  ['yuna', 'd589', 'd1055', 7, '直してくれて、', '届けてくれて。'],
  ['yuna', 'd592', 'd1056', 8, '無かったことに、', 'してください'],
  ['yuna', 'd594', 'd1057', 8, '目録に載ってない', 'みたいです。'],
  ['yuna', 'd611', 'd1058', 9, '理由があるんです、', 'ちゃんと。'],
  ['misaki', 'b192', 'b985', 8, '手紙……わたし、', '書けるかな。'],
  ['misaki', 'b201', 'b986', 7, '大丈夫ですよ、', '美咲さんなら。'],
  ['misaki', 'b207', 'b987', 5, '悠太くん。', '……ありがとうね。'],
  ['misaki', 'b231', 'b988', 5, '相沢さん、', '治療のほうは……。'],
  ['misaki', 'b236', 'b989', 8, '……ありがとう、', 'ございます。'],
  ['misaki', 'b237', 'b990', 3, 'ほら、', 'なんとかなったっしょ。'],
  ['misaki', 'b247', 'b991', 7, '傘は……まだ、', '預かってても、'],
  ['misaki', 'b259', 'b992', 5, '……はい。', '供養、しましょう。'],
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
console.log('OK: split d572->d1051, d580->d1052, d582->d1053, d587->d1054, d589->d1055, d592->d1056, d594->d1057, d611->d1058, b192->b985, b201->b986, b207->b987, b231->b988, b236->b989, b237->b990, b247->b991, b259->b992');
