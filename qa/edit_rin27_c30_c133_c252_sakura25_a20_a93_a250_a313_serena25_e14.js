// W2 凛の27字行 c30／c133／c252、桜の25字行 a20／a93／a250／a313、セレナの25字行 e14 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin27_c30_c133_c252_sakura25_serena25.js、台詞＝name ありのみ）：
// - 凛の台詞の最長は27字（3件：c30・c133・c252）。
//   桜の台詞最長は25字（4件：a20・a93・a250・a313）、美咲12字、優奈12字、セレナ25字（e14）。
//   c30 は悠太、元の後続は c31。「（なんだその例え。でも、」（12字）で分割。
//   c133 は悠太、元の jump は c134。「（この笑顔があれば、あと3割でも戦える、」（20字）で分割。
//   c252 は悠太、元の後続は c253。「凛。愛してます。ずっと、」（12字）で分割。
//   a20 は店主、元の後続は a21。「ワシは店主の権藤。よろしくな。」（15字）で分割。
//   a93 はミキ、元の後続は a94。「店主が昼寝。で、抜けてきた。」（14字）で分割。
//   a250 はさくら、元の後続は a251。「ふふ。……じゃあ、証明して。」（14字）で分割。
//   a313 はさくら、元の jump は a247。「フィルムみたいに。」（9字）で分割。
//   e14 はセレナ、元の後続は e15。「わたくし、日本語はペラペラ……」（15字）で分割。
// 方式は qa/edit_rin28_c179_c212_sakura26_a166_a200_a300.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c519〜c521（凛）、a372〜a375（桜）、e287（セレナ）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin27_c30_c133_c252_sakura25_a20_a93_a250_a313_serena25_e14.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c30', 'c519', 12, '（なんだその例え。でも、', '折れてくれそうだ、もう少しだ）'],
  ['rin', 'c133', 'c520', 20, '（この笑顔があれば、あと3割でも戦える、', '俺は、きっと）'],
  ['rin', 'c252', 'c521', 12, '凛。愛してます。ずっと、', '前から愛してます、凛、本当に。'],
  ['sakura', 'a20', 'a372', 15, 'ワシは店主の権藤。よろしくな。', '一杯どうだ。自信作だ'],
  ['sakura', 'a93', 'a373', 14, '店主が昼寝。で、抜けてきた。', 'デートの監視も兼ねてね'],
  ['sakura', 'a250', 'a374', 14, 'ふふ。……じゃあ、証明して。', 'キス、して。ここで、今'],
  ['sakura', 'a313', 'a375', 9, 'フィルムみたいに。', '時間を置くほど、像が濃くなったの'],
  ['serena', 'e14', 'e287', 15, 'わたくし、日本語はペラペラ……', 'あら、違いましたわ。'],
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
  const origEnd = !!node.end;
  const succ = origJump ? g.scenes.find(n => n.id === origJump) : g.scenes[idx + 1];
  if (!origEnd && !succ) throw new Error(`no successor: ${id}`);
  node.text = first;
  node.jump = newId;
  if (origEnd) delete node.end;
  const secondNode = { id: newId, name: node.name, text: second };
  if (node.face) secondNode.face = node.face;
  if (node.char) secondNode.char = node.char;
  if (node.r18) secondNode.r18 = node.r18;
  if (origEnd) secondNode.end = true;
  else secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${origEnd ? '(end)' : succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split c30->c519, c133->c520, c252->c521, a20->a372, a93->a373, a250->a374, a313->a375, e14->e287');
