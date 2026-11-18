// W2 優奈の同率最長台詞（d207／d228／d232／d240b／d241・38字）＋美咲の同率最長台詞（b223／b234・37字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d207_d228_d232_d240b_d241_b223_b234.js）：
// - 優奈 d207／d228／d232／d240b／d241 は38字で優奈の同率最長行（次点 d06／d57／d65:37字）。
//   d207 は榊、後続は d208。d228 は白鳥、後続は d229。d232 は榊、後続は d233。
//   d240b は優奈（face=serious・char=true）、後続は d241。d241 は悠太（地の文）、後続は d242。
//   d240b の後続 d241 は本ランで分割対象だが、処理順（d240b→d241）により d240b の後半は元の d241 へ jump する。
//   d232／d241 の省略記号「……」は U+2026×2 を文字インデックスで確認済み。d241 は（が前半に、）が後半へ。
// - 美咲 b223／b234 は37字で美咲の同率最長行（b248／b252／b265／b281 も37字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   b223 は相沢、後続は b224。b234 は相沢、後続は b235。b223 の省略記号「……」は U+2026×2 を文字インデックスで確認済み。
// 方式は qa/edit_d176_d176c_d193_b176_b198_b207_b210_b211_b222.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d438〜d442（優奈）・b354〜b355（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d207_d228_d232_d240b_d241_b223_b234.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd207', 'd438', 25, '僕は遠くで見守ります。身内として、それが役目です。', '届く瞬間を、この目で見ます'],
  ['yuna', 'd228', 'd439', 24, '園田さん、お茶をどうぞ。今日は特別な日ですから。', 'とびきりの一杯を、淹れました'],
  ['yuna', 'd232', 'd440', 22, '……祖母さん、よかったね。本当に、よかった。', 'あなたの想いは、無駄じゃなかった'],
  ['yuna', 'd240b', 'd441', 21, 'だから、わたしは言います。わたしの言葉で。', '祖母の言葉じゃなく、わたしの言葉で'],
  ['yuna', 'd241', 'd442', 19, '（来た。逃げるな、俺も絶対に逃げるな。', 'この瞬間を、半世紀待った人たちがいる）'],
  ['misaki', 'b223', 'b354', 25, '……柄の中身に、気づいたんですね。……そうですか。', '隠したつもりは、なかった'],
  ['misaki', 'b234', 'b355', 23, '雨の日に、誰かを待つためではなく、使う傘です。', '待つのは、もう終わりでしょう'],
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
console.log('OK: split d207->d438, d228->d439, d232->d440, d240b->d441, d241->d442, b223->b354, b234->b355');
