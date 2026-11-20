// W2 優奈の同率最長台詞（d44／d46／d62／d78／d88／d99・25字）＋美咲の次点最長台詞（b11／b91／b92／b117／b118／b129・32字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d44_d46_d62_d78_d88_d99_b11_b91_b92_b117_b118_b129.js）：
// - 優奈 d44／d46／d62／d78／d88／d99 は25字で優奈の同率最長行（d111／d175 も25字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   d44 は優奈（face=serious・char=true を後半へ継承）、元の jump=d368 を後半へ引き継ぎ。1つ目の「。」の後（15字）で分割。
//   d46 は優奈（face=angry・char=true を後半へ継承）、元の jump=d464 を後半へ引き継ぎ。1つ目の「。」の後（11字）で分割。
//   d62 は悠太、元の jump=d480 を後半へ引き継ぎ。1つ目の「。」の後（14字）で分割。
//   d78 は園田、元の jump=d491 を後半へ引き継ぎ。文中に「。」が文末のみのため読点の後（11字）で分割。
//   d88 は榊、元の jump=d492 を後半へ引き継ぎ。1つ目の「。」の後（12字）で分割。
//   d99 は白鳥、元の jump=d470 を後半へ引き継ぎ。1つ目の「。」の後（13字）で分割。
// - 美咲 b11／b91／b92／b117／b118／b129 は32字で美咲の次点最長行（b189／b206 も32字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   b11 は悠太（括弧書きの地の文）、後続は b12。1つ目の「。」の後（24字）で分割。
//   b91 は美咲（face=sad を後半へ継承）、後続は b92。1つ目の「。」の後（21字）で分割。
//   b92 は悠太、後続は b93。1つ目の「。」の後（13字）で分割。
//   b117 は美咲（face=smile・char=true を後半へ継承）、後続は b118。2つ目の「。」の後（20字）で分割。
//   b118 は悠太、後続は b119。2つ目の「。」の後（14字）で分割。
//   b129 は悠太（括弧書きの地の文）、後続は b130。1つ目の「。」の後（22字）で分割。
// 方式は qa/edit_d27_d40_b284_b292.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d579〜d584（優奈）・b508〜b513（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d44_d46_d62_d78_d88_d99_b11_b91_b92_b117_b118_b129.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd44', 'd579', 15, 'わたしは、規則を守る司書です。', 'それは変わりません。'],
  ['yuna', 'd46', 'd580', 11, '隠しては……いません。', '直していたんです、あの本を。'],
  ['yuna', 'd62', 'd581', 14, '一人で抱えるから重いんです。', '荷物は分けるものです。'],
  ['yuna', 'd78', 'd582', 11, 'あんたの淹れるお茶は、', '昔の人のお茶に似てるんだよ。'],
  ['yuna', 'd88', 'd583', 12, 'すみません、助かります。', '聞くだけ、聞いてください。'],
  ['yuna', 'd99', 'd584', 13, '梓さんの、お孫さんですか。', '……大きくなりましたね。'],
  ['misaki', 'b11', 'b508', 24, '（何が、どう、なんとかなったのか全然わからない。', '傘は逝ったのに）'],
  ['misaki', 'b91', 'b509', 21, 'でも先週の相沢さんは、その人じゃなかった。', '顔が違う。声も、背丈も'],
  ['misaki', 'b92', 'b510', 13, '友人、って言ってましたね。', 'あの男の友人だって。じゃあ本人は今……'],
  ['misaki', 'b117', 'b511', 20, 'うん。棚卸しが終わったら、二人で見よう。', '約束ね。逃げちゃ駄目だよ'],
  ['misaki', 'b118', 'b512', 14, '……はい。終わったら、必ず。', '二人で見ます、逃げません。約束します'],
  ['misaki', 'b129', 'b513', 22, '（名言っぽく言えば済むと思ってる顔だ、これ。', 'でも、否定できない）'],
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
console.log('OK: split d44->d579, d46->d580, d62->d581, d78->d582, d88->d583, d99->d584, b11->b508, b91->b509, b92->b510, b117->b511, b118->b512, b129->b513');
