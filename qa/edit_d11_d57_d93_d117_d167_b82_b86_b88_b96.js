// W2 優奈の次点最長台詞（d11／d57／d93／d117／d167・27字）＋美咲の同率最長台詞（b82／b86／b88／b96・33字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d11_d57_d93_d117_d167_b82_b86_b88_b96.js）：
// - 優奈 d11／d57／d93／d117／d167 は27字で優奈の同率最長行（d167c／d202／d334 も27字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   d11 は悠太、元の jump=d380 を後半へ引き継ぎ。1つ目の「。」の後で分割。
//   d57 は悠太、元の jump=d444 を後半へ引き継ぎ。文中に「。」がないため1つ目の読点の後で分割。
//   d93 は榊、元の jump=d403 を後半へ引き継ぎ。1つ目の「。」の後で分割。
//   d117 は白鳥、元の jump=d404 を後半へ引き継ぎ。1つ目の「。」の後で分割。
//   d167 は優奈（face=smile・char=true を後半へ継承）、元の jump=d420 を後半へ引き継ぎ。1つ目の「。」の後で分割。
// - 美咲 b82／b86／b88／b96 は33字で美咲の同率最長行（b110／b121／b134／b137 も33字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b82 は悠太、後続は b83。1つ目の「。」の後で分割。
//   b86 は悠太、後続は b87。1つ目の「。」の後で分割。
//   b88 は悠太、後続は b89。1つ目の「。」の後で分割。
//   b96 は悠太、後続は b97。1つ目の「。」の後で分割。
// 方式は qa/edit_d331_d347_d375_b50_b63_b66_b79.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d554〜d558（優奈）・b482〜b485（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d11_d57_d93_d117_d167_b82_b86_b88_b96.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd11', 'd554', 5, '了解です。', '背表紙の壊れた本たちですね、任せてください。'],
  ['yuna', 'd57', 'd555', 9, 'じゃあ優奈さんは、', '廃棄から守ってたんですね、あの本を。'],
  ['yuna', 'd93', 'd556', 12, 'だから存在しないんです。', '目録に無い本を、探しています。'],
  ['yuna', 'd117', 'd557', 8, '知っていました。', 'ずっと、見ていましたよ、貴方の修理を。'],
  ['yuna', 'd167', 'd558', 11, '最後の糸を、通します。', '……これで、この本はもう大丈夫。'],
  ['misaki', 'b82', 'b482', 11, 'そこへ、あの人が来た。', '……相沢さんじゃなくて、別の人。傘をくれた人'],
  ['misaki', 'b86', 'b483', 12, '優しい人じゃないですか。', '名前も聞けなかったんですか。お礼も言えずに'],
  ['misaki', 'b88', 'b484', 24, '傘はこの店に預けて……それで、ここで働き始めた。', '高校を出て、すぐに'],
  ['misaki', 'b96', 'b485', 16, 'おかえりじゃないです、藤井さん。', 'ここは店ですよ。家と間違えてません'],
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
console.log('OK: split d11->d554, d57->d555, d93->d556, d117->d557, d167->d558, b82->b482, b86->b483, b88->b484, b96->b485');
