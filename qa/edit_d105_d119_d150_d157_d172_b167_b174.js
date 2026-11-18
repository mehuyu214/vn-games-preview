// W2 優奈の同率最長台詞（d105／d119／d150／d157／d172・38字）＋美咲の同率最長台詞（b167／b174・37字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d105_d119_d150_d157_d172_b167_b174.js）：
// - 優奈 d105／d119／d150／d157／d172 は38字で優奈の同率最長行（d176／d176c／d193 も38字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   d105 は悠太、後続は d106。「。」の後、省略記号「……」は後半へ。d119 は白鳥、後続は d120。
//   d150 は悠太（地の文）、後続は d151。d157 は悠太（地の文）、後続は d158。d172 は優奈（face=serious・char=true）、後続は d173。
//   地の文の分割は d08／d59／d200／d231 と同じく（を前半に、）を後半に残す方式。
// - 美咲 b167／b174 は37字で美咲の同率最長行（b176／b198／b207／b210／b211／b222 も37字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   b167 は悠太（地の文）、後続は b168。b174 は悠太、後続は b175。省略記号「……」は U+2026×2 を文字インデックスで確認済み。
// 方式は qa/edit_d16_d28_d34_b139_b140_b145_b152_b153_b163.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d430〜d434（優奈）・b346〜b347（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d105_d119_d150_d157_d172_b167_b174.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd105', 'd430', 22, 'じゃあ榊さんは、優奈さんの従兄弟ってことに。', '……話が、一気に身内ごとになった'],
  ['yuna', 'd119', 'd431', 16, '止める理由が、なかったからです。', '直す人が、現れましたから。待っていた人が、ね'],
  ['yuna', 'd150', 'd432', 19, '（修理は、彼女の言い訳でもあったんだ。', '直している間は、決断しなくて済むから）'],
  ['yuna', 'd157', 'd433', 21, '（許可の判子。館長なりの、背中の押し方だ。', 'お茶と判子で、人の背中を押す人だ）'],
  ['yuna', 'd172', 'd434', 16, 'ええ。でも、もう終わりにします。', '待ったは、今日まで。明日、この本は旅立ちます'],
  ['misaki', 'b167', 'b346', 23, '（治療……。だから『最後の雨』なんて言い方を。', 'もう来られないかもしれない）'],
  ['misaki', 'b174', 'b347', 28, '柄の先、キャップになってますね。回りそうな溝があります。', '……回してみますか'],
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
console.log('OK: split d105->d430, d119->d431, d150->d432, d157->d433, d172->d434, b167->b346, b174->b347');
