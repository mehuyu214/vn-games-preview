// W2 優奈の同率最長台詞（d176／d182b／d200・23字）＋美咲の同率最長台詞（b208・27字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d176_d182b_d200_b208.js）：
// - 優奈 d176／d182b／d200 は23字で優奈の同率最長行（d217／d223b／d253／d275c／d335 も23字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d176 は優奈（face=serious・char=true を後半へ継承）、元の jump=d435 を後半へ引き継ぎ。1つ目の「。」の後（11字）で分割。
//   d182b は白鳥、元の jump=d486 を後半へ引き継ぎ。「と、」の読点の後（13字）で分割。
//   d200 は悠太（地の文）、元の jump=d388 を後半へ引き継ぎ。1つ目の「。」の後（10字）で分割。
// - 美咲 b208 は27字で美咲の同率最長行（b211／b229／b262／b290／b301／b310 も27字で同率だが本ランは前ラン次回候補の1行のみ対象）。
//   b208 は悠太、元の jump=b380 を後半へ引き継ぎ。1つ目の「。」の後（15字）で分割。
// 方式は qa/edit_d134_d134c_d154_d156_d168_b58_b101_b116_b147_b156_b176_b207.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d634〜d636（優奈）・b562（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d176_d182b_d200_b208.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd176', 'd634', 11, '……ふふ、ありがとう。', '半世紀の本に、今日の栞。'],
  ['yuna', 'd182b', 'd635', 14, 'ええ。お茶と本の話になると、', '目が輝く人でした。'],
  ['yuna', 'd200', 'd636', 10, '（脅威じゃなかった。', '最初から、同志だったんだ。'],
  ['misaki', 'b208', 'b562', 15, '礼は、傘を返せてから、ですよ。', '店長の受け売りですけど。'],
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
console.log('OK: split d176->d634, d182b->d635, d200->d636, b208->b562');
