// W2 桜の27字行 a71／a188／a223／a243 の分割（文面不変・分割のみ）
// 実測（qa/measure_sakura27_a71_a188_a223_a243.js）：
// - 桜の台詞の最長は27字（4件：a71・a188・a223・a243）。これで桜の27字行は残り0件。
//   凛の台詞最長は28字（10件：c16・c28・c33・c52・c74・c107・c143・c146・c179・c212）、
//   美咲12字、優奈12字、セレナ25字（e14）。
//   a71 はさくら、元の後続は a72。「はーい。悠太、こっち来て。」（13字）で分割。
//   a188 はさくら、元の後続は a189。「悠太。……そろそろ、話すね。」（14字）で分割。
//   a223 は藤堂、元の後続は a224。「個展の件、会場には私から。」（13字）で分割。
//   a243 はさくら、元の後続は a244。「みんなのおかげ。……ねえ悠太。」（15字）で分割。
// 方式は qa/edit_rin29_c253_c256_c260_c267.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード a365〜a368（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_sakura27_a71_a188_a223_a243.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['sakura', 'a71', 'a365', 13, 'はーい。悠太、こっち来て。', 'フィルムの巻き方、覚えてる？'],
  ['sakura', 'a188', 'a366', 14, '悠太。……そろそろ、話すね。', '駅の日のこと。ほんとのこと'],
  ['sakura', 'a223', 'a367', 13, '個展の件、会場には私から。', '全て元通りに。謝罪も、正式に'],
  ['sakura', 'a243', 'a368', 15, 'みんなのおかげ。……ねえ悠太。', '夜、時間ある？　大事な話'],
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
console.log('OK: split a71->a365, a188->a366, a223->a367, a243->a368');
