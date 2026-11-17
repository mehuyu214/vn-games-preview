// W2 各作品の最長台詞の分割（文面不変・分割のみ）
// 実測（qa/measure_a246_d40.js）：
// - 桜 a246 は79字で桜の最長行（次点 a272:60字）。告白のクライマックス台詞で
//   1ノードに詰め込みすぎのため、句点の区切りで2ノードに分割する。
// - 優奈 d40 は50字で優奈の最長行。同一ノード内で「……閉館ですよ、悠太さん」
//   が2回反復しているため、2ノードに分割して2回を別々の間として読ませる。
// 方式は qa/edit_yuna_dlg35.js（d327-d332）と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 新規ノード a298（桜）・d333（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_sakura_yuna_longlines.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

const SPLITS = [
  // [作品ID, 対象ID, 新規ID, 前半テキスト, 後半テキスト]
  ['sakura', 'a246', 'a298',
    '悠太。わたし、嘘つかないから。今から言うのは、全部ほんと。好きです。ずっと、好きだった。',
    '夏の日から、ずっと。フィルムみたいに。時間を置くほど、像が濃くなったの'],
  ['yuna', 'd40', 'd333',
    '悠太さん、まだいたんですか。修理は終わりましたか。',
    '……閉館ですよ、悠太さん。……閉館ですよ、悠太さん'],
];

for (const [gid, id, newId, first, second] of SPLITS) {
  const g = GAMES.find(x => x.id === gid);
  const idx = g.scenes.findIndex(n => n.id === id);
  if (idx < 0) throw new Error(`not found: ${id}`);
  const node = g.scenes[idx];
  if (node.text !== first + second) throw new Error(`text mismatch: ${id}`);
  if (node.choices || node.branch || node.jump) throw new Error(`not a plain node: ${id}`);
  const succ = g.scenes[idx + 1];
  if (!succ) throw new Error(`no successor: ${id}`);
  if (g.scenes.some(n => n.id === newId)) throw new Error(`id collision: ${newId}`);
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
console.log('OK: split a246->a298, d40->d333');
