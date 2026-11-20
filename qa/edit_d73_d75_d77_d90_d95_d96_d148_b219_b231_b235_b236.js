// W2 優奈の次点最長台詞（d73／d75／d77／d90／d95／d96／d148・26字）＋美咲の同率最長台詞（b219／b231／b235／b236・33字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d73_d75_d77_d90_d95_d96_d148_b219_b231_b235_b236.js）：
// - 優奈 d73／d75／d77／d90／d95／d96／d148 は26字で優奈の次点最長行（d149b も26字で同率だが本ランは前ラン次回候補の7行のみ対象）。
//   d73 は園田、元の jump=d467 を後半へ引き継ぎ。1つ目の「。」の後（13字）で分割。
//   d75 は園田、元の jump=d335 を後半へ引き継ぎ。1つ目の「。」の後（17字）で分割。
//   d77 は悠太、後続は d78。1つ目の「。」の後（12字）で分割。
//   d90 は榊、元の jump=d336 を後半へ引き継ぎ。1つ目の「。」の後（17字）で分割。
//   d95 は榊、元の jump=d369 を後半へ引き継ぎ。1つ目の「。」の後（14字）で分割。
//   d96 は悠太、元の jump=d450 を後半へ引き継ぎ。「。」の後で切ると後半が4字と短いため読点「、」の後（9字）で分割。
//   d148 は悠太、元の jump=d386 を後半へ引き継ぎ。読点「、」の後（13字）で分割。
// - 美咲 b219／b231／b235／b236 は33字で美咲の同率最長行（b246／b247／b250／b256 も33字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b219 は相沢、後続は b220。2つ目の「。」の後（16字）で分割。
//   b231 は悠太、後続は b232。1つ目の「。」の後（14字）で分割。
//   b235 は相沢、後続は b236。1つ目の「。」の後（16字）で分割。
//   b236 は美咲（face=cry・char=true を後半へ継承）、後続は b237。1つ目の「。」の後（14字）で分割。
// 方式は qa/edit_d338_b138_b166_b184_b199.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d563〜d569（優奈）・b494〜b497（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d73_d75_d77_d90_d95_d96_d148_b219_b231_b235_b236.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd73', 'd563', 13, '分かってる、規則は守るよ。', 'でも席は、空いてたからね。'],
  ['yuna', 'd75', 'd564', 17, '昔はここで、よく本を読んだもんだ。', '半世紀近く前かな。'],
  ['yuna', 'd77', 'd565', 12, '（お茶に判子は要らない。', '当たり前だが名言に聞こえる）'],
  ['yuna', 'd90', 'd566', 17, '存在しない本を、探しているんです。', '祖母の手がかりで。'],
  ['yuna', 'd95', 'd567', 14, '祖母は昔、ここの司書でした。', '名前は、榊梓と言います。'],
  ['yuna', 'd96', 'd568', 9, '（優奈さんの手が、', 'カウンターの上で止まった。……梓。'],
  ['yuna', 'd148', 'd569', 13, '優奈さんが直してきたのは、', '本だけじゃない気がします。'],
  ['misaki', 'b219', 'b494', 16, '……手紙、ですか。私に、ですか。', '……開けても、いいんですか。本当に'],
  ['misaki', 'b231', 'b495', 14, '相沢さん、治療のほうは……。', '海外で、長くなるんですか。心配で、つい'],
  ['misaki', 'b235', 'b496', 16, '誰かと一緒に、歩くための傘です。', '……ね、そうでしょう。若いお二人に'],
  ['misaki', 'b236', 'b497', 14, '……ありがとう、ございます。', '……大事に、します。一生、大事にします'],
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
console.log('OK: split d73->d563, d75->d564, d77->d565, d90->d566, d95->d567, d96->d568, d148->d569, b219->b494, b231->b495, b235->b496, b236->b497');
