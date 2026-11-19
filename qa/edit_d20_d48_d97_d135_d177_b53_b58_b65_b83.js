// W2 優奈の次点最長台詞（d20／d48／d97／d135／d177・31字）＋美咲の次点最長台詞（b53／b58／b65／b83・34字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d20_d48_d97_d135_d177_b53_b58_b65_b83.js）：
// - 優奈 d20／d48／d97／d135／d177 は31字で優奈の同率最長行（d188／d201／d243 も31字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   d20 は優奈（face=surprise・char=true を後半へ継承）、後続は d21。「。」の後で分割（文末に「。」なし）。
//   d48 は優奈（face=shy・char=true を後半へ継承）、後続は d49。2つ目の「。」の後で分割（文末に「。」なし）。
//   d97 は榊、後続は d98。2つ目の「。」の後で分割（文末に「。」なし）。
//   d135 は園田、元の jump=d344 を後半へ引き継ぎ。2つ目の「。」の後で分割。
//   d177 は優奈（face=shy・char=true を後半へ継承）、元の jump=d351 を後半へ引き継ぎ。1つ目の「。」の後で分割。
// - 美咲 b53／b58／b65／b83 は34字で美咲の同率最長行（b89／b98／b120／b122 も34字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b53 は悠太、後続は b54。「。」の後で分割。
//   b58 は美咲（face=sad を後半へ継承）、後続は b59。3つ目の「。」の後で分割（文末に「。」なし）。
//   b65 は悠太、後続は b66。2つ目の「。」の後で分割（文末に「。」なし）。
//   b83 は美咲（face=sad を後半へ継承）、後続は b84。2つ目の「。」の後で分割（文末に「。」なし）。
// 方式は qa/edit_d281_b13_b33_b38_b51.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d524〜d528（優奈）・b446〜b449（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d20_d48_d97_d135_d177_b53_b58_b65_b83.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd20', 'd524', 19, '……っ、それは、今すぐ返してください。', 'お願いですから、今すぐに'],
  ['yuna', 'd48', 'd525', 18, '……よく、見ていますね。悠太さんは。', '本のことも、わたしのことも'],
  ['yuna', 'd97', 'd526', 22, '孫の、榊悠真です。どうか、手がかりだけでも。', '何か、祖母の痕跡を'],
  ['yuna', 'd135', 'd527', 15, 'ああ。梓さん、って言ったかな。', '本の話をすると目が輝く人だった。'],
  ['yuna', 'd177', 'd528', 11, '閉館ですよ、悠太さん。', '……今日は、帰りたくない気分ですけれど。'],
  ['misaki', 'b53', 'b446', 23, '（あの男？　友人？　話がまったく見えてこない。', '先輩だけが分かってる）'],
  ['misaki', 'b58', 'b447', 27, '……はい。預かります。……今度こそ、ちゃんと返します。', '約束しますから'],
  ['misaki', 'b65', 'b448', 25, '内緒って、何をですか。俺、何も分かってないですよ。', '傘と、雨と、五年と'],
  ['misaki', 'b83', 'b449', 12, 'うん。知らないおじさん。', 'ずぶ濡れのわたしを見て、黙って傘を差し出して'],
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
console.log('OK: split d20->d524, d48->d525, d97->d526, d135->d527, d177->d528, b53->b446, b58->b447, b65->b448, b83->b449');
