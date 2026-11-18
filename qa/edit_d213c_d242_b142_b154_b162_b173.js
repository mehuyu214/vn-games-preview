// W2 優奈の同率最長台詞（d213c／d242・37字）＋美咲の同率最長台詞（b142／b154／b162／b173・36字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d213c_d242_b142_b154_b162_b173.js）：
// - 優奈 d213c／d242 は37字で優奈の同率最長行（次点 d05／d10／d33／d46／d49／d64:36字）。
//   d213c は優奈（face=serious・char=true、後半へ継承）、後続は d214。2つ目の「。」の後で分割。
//   d242 は優奈（face=shy・char=true、後半へ継承）、後続は d243。2つ目の「。」の後で分割。省略記号「……」は U+2026×2 を文字インデックスで確認済み。
// - 美咲 b142／b154／b162／b173 は36字で美咲の同率最長行（b177／b178／b185／b192 も36字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b142 は美咲（face=surprise、後半へ継承）、後続は b143。2つ目の「。」の後で分割。
//   b154 は店長、後続は b155。2つ目の「。」の後で分割。
//   b162 は藤井、後続は b163。2つ目の「。」の後で分割。
//   b173 は美咲（face=sad・char=true、後半へ継承）、後続は b174。「。」の後で分割。省略記号「……」は U+2026×2 を文字インデックスで確認済み。
// 方式は qa/edit_d127_d136_d171_d185_d185c_b100_b104_b116_b119.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d459〜d460（優奈）・b372〜b375（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d213c_d242_b142_b154_b162_b173.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd213c', 'd459', 24, 'お渡ししたい、本があります。受け取ってください。', '修理が、やっと終わりました'],
  ['yuna', 'd242', 'd460', 20, '悠太さん。わたしと、付き合ってください。', '……言えました。やっと、言えました'],
  ['misaki', 'b142', 'b372', 24, '『大島に引き継ぐ』。あれは、どういう意味ですか。', 'なんで店長の名前が台帳に'],
  ['misaki', 'b154', 'b373', 24, '礼は、傘を返せてからにしな。それが筋ってもんさ。', 'まだ終わってないんだから'],
  ['misaki', 'b162', 'b374', 16, 'それより紳士の話。聞いて驚きな。', '耳寄り情報だよ。今度ホテルに送った時にね'],
  ['misaki', 'b173', 'b375', 23, '返す前に、一度だけ……開けてみよう、この傘を。', '五年、開けたことなかったの'],
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
  secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split d213c->d459, d242->d460, b142->b372, b154->b373, b162->b374, b173->b375');
