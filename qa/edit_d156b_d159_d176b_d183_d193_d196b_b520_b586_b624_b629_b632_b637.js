// W2 優奈の15字最長行（d156b／d159／d176b／d183／d193／d196b）＋美咲の17字最長行（b520／b586／b624／b629／b632／b637）の分割（文面不変・分割のみ）
// 実測（qa/measure_d156b_d159_d176b_d183_d193_d196b_b520_b586_b624_b629_b632_b637.js）：
// - 優奈 d156b／d159／d176b／d183／d193／d196b は15字で優奈の同率最長行（次点も15字の d199b／d202）。
//   d156b は優奈、jumpなし→後続 d156c へ。「……」の後（6字）で分割。face=surprise・char=true を後半へ継承。
//   d159 は優奈、jumpなし→後続 d160 へ。「。」の後（7字）で分割。face=serious・char=true を後半へ継承。
//   d176b は悠太、jumpなし→後続 d176c へ。8字で分割。
//   d183 は優奈、元の jump=d571 を後半へ引き継ぎ。「、」の後（3字）で分割。face=sad・char=true を後半へ継承。
//   d193 は優奈、元の jump=d671 を後半へ引き継ぎ。「、」の後（4字）で分割。face=serious・char=true を後半へ継承。
//   d196b は優奈、元の jump=d518 を後半へ引き継ぎ。「、」の後（7字）で分割。face=sad・char=true を後半へ継承。
// - 美咲 b520／b586／b624／b629／b632／b637 は17字で美咲の同率最長行（次点も17字の b653／b667）。
//   b520 は相沢、元の jump=b22 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b586 は悠太、元の jump=b425 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   b624 は藤井、元の jump=b361 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b629 は悠太、元の jump=b365 を後半へ引き継ぎ。「、」の後（14字）で分割。
//   b632 は悠太、元の jump=b453 を後半へ引き継ぎ。「、」の後（11字）で分割。
//   b637 は悠太、元の jump=b345 を後半へ引き継ぎ。「で」の後（15字）で分割。
// 方式は qa/edit_d120_d135_b494_b496.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d941〜d946（優奈）・b868〜b873（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d156b_d159_d176b_d183_d193_d196b_b520_b586_b624_b629_b632_b637.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd156b', 'd941', 6, 'わたしが……', '持っている、ですか'],
  ['yuna', 'd159', 'd942', 7, '明日……はい。', '逃げません、もう'],
  ['yuna', 'd176b', 'd943', 8, '（そんなに喜んで', 'もらえるとは）'],
  ['yuna', 'd183', 'd944', 3, 'なぜ、', '言えなかったんでしょう。'],
  ['yuna', 'd193', 'd945', 4, '榊さん、', '少しお話ができますか。'],
  ['yuna', 'd196b', 'd946', 7, '届かなかった、', '告白の手紙です。'],
  ['misaki', 'b520', 'b868', 7, '紙袋と一緒に、', 'この店へ預けた傘です'],
  ['misaki', 'b586', 'b869', 8, '最後の雨の日に、', '全部聞きましょう。'],
  ['misaki', 'b624', 'b870', 7, '　ごめん、傘、', '忘れてきちゃったー！'],
  ['misaki', 'b629', 'b871', 14, '……俺も共犯にする気ですね、', '先輩。'],
  ['misaki', 'b632', 'b872', 11, '今の店長に引き継いだ、', 'ってことか？'],
  ['misaki', 'b637', 'b873', 15, '藤井さんの情報はいつも半分噂で', '……'],
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
console.log('OK: split d156b->d941, d159->d942, d176b->d943, d183->d944, d193->d945, d196b->d946, b520->b868, b586->b869, b624->b870, b629->b871, b632->b872, b637->b873');
