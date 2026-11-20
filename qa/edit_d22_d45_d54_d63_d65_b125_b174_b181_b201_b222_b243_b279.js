// W2 優奈の次点最長台詞（d22／d45／d54／d63／d65・23字）＋美咲の同率最長台詞（b125／b174／b181／b201／b222／b243／b279・28字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d22_d45_d54_d63_d65_b125_b174_b181_b201_b222_b243_b279.js）：
// - 優奈 d22／d45／d54／d63／d65 は23字で優奈の次点最長行（d112／d120／d121b も23字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   d22 は優奈（face=serious・char=true を後半へ継承）、元の jump=d365 を後半へ引き継ぎ。1つ目の「。」の後（11字）で分割。
//   d45 は悠太、元の jump=d348 を後半へ引き継ぎ。1つ目の「。」の後（19字）で分割。
//   d54 は優奈（face=sad・char=true を後半へ継承）、元の jump=d502 を後半へ引き継ぎ。1つ目の「。」の後（14字）で分割。
//   d63 は優奈（face=smile・char=true を後半へ継承）、元の jump=d355 を後半へ引き継ぎ。文中に「。」が文末のみのため「……」の後（11字）で分割。
//   d65 は悠太、元の jump=d445 を後半へ引き継ぎ。文中に「。」が文末のみのため「決めるのは、」の読点の後（6字）で分割。
// - 美咲 b125／b174／b181／b201／b222／b243／b279 は28字で美咲の同率最長行（次点は27字の b56）。
//   b125 は悠太、元の jump=b410 を後半へ引き継ぎ。1つ目の「。」の後（9字）で分割。
//   b174 は悠太、元の jump=b347 を後半へ引き継ぎ。1つ目の「。」の後（16字）で分割。
//   b181 は美咲（face=sad を後半へ継承）、元の jump=b297 を後半へ引き継ぎ。文中に「。」が文末のみのため「』……」の後（19字）で分割。
//   b201 は悠太、元の jump=b202（＝次ノード）を後半へ引き継ぎ。1つ目の「。」の後（14字）で分割。
//   b222 は美咲（face=sad を後半へ継承）、元の jump=b353 を後半へ引き継ぎ。1つ目の「。」の後（20字）で分割。
//   b243 は悠太、jump なし（後続は b244 逐次）。1つ目の「。」の後（5字）で分割。
//   b279 は悠太、jump なし（後続は b280 逐次）。1つ目の「。」の後（12字）で分割。
// 方式は qa/edit_d337_d372_d408_b123.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d621〜d625（優奈）・b547〜b553（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d22_d45_d54_d63_d65_b125_b174_b181_b201_b222_b243_b279.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd22', 'd621', 11, 'お願いです、悠太さん。', '今すぐ、その本を返して。'],
  ['yuna', 'd45', 'd622', 19, 'その司書さんが、朝は本を隠したんです。', '俺から。'],
  ['yuna', 'd54', 'd623', 14, '手紙は、届かなかったんです。', '何十年も、ずっと。'],
  ['yuna', 'd63', 'd624', 11, '悠太さんは、本当に……', 'ありがとう、ございます。'],
  ['yuna', 'd65', 'd625', 6, '決めるのは、', 'ずっと直してきた人だと思うんです。'],
  ['misaki', 'b125', 'b547', 9, '今、電話しますか。', '店長、起きてますかね、もう深夜ですよ。'],
  ['misaki', 'b174', 'b548', 16, '柄の先、キャップになってますね。', '回りそうな溝があります。'],
  ['misaki', 'b181', 'b549', 19, '『雨の日は、傘を貸せる人間であれ』……', 'これ、父の言葉だ。'],
  ['misaki', 'b201', 'b550', 14, '大丈夫ですよ、美咲さんなら。', '……と言いつつ、不安は残った'],
  ['misaki', 'b222', 'b551', 20, 'あの傘が、お父さんの物だって知りました。', '柄の中の写真で。'],
  ['misaki', 'b243', 'b552', 5, '美咲さん。', '俺は、ずっと前から、美咲さんのことが……好きで'],
  ['misaki', 'b279', 'b553', 12, '（五年待った人の寝顔だ。', '……守りたい、って初めて思った）'],
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
console.log('OK: split d22->d621, d45->d622, d54->d623, d63->d624, d65->d625, b125->b547, b174->b548, b181->b549, b201->b550, b222->b551, b243->b552, b279->b553');
