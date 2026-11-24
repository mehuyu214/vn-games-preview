// W2 優奈の15字最長行（d577／d588／d617／d629／d639／d668／d687／d692）＋美咲の16字最長行（b452／b504／b528／b541／b553／b555／b557／b572）の分割（文面不変・分割のみ）
// 実測（qa/measure_d577_d588_d617_d629_d639_d668_d687_d692_b452_b504_b528_b541_b553_b555_b557_b572.js）：
// - 優奈 d577／d588／d617／d629／d639／d668／d687／d692 は15字で優奈の同率最長行（8件同率）。
//   d577 は悠太、元の jump=d416 を後半へ引き継ぎ。「を」の後（7字）で分割。
//   d588 は園田、元の jump=d362 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d617 は優奈、元の jump=d11 を後半へ引き継ぎ。「て」の後（7字）で分割。face=smile・char=true を後半へ継承。
//   d629 は園田、元の jump=d385 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d639 は優奈、元の jump=d512 を後半へ引き継ぎ。「、」の後（5字）で分割。face=love・char=true を後半へ継承。
//   d668 は白鳥、元の jump=d406 を後半へ引き継ぎ。「が」の後（6字）で分割。
//   d687 は白鳥、元の jump=d07b を後半へ引き継ぎ。「、」の後（4字）で分割。
//   d692 は優奈、元の jump=d67 を後半へ引き継ぎ。「、」の後（3字）で分割。face=serious・char=true を後半へ継承。
// - 美咲 b452／b504／b528／b541／b553／b555／b557／b572 は16字で美咲の同率最長行（8件同率）。
//   b452 は悠太、元の jump=b121 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   b504 は悠太、元の jump=b272 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   b528 は美咲、元の jump=b275 を後半へ引き継ぎ。「て」の後（9字）で分割。face=pleasure を後半へ継承（charなし）。
//   b541 は悠太、元の jump=b306 を後半へ引き継ぎ。「よ」の後（11字）で分割。
//   b553 は悠太、元の jump=b280 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b555 は美咲、元の jump=b447 を後半へ引き継ぎ。「、」の後（7字）で分割。face=sad を後半へ継承（charなし）。
//   b557 は悠太、元の jump=b370 を後半へ引き継ぎ。「、」の後（12字）で分割。
//   b572 は悠太、元の jump=b402 を後半へ引き継ぎ。「、」の後（10字）で分割。
// 方式は qa/edit_d474_..._b434.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d979〜d986（優奈）・b906〜b913（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d577_d588_d617_d629_d639_d668_d687_d692_b452_b504_b528_b541_b553_b555_b557_b572.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd577', 'd979', 7, '優奈さんの話を', '聞きたいんです。'],
  ['yuna', 'd588', 'd980', 7, '半世紀かけて、', 'ちゃんと届いた。'],
  ['yuna', 'd617', 'd981', 7, '背の状態も見て', 'おいてくださいね'],
  ['yuna', 'd629', 'd982', 5, '昔話かい、', 'いいよ、座りなさい。'],
  ['yuna', 'd639', 'd983', 5, 'もう少し、', '近くに来てください。'],
  ['yuna', 'd668', 'd984', 6, 'そして窓際が', '若い園田さんです。'],
  ['yuna', 'd687', 'd985', 4, '仕事は、', 'お茶のあとで十分です。'],
  ['yuna', 'd692', 'd986', 3, '心の、', '製本が終わるまでの時間を'],
  ['misaki', 'b452', 'b906', 9, '大島に引き継ぐ』。', '……大島、って'],
  ['misaki', 'b504', 'b907', 9, '最後まで、本当に。', '後悔しませんか'],
  ['misaki', 'b528', 'b908', 9, 'もっと、近くに来て', '……離れないで'],
  ['misaki', 'b541', 'b909', 11, '目が完全に笑ってますよ', '美咲さん。'],
  ['misaki', 'b553', 'b910', 7, '……守りたい、', 'って初めて思った）'],
  ['misaki', 'b555', 'b911', 7, '……今度こそ、', 'ちゃんと返します。'],
  ['misaki', 'b557', 'b912', 12, '棚卸しの後で見ましょう、', '二人で。'],
  ['misaki', 'b572', 'b913', 10, '聞いてもいいですか、', '先輩として。'],
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
console.log('OK: split d577->d979, d588->d980, d617->d981, d629->d982, d639->d983, d668->d984, d687->d985, d692->d986, b452->b906, b504->b907, b528->b908, b541->b909, b553->b910, b555->b911, b557->b912, b572->b913');
