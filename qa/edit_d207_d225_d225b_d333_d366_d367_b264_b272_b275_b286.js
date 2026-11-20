// W2 優奈の同率最長台詞（d207／d225／d225b／d333／d366／d367・25字）＋美咲の同率最長台詞（b264／b272／b275／b286・32字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d207_d225_d225b_d333_d366_d367_b264_b272_b275_b286.js）：
// - 優奈 d207／d225／d225b／d333／d366／d367 は25字で優奈の同率最長行（d377 も25字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   d207 は榊、元の jump=d438 を後半へ引き継ぎ。1つ目の「。」の後（11字）で分割。
//   d225 は園田、元の jump=d362 を後半へ引き継ぎ。2つ目の「。」の後（10字）で分割（1つ目だと前半3字と短すぎるため）。
//   d225b は園田、元の jump=d426 を後半へ引き継ぎ。1つ目の「。」の後（11字）で分割。
//   d333 は優奈（face=serious・char=true を後半へ継承）、元の jump=d41 を後半へ引き継ぎ。1つ目の「。」の後（13字）で分割（文末に句点なし）。
//   d366 は悠太、元の jump=d26 を後半へ引き継ぎ。文中に「。」がないため2つ目の読点の後（15字）で分割。
//   d367 は優奈（face=sad・char=true を後半へ継承）、元の jump=d43 を後半へ引き継ぎ。1つ目の「。」の後（11字）で分割（文末に句点なし）。
// - 美咲 b264／b272／b275／b286 は32字で美咲の同率最長行。
//   b264 は美咲（face=shy を後半へ継承）、後続は b265。2つ目の「。」の後（22字）で分割（1つ目だと前半7字と短すぎるため。文末に句点なし）。
//   b272 は美咲（face=shy を後半へ継承）、後続は b273。2つ目の「。」の後（19字）で分割（1つ目だと前半3字と短すぎるため。文末に句点なし）。
//   b275 は悠太、後続は b276。2つ目の「。」の後（13字）で分割（文末に句点なし）。
//   b286 は店長、後続は b287。1つ目の「。」の後（14字）で分割（文末に句点なし）。
// 方式は qa/edit_d111_d175_b189_b206.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d587〜d592（優奈）・b516〜b519（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d207_d225_d225b_d333_d366_d367_b264_b272_b275_b286.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd207', 'd587', 11, '僕は遠くで見守ります。', '身内として、それが役目です。'],
  ['yuna', 'd225', 'd588', 10, 'いや。届いたよ、今。', '半世紀かけて、ちゃんと届いた。'],
  ['yuna', 'd225b', 'd589', 11, 'ありがとう、司書さん。', '直してくれて、届けてくれて。'],
  ['yuna', 'd333', 'd590', 13, '……閉館ですよ、悠太さん。', '……閉館ですよ、悠太さん'],
  ['yuna', 'd366', 'd591', 15, 'それは事実で、目録に無い本は、', '本来ここに無いはずで'],
  ['yuna', 'd367', 'd592', 11, '何も、無かったんです。', '無かったことに、してください'],
  ['misaki', 'b264', 'b516', 22, '……わたしも。待つのは、もう終わりにするの。', '今日で、待つのは卒業'],
  ['misaki', 'b272', 'b517', 19, 'うん。わたしの全部、悠太くんにあげる。', 'んっ……優しくして、お願い'],
  ['misaki', 'b275', 'b518', 13, '離しません。もう、ずっと。', '約束します、美咲さん。一生、離しません'],
  ['misaki', 'b286', 'b519', 14, 'おーい、開店おめでとうさん。', '花、持ってきたよ。でっかい胡蝶蘭だよ'],
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
console.log('OK: split d207->d587, d225->d588, d225b->d589, d333->d590, d366->d591, d367->d592, b264->b516, b272->b517, b275->b518, b286->b519');
