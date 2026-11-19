// W2 優奈の次点最長台詞（d03／d78／d88／d104／d114・34字）＋美咲の同率最長台詞（b99／b106／b107／b111／b125／b126・35字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d03_d78_d88_d104_d114_b99_b106_b107_b111_b125_b126.js）：
// - 優奈 d03／d78／d88／d104／d114 は34字で優奈の同率最長行（次点 d174／d230／d269:34字）。
//   d03 は優奈（face=smile・char=true を後半へ継承、元の jump=d328 を後半へ引き継ぎ）、後続は d04。1つ目の「。」の後で分割。
//   d78 は園田、後続は d79。1つ目の「。」の後で分割（文末に「。」なし）。
//   d88 は榊、後続は d89。2つ目の「。」の後で分割（文末に「。」なし）。
//   d104 は優奈（face=serious・char=true を後半へ継承）、後続は d105。2つ目の「。」の後で分割（文末に「。」なし）。
//   d114 は悠太、後続は d115。2つ目の「。」の後で分割（文末に「。」なし）。
// - 美咲 b99／b106／b107／b111／b125／b126 は35字で美咲の同率最長行（b128／b132 も35字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   b99 は藤井、後続は b100。2つ目の「。」の後で分割（文末に「。」なし）。
//   b106 は美咲（face=serious を後半へ継承）、後続は b107（本ランで同時分割）。2つ目の「。」の後で分割（文末に「。」なし）。
//   b107 は藤井、後続は b108。2つ目の「。」の後で分割（文末に「。」なし）。
//   b111 は悠太、後続は b112。1つ目の「。」の後で分割（文末に「。」なし）。
//   b125 は悠太、後続は b126（本ランで同時分割）。2つ目の「。」の後で分割（文末に「。」なし）。
//   b126 は美咲（face=sad を後半へ継承）、後続は b127。3つ目の「。」の後で分割（文末に「。」なし）。
// 方式は qa/edit_d221_d226_d227_b87_b93.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d490〜d494（優奈）・b406〜b411（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d03_d78_d88_d104_d114_b99_b106_b107_b111_b125_b126.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd03', 'd490', 15, 'おはようございます、悠太さん。', '今日は棚卸し、よろしくお願いしますね。'],
  ['yuna', 'd78', 'd491', 25, 'あんたの淹れるお茶は、昔の人のお茶に似てるんだよ。', '懐かしい、味がする'],
  ['yuna', 'd88', 'd492', 25, 'すみません、助かります。聞くだけ、聞いてください。', '遠くから来たもので'],
  ['yuna', 'd104', 'd493', 19, '榊梓。わたしの祖母で、先代の司書です。', 'そして、わたしの憧れの人でした'],
  ['yuna', 'd114', 'd494', 22, '館長だったんですか、梓さん。司書じゃなくて。', 'この図書館の、一番偉い人'],
  ['misaki', 'b99', 'b406', 25, '車の中でずっと、窓の外を見て言ったの。ぽつりとね。', '忘れられない言い方で'],
  ['misaki', 'b106', 'b407', 18, '……藤井さん。それ、個人情報ですよ。', '勝手には……見ちゃいけないものです'],
  ['misaki', 'b107', 'b408', 24, '忘れ物だよ、忘れ物。届けるのは、この店の仕事さ。', '落とし物は届けるのが筋'],
  ['misaki', 'b111', 'b409', 16, '雨の日だけに絞れば、早いですよ。', '日付と天気で追えば、傘は一本だけのはず'],
  ['misaki', 'b125', 'b410', 28, '今、電話しますか。店長、起きてますかね、もう深夜ですよ。', '怒られませんか'],
  ['misaki', 'b126', 'b411', 26, 'ううん。……雨の日に、聞く。直接、顔を見て聞きたい。', '電話じゃ、駄目なの'],
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
console.log('OK: split d03->d490, d78->d491, d88->d492, d104->d493, d114->d494, b99->b406, b106->b407, b107->b408, b111->b409, b125->b410, b126->b411');
