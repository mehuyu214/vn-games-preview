// W2 凛の残る34字行 c273／c276／c279 ＋ 桜の31字行 a12／a89／a171／a199／a216 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin34_sakura31_c273_c276_c279.js）：
// - 凛の台詞の最長は34字（3件：c273・c276・c279）。35字以上は0件。
//   c273 は悠太、元の後続は c274。「え。……推薦ですか。」（10字）で分割。
//   c276 は凛、元の後続は c277。「あなたは優秀な助手だった。」（13字）で分割。
//   c279 は悠太、元の後続は c280。「……そうですね。」（8字）で分割。
// - 桜の台詞の最長は31字（11件：a12・a89・a171・a199・a216・a222・a257・a263・a273・a286・a301）。
//   a12 はさくら、元の後続は a13。「わたし、そこで働いてるの。」（13字）で分割。
//   a89 はさくら、元の後続は a90。「はい、笑って。……ううん、違う。」（16字）で分割。
//   a171 はさくら、元の後続は a172。「出さない。約束だから、出さない。」（16字）で分割。
//   a199 は悠太、元の後続は a200。「ああ。じいちゃんは決めろと言った。」（17字）で分割。
//   a216 は悠太、元の後続は a217。「スキャンダルを撮ったんじゃない。」（16字）で分割。
// 方式は qa/edit_rin34_c86_c93_c99_c116_c175_c195_c198_c223.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c316〜c318（凛）・a332〜a336（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin34_sakura31_c273_c276_c279_a12_a89_a171_a199_a216.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c273', 'c316', 10, 'え。……推薦ですか。', '凛さんがいなくなるんですか、本当に、嘘みたいに。'],
  ['rin', 'c276', 'c317', 13, 'あなたは優秀な助手だった。', '……本当に、助かったわ、ありがとう、悠太。'],
  ['rin', 'c279', 'c318', 8, '……そうですね。', '言えないことが、多すぎました、俺たちには、最後まで。'],
  ['sakura', 'a12', 'a332', 13, 'わたし、そこで働いてるの。', 'おじいちゃんの代からの、小さな館だよ'],
  ['sakura', 'a89', 'a333', 16, 'はい、笑って。……ううん、違う。', '悠太の笑顔って、もっと困った顔'],
  ['sakura', 'a171', 'a334', 16, '出さない。約束だから、出さない。', 'でも、渡しもしない。それも約束'],
  ['sakura', 'a199', 'a335', 17, 'ああ。じいちゃんは決めろと言った。', '決めるには、見るしかないだろ'],
  ['sakura', 'a216', 'a336', 16, 'スキャンダルを撮ったんじゃない。', '隠蔽じゃなく、庇護だったんだな'],
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
  if (node.r18) secondNode.r18 = node.r18;
  secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split c273->c316, c276->c317, c279->c318, a12->a332, a89->a333, a171->a334, a199->a335, a216->a336');
