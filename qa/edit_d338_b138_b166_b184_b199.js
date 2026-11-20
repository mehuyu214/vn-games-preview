// W2 優奈の同率最長台詞（d338・27字）＋美咲の同率最長台詞（b138／b166／b184／b199・33字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d338_b138_b166_b184_b199.js）：
// - 優奈 d338 は27字で優奈の同率最長行（次点は26字多数）。
//   d338 は優奈（face=sad・char=true を後半へ継承）、元の jump=d149b を後半へ引き継ぎ。文中に「。」が文末のみのため読点「、」の後（12字）で分割。前半は「気持ちを、言葉の代わりに」（「本へ」は後半の先頭）。
// - 美咲 b138／b166／b184／b199 は33字で美咲の同率最長行（b219／b231／b235／b236 も33字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b138 は美咲（face=serious を後半へ継承）、後続は b139。「……」の後（21字）で分割。
//   b166 は藤井、後続は b167。1つ目の「。」の後（8字）で分割。
//   b184 は悠太、後続は b185。1つ目の「。」の後（24字）で分割。
//   b199 は悠太、後続は b200。1つ目の「。」の後（18字）で分割。
// 方式は qa/edit_d167c_d202_d334_b110_b121_b134_b137.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d562（優奈）・b490〜b493（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d338_b138_b166_b184_b199.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd338', 'd562', 12, '気持ちを、言葉の代わりに', '本へ閉じ込めてしまうところが。'],
  ['misaki', 'b138', 'b490', 21, '閉店したら、落とし物は全部、処分される……', '決まりで、そうなってるの'],
  ['misaki', 'b166', 'b491', 8, '仕事じゃないね。', '目当ての医者がいるんだとか、本人の口から。治療だよ'],
  ['misaki', 'b184', 'b492', 24, 'あの雨の日は……四十九日の、帰りだったんですか。', '駅前で、ずぶ濡れで'],
  ['misaki', 'b199', 'b493', 18, '言葉は、その場で言えばいいんですよ。', 'きっと大丈夫。俺も隣にいますし'],
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
console.log('OK: split d338->d562, b138->b490, b166->b491, b184->b492, b199->b493');
