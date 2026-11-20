// W2 優奈の同率最長台詞（d377・25字）＋美咲の同率最長台詞（b21／b57／b84／b90・31字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d377_b21_b57_b84_b90.js）：
// - 優奈 d377 は25字で優奈の同率最長行（次点は24字多数）。
//   d377 は優奈（face=serious・char=true を後半へ継承）、元の jump=d213b を後半へ引き継ぎ。1つ目の「。」の後（8字）で分割。
// - 美咲 b21／b57／b84／b90 は31字で美咲の同率最長行（b127／b169／b221／b224 も31字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b21 は相沢、後続は b22。1つ目の「。」の後（14字）で分割（文末に句点なし）。
//   b57 は相沢、後続は b58。2つ目の「。」の後（17字）で分割（1つ目だと前半9字と短いため。文末に句点なし）。
//   b84 は悠太、後続は b85。1つ目の「。」の後（13字）で分割（文末に句点なし）。
//   b90 は悠太、後続は b91。2つ目の「。」の後（23字）で分割（1つ目だと前半4字と短いため）。
// 方式は qa/edit_d207_d225_d225b_d333_d366_d367_b264_b272_b275_b286.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d593（優奈）・b520〜b523（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d377_b21_b57_b84_b90.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd377', 'd593', 8, '大事なお話です。', '半世紀越しの、お届け物があります。'],
  ['misaki', 'b21', 'b520', 14, '五年前の、土砂降りの夜です。', '紙袋と一緒に、この店へ預けた傘です'],
  ['misaki', 'b57', 'b521', 17, '相沢、と申します。また、雨の日に。', '……預かって、いただけますか'],
  ['misaki', 'b84', 'b522', 13, '傘と紙袋を、渡してくれた。', '『店に置いとけ』って、それだけ言って'],
  ['misaki', 'b90', 'b523', 23, '（五年。雨のたびに、この店で待ち続けてたのか。', '……すごい人だ）'],
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
console.log('OK: split d377->d593, b21->b520, b57->b521, b84->b522, b90->b523');
