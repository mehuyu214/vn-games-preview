// W2 優奈の16字最長行（d221b／d247／d337／d349／d359／d369）＋美咲の18字最長行（b519／b522／b571／b642／b647／b673）の分割（文面不変・分割のみ）
// 実測（qa/measure_d221b_d247_d337_d349_d359_d369_b519_b522_b571_b642_b647_b673.js）：
// - 優奈 d221b／d247／d337／d349／d359／d369 は16字で優奈の同率最長行（次点も16字の d379／d394）。
//   d221b は悠太、jumpなし（後続 d221c へ）。「。」の後（9字）で分割。
//   d247 は悠太、元の jump=d476 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d337 は優奈、face=sad・char=true を後半へ継承、元の jump=d618 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d349 は優奈、face=smile・char=true を後半へ継承、元の jump=d575 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d359 は優奈、face=smile・char=true を後半へ継承、元の jump=d168 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d369 は榊、元の jump=d96 を後半へ引き継ぎ。「、」の後（8字）で分割。
// - 美咲 b519／b522／b571／b642／b647／b673 は18字で美咲の同率最長行（次点は17字の b08／b42）。
//   b519 は店長、元の jump=b287 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   b522 は悠太、元の jump=b85 を後半へ引き継ぎ。「、」の後（11字）で分割。
//   b571 は美咲、face=serious を後半へ継承、元の jump=b400 を後半へ引き継ぎ。「、」の後（15字）で分割。
//   b642 は美咲、face=sad を後半へ継承、元の jump=b428 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b647 は悠太、元の jump=b473 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   b673 は相沢、元の jump=b526 を後半へ引き継ぎ。「を」の後（8字）で分割。
// 方式は qa/edit_d208_d215_b514.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d901〜d906（優奈）・b828〜b833（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d221b_d247_d337_d349_d359_d369_b519_b522_b571_b642_b647_b673.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd221b', 'd901', 9, '（同じだったのか。', '二人とも……）'],
  ['yuna', 'd247', 'd902', 7, '（閉館ですよ、', 'の最終形態だ……！'],
  ['yuna', 'd337', 'd903', 6, '……祖母が、', '自分で規則を破った。'],
  ['yuna', 'd349', 'd904', 8, 'おばあちゃんが、', '読んでくれた本。'],
  ['yuna', 'd359', 'd905', 8, '壊れたところが、', 'そのまま見えます'],
  ['yuna', 'd369', 'd906', 8, '知っている方は、', 'もう少ないそうで'],
  ['misaki', 'b519', 'b828', 9, '花、持ってきたよ。', 'でっかい胡蝶蘭だよ'],
  ['misaki', 'b522', 'b829', 11, '『店に置いとけ』って、', 'それだけ言って'],
  ['misaki', 'b571', 'b830', 15, '食べるのが一番の供養だからね、', 'ほら。'],
  ['misaki', 'b642', 'b831', 5, '……五年、', '言えなかったのに、わたし。'],
  ['misaki', 'b647', 'b832', 6, '傘と一緒に、', '海外の雨の街を歩いてる。'],
  ['misaki', 'b673', 'b833', 9, '傘と温かい飲み物を', 'ありがとう』……。'],
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
console.log('OK: split d221b->d901, d247->d902, d337->d903, d349->d904, d359->d905, d369->d906, b519->b828, b522->b829, b571->b830, b642->b831, b647->b832, b673->b833');
