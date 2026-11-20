// W2 優奈の同率最長台詞（d86／d87／d115／d129／d143b・24字）＋美咲の次点最長台詞（b133／b158／b188／b193／b242・30字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d86_d87_d115_d129_d143b_b133_b158_b188_b193_b242.js）：
// - 優奈 d86／d87／d115／d129／d143b は24字で優奈の同率最長行（d173／d176c／d184b も24字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   d86 は優奈（face=serious・char=true を後半へ継承）、元の jump=d402 を後半へ引き継ぎ。1つ目の「。」の後（6字）で分割。
//   d87 は悠太、後続は d88。1つ目の「。」の後（15字）で分割。
//   d115 は白鳥、元の jump=d504 を後半へ引き継ぎ。読点「そして、」の後（7字）で分割（1つ目の句点だと前半3字と短いため）。
//   d129 は優奈（face=sad・char=true を後半へ継承）、元の jump=d337 を後半へ引き継ぎ。1つ目の「。」の後（19字）で分割。
//   d143b は優奈（face=serious・char=true を後半へ継承）、元の jump=d342 を後半へ引き継ぎ。1つ目の「。」の後（19字）で分割。
// - 美咲 b133／b158／b188／b193／b242 は30字で美咲の次点最長行（次点は29字多数）。
//   b133 は悠太、後続は b134。1つ目の「。」の後（8字）で分割。
//   b158 は美咲（face=serious・char=true を後半へ継承）、後続は b159。2つ目の「。」の後（19字）で分割。
//   b188 は悠太、後続は b189。2つ目の「。」の後（23字）で分割。
//   b193 は悠太、後続は b194。1つ目の「。」の後（16字）で分割。
//   b242 は美咲（face=smile・char=true を後半へ継承）、後続は b243。1つ目の「。」の後（7字）で分割。
// 方式は qa/edit_d59_d72_d74_b274_b288.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d602〜d606（優奈）・b530〜b534（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d86_d87_d115_d129_d143b_b133_b158_b188_b193_b242.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd86', 'd602', 6, '閉館ですよ。', '……ですが、ご用件だけなら伺います。'],
  ['yuna', 'd87', 'd603', 15, '（出た、今日の『閉館ですよ』。', 'でも少し柔らかい）'],
  ['yuna', 'd115', 'd604', 7, 'ええ。そして、', 'あの本のことも、私は知っています。'],
  ['yuna', 'd129', 'd605', 19, '未返却の本は、除籍されるはずなんです。', '規則では。'],
  ['yuna', 'd143b', 'd606', 19, '未返却で、本当は処分されるはずでした。', '規則では。'],
  ['misaki', 'b133', 'b530', 8, '（経験則、鋭い。', '……俺も嫌な予感しかしない。封筒が分厚いし）'],
  ['misaki', 'b158', 'b531', 19, '待ちます。五年間、そうしてきたんです。', '今さら、変えられません'],
  ['misaki', 'b188', 'b532', 23, '（顔向けできなかったのか。だから友人、とだけ。', '……重い話だ）'],
  ['misaki', 'b193', 'b533', 16, '五年間、毎雨考えてた言葉ですよ。', 'きっと書けます。思ったままを'],
  ['misaki', 'b242', 'b534', 7, '……終わった。', '五年が、終わったんだね。本当に。……夢みたいだ'],
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
console.log('OK: split d86->d602, d87->d603, d115->d604, d129->d605, d143b->d606, b133->b530, b158->b531, b188->b532, b193->b533, b242->b534');
