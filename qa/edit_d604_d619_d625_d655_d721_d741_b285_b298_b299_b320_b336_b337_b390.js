// W2 優奈の17字最長行（d604／d619／d625／d655／d721／d741）＋美咲の18字最長行（b285／b298／b299／b320／b336／b337／b390）の分割（文面不変・分割のみ）
// 実測（qa/measure_d604_d619_d625_d655_d721_d741_b285_b298_b299_b320_b336_b337_b390.js）：
// - 優奈 d604／d619／d625／d655／d721／d741 は17字で優奈の同率最長行（次点は16字の d16／d24）。
//   d604 は白鳥、元の jump=d504 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d619 は優奈、face=cry・char=true を後半へ継承、元の jump=d148 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   d625 は悠太、元の jump=d445 を後半へ引き継ぎ。9字で分割。
//   d655 は悠太、元の jump=d452 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   d721 は悠太、元の jump=d170 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d741 は榊、元の jump=d200 を後半へ引き継ぎ。6字で分割。
// - 美咲 b285／b298／b299／b320／b336／b337／b390 は18字で美咲の同率最長行（次点も18字の b421）。
//   b285 は美咲、face=smile を後半へ継承、元の jump=b619 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   b298 は美咲、face=ecstasy を後半へ継承、元の jump=b277 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   b299 は美咲、face=smile を後半へ継承、元の jump=b591 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   b320 は美咲、face=surprise を後半へ継承、元の jump=b234 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   b336 は藤井、元の jump=b106 を後半へ引き継ぎ。「。」の後（6字）で分割。
//   b337 は美咲、face=surprise を後半へ継承、元の jump=b113 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   b390 は店長、元の jump=b09 を後半へ引き継ぎ。「。」の後（8字）で分割。
// 方式は qa/edit_d568_d593_b262.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d885〜d890（優奈）・b812〜b818（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d604_d619_d625_d655_d721_d741_b285_b298_b299_b320_b336_b337_b390.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd604', 'd885', 8, 'あの本のことも、', '私は知っています。'],
  ['yuna', 'd619', 'd886', 4, '勇気が、', '半分だけ足りなかったんです'],
  ['yuna', 'd625', 'd887', 9, 'ずっと直してきた人', 'だと思うんです。'],
  ['yuna', 'd655', 'd888', 4, '今の人、', '梓さんって言いましたよね。'],
  ['yuna', 'd721', 'd889', 6, '直った本は、', 'もう言い訳に使えません'],
  ['yuna', 'd741', 'd890', 6, 'そのあとなら', '図書館に寄贈してもいい'],
  ['misaki', 'b285', 'b812', 9, '最初のお客さんは、', 'もう決まってるの。'],
  ['misaki', 'b298', 'b813', 9, '　中で……いいの、', 'そのまま出して……'],
  ['misaki', 'b299', 'b814', 6, '残すほうが、', 'よっぽど罰当たりだもん。'],
  ['misaki', 'b320', 'b815', 8, '受け取れません。', 'あなたこそ、雨なのに'],
  ['misaki', 'b336', 'b816', 6, '忘れ物だね。', 'ホテルのメモ用紙に、住所'],
  ['misaki', 'b337', 'b817', 10, 'これだ、間違いない。', '五年前の、あの日'],
  ['misaki', 'b390', 'b818', 8, '雨、すごいねえ。', '店の前、川みたいだよ'],
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
console.log('OK: split d604->d885, d619->d886, d625->d887, d655->d888, d721->d889, d741->d890, b285->b812, b298->b813, b299->b814, b320->b815, b336->b816, b337->b817, b390->b818');
