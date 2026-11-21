// W2 優奈の同率最長台詞（d128／d136／d142／d153／d156c・22字）＋美咲の同率最長台詞（b192／b228／b248／b263／b299・26字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d128_d136_d142_d153_d156c_b192_b228_b248_b263_b299.js）：
// - 優奈 d128／d136／d142／d153／d156c は22字で優奈の同率最長行（d171／d174／d182 も22字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   d128 は悠太、元の jump=d384 を後半へ引き継ぎ。「ね、」の後（19字）で分割。
//   d136 は悠太、元の jump=d455 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   d142 は悠太、元の jump=d484 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   d153 は白鳥、元の jump=d387 を後半へ引き継ぎ。「。」の後（13字）で分割。
//   d156c は白鳥、元の jump=d350 を後半へ引き継ぎ。「。」の後（12字）で分割。
// - 美咲 b192／b228／b248／b263／b299 は26字で美咲の同率最長行（次点は25字の b05／b09／b13）。
//   b192 は美咲（face=surprise・char=true を後半へ継承）、元の jump=b379 を後半へ引き継ぎ。「。」の後（14字）で分割。
//   b228 は相沢、元の jump=b382 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   b248 は相沢、元の jump=b356 を後半へ引き継ぎ。「。」の後（11字）で分割。
//   b263 は悠太、元の jump=b387 を後半へ引き継ぎ。「。」の後（11字）で分割。
//   b299 は美咲（face=smile を後半へ継承）、元の jump=b07 を後半へ引き継ぎ。「。」の後（18字）で分割。
// 方式は qa/edit_d116_d118_d127_b186_b190.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d661〜d665（優奈）・b587〜b591（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d128_d136_d142_d153_d156c_b192_b228_b248_b263_b299.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd128', 'd661', 19, '同じ詩集を、何度も何度も借りてますね、', 'これ。'],
  ['yuna', 'd136', 'd662', 9, '（返しそびれた本。', 'それが、あの詩集のことだ。'],
  ['yuna', 'd142', 'd663', 8, 'うん、聞きます。', '最後まで、ちゃんと聞きます。'],
  ['yuna', 'd153', 'd664', 13, '閉館後のお茶は、格別です。', '判子も要りません。'],
  ['yuna', 'd156c', 'd665', 12, '判子、押しておきました。', '『許可』の判子です。'],
  ['misaki', 'b192', 'b587', 14, '手紙……わたし、書けるかな。', '何度も書き直しそうだよ。'],
  ['misaki', 'b228', 'b588', 10, '彼は言っていました。', '『雨の日は――』、よく口にして。'],
  ['misaki', 'b248', 'b589', 11, 'ええ。また、雨の日に。', '……きっと、また会いましょう。'],
  ['misaki', 'b263', 'b590', 11, '好きです。美咲さんが。', 'ずっと前から、本当に好きです。'],
  ['misaki', 'b299', 'b591', 18, '残すほうが、よっぽど罰当たりだもん。', 'お弁当も本望だよ'],
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
console.log('OK: split d128->d661, d136->d662, d142->d663, d153->d664, d156c->d665, b192->b587, b228->b588, b248->b589, b263->b590, b299->b591');
