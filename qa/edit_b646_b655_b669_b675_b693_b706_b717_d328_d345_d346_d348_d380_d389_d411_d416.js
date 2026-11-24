// W2 美咲の最長行（b646／b655／b669／b675／b693／b706／b717、15字・残り7件）＋優奈の最長行（d328／d345／d346／d348／d380／d389／d411／d416、14字・46件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_b646_b655_b669_b675_b693_b706_b717_d328_d345_d346_d348_d380_d389_d411_d416.js）：
// - 美咲 b646／b655／b669／b675／b693／b706／b717 は15字で美咲の最長行（残り7件）。
//   b646 は悠太、元の jump=b470 を後半へ引き継ぎ。「』」の後（8字）で分割。
//   b655 は悠太、元の jump=b397 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b669 は美咲、元の jump=b460 を後半へ引き継ぎ。「、」の後（5字）で分割。face=sad を後半へ継承。
//   b675 は悠太、元の jump=b501 を後半へ引き継ぎ。「に」の後（6字）で分割。
//   b693 は美咲、元の jump=b516 を後半へ引き継ぎ。「、」の後（5字）で分割。face=shy を後半へ継承。
//   b706 は相沢、元の jump=b364 を後半へ引き継ぎ。「だけ」の後（9字）で分割。
//   b717 は美咲、元の jump=b566 を後半へ引き継ぎ。「』」の後（11字）で分割。face=smile を後半へ継承。
// - 優奈 d328／d345／d346／d348／d380／d389／d411／d416 は14字で優奈の最長行（46件同率の先頭8件）。
//   d328 は優奈、元の jump=d717 を後半へ引き継ぎ。「二度」の後（5字）で分割。face=smile・char=true を後半へ継承。
//   d345 は榊、元の jump=d198 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d346 は優奈、元の jump=d533 を後半へ引き継ぎ。「、」の後（6字）で分割。face=shy・char=true を後半へ継承。
//   d348 は悠太、元の jump=d682 を後半へ引き継ぎ。「何か」の後（9字）で分割。
//   d380 は悠太、元の jump=d12 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d389 は優奈、元の jump=d203 を後半へ引き継ぎ。「、」の後（3字）で分割。face=smile・char=true を後半へ継承。
//   d411 は優奈、元の jump=d264 を後半へ引き継ぎ。「、」の後（8字）で分割。face=smile・char=true を後半へ継承。
//   d416 は悠太、元の jump=d28 を後半へ引き継ぎ。「、」の後（6字）で分割。
// 方式は qa/edit_b571_..._d281.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b962〜b968（美咲）・d1027〜d1034（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_b646_b655_b669_b675_b693_b706_b717_d328_d345_d346_d348_d380_d389_d411_d416.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b646', 'b962', 8, '初めての『選ぶ』', 'という言葉だ。'],
  ['misaki', 'b655', 'b963', 7, '……いったい、', '誰のものなんだ。'],
  ['misaki', 'b669', 'b964', 5, 'その日に、', '全部終わるんですね。'],
  ['misaki', 'b675', 'b965', 6, '初めて慰めに', '聞こえた夜だった。'],
  ['misaki', 'b693', 'b966', 5, '待つのは、', 'もう終わりにするの。'],
  ['misaki', 'b706', 'b967', 9, 'これを見られただけ', 'で十分です。'],
  ['misaki', 'b717', 'b968', 11, '傘を貸せる人間であれ』', 'だって。'],
  ['yuna', 'd328', 'd1027', 5, '一年に二度', 'の大仕事ですから、'],
  ['yuna', 'd345', 'd1028', 6, 'その一文が、', '頭から離れなくて'],
  ['yuna', 'd346', 'd1029', 6, '悠太さんは、', '優しい方ですね。'],
  ['yuna', 'd348', 'd1030', 9, '規則より大事な何か', 'があった、'],
  ['yuna', 'd380', 'd1031', 5, '修理なら、', 'もう慣れたものです'],
  ['yuna', 'd389', 'd1032', 3, 'もう、', 'ご存じかもしれませんね'],
  ['yuna', 'd411', 'd1033', 8, '館長の判子より、', '効く許可です'],
  ['yuna', 'd416', 'd1034', 6, '優奈さんが、', 'なぜ慌てたのかを'],
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
console.log('OK: split b646->b962, b655->b963, b669->b964, b675->b965, b693->b966, b706->b967, b717->b968, d328->d1027, d345->d1028, d346->d1029, d348->d1030, d380->d1031, d389->d1032, d411->d1033, d416->d1034');
