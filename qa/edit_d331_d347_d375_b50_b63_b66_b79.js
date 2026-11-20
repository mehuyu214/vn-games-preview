// W2 優奈の同率最長台詞（d331／d347／d375・28字）＋美咲の次点最長台詞（b50／b63／b66／b79・33字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d331_d347_d375_b50_b63_b66_b79.js）：
// - 優奈 d331／d347／d375 は28字で優奈の同率最長行（次点は27字多数）。
//   d331 は優奈（face=sad・char=true を後半へ継承）、元の jump=d169 を後半へ引き継ぎ。1つ目の「。」の後で分割。
//   d347 は優奈（face=sad・char=true を後半へ継承）、元の jump=d36 を後半へ引き継ぎ。1つ目の「。」の後で分割。
//   d375 は優奈（face=serious・char=true を後半へ継承）、元の jump=d195 を後半へ引き継ぎ。1つ目の「。」の後で分割。
// - 美咲 b50／b63／b66／b79 は33字で美咲の同率最長行（b82／b86／b88／b96 も33字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b50 は相沢、後続は b51。2つ目の「。」の後で分割。
//   b63 は悠太、後続は b64。1つ目の「。」の後で分割。
//   b66 は美咲（face=serious を後半へ継承）、後続は b67。2つ目の「。」の後で分割。
//   b79 は美咲（face=serious を後半へ継承）、後続は b80。「？」＋全角空白の後で分割（全角空白は後半の先頭に残る）。
// 方式は qa/edit_d266_b14_b39_b41_b44.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d551〜d553（優奈）・b478〜b481（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d331_d347_d375_b50_b63_b66_b79.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd331', 'd551', 10, 'でも、できなかった。', '直すことは、渡す決意と表裏でしたから'],
  ['yuna', 'd347', 'd552', 7, 'お願いします。', '悠太さんにだけは、迷惑をかけたくないんです'],
  ['yuna', 'd375', 'd553', 18, 'それだけは、どうか分かってください。', '理由を、話しますから'],
  ['misaki', 'b50', 'b478', 19, '……ああ。本当に、まだあったんですね。', 'この傘が、ここに。……五年も'],
  ['misaki', 'b63', 'b479', 10, '（今のは誤魔化しだ。', 'いつもの軽いやつじゃない。目が笑ってなかった）'],
  ['misaki', 'b66', 'b480', 25, '……全部。傘のことも、あの人のことも、今夜の全部。', '……お願いだから'],
  ['misaki', 'b79', 'b481', 14, '……五年前の話。してもいい？', '　長いよ、夜勤だけど。途中で寝ないでね'],
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
console.log('OK: split d331->d551, d347->d552, d375->d553, b50->b478, b63->b479, b66->b480, b79->b481');
