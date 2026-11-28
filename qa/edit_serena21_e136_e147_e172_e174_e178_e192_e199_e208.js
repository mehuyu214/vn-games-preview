// W2 セレナの21字行の次8件（e136・e147・e172・e174・e178・e192・e199・e208）の分割（文面不変・分割のみ）
// 実測（qa/measure_serena21_e136_e147_e172_e174_e178_e192_e199_e208.js、台詞＝name ありのみ）：
// - セレナの台詞の最長は21字（13件：e136・e147・e172・e174・e178・e192・e199・e208・
//   e218・e219・e238・e267・e283）。桜の台詞最長は20字、美咲12字、優奈12字、凛の最長は20字。
//   e136 はアラン、jump なし（次ノードへ）。「家庭教師と令嬢か。」（9字）で分割。
//   e147 は悠太、jump なし（次ノードへ）。「……本気です。」（7字）で分割。
//   e172 はセレナ、jump なし（次ノードへ）。「先生、怒っておりますの？　」（13字、全角空白付き）で分割。
//   e174 は悠太、jump なし（次ノードへ）。「怒ってないです。」（8字）で分割。
//   e178 はグレゴリー、jump=e184。「判定は満了日です。」（9字）で分割。
//   e192 はアラン、jump なし（次ノードへ）。「使用人の判定、金の価値ありだ。」（15字）で分割。
//   e199 はセレナ、jump なし（次ノードへ）。「あなたを合格にしたら、」（11字）で分割。
//   e208 はセレナ、jump なし（次ノードへ）。「わたしも。ずっと、」（9字）で分割。
// 方式は qa/edit_serena21_e66_e85_e87_e92_e102_e103_e106_e109.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード e336〜e343（セレナ）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_serena21_e136_e147_e172_e174_e178_e192_e199_e208.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['serena', 'e136', 'e336', 9, '家庭教師と令嬢か。', '身分違いもいいところだ。'],
  ['serena', 'e147', 'e337', 7, '……本気です。', '文句ありますか、アランさん。'],
  ['serena', 'e172', 'e338', 13, '先生、怒っておりますの？　', '当然ですわよね。'],
  ['serena', 'e174', 'e339', 8, '怒ってないです。', '認められたいんです、俺は。'],
  ['serena', 'e178', 'e340', 9, '判定は満了日です。', '念のため、申し添えます。'],
  ['serena', 'e192', 'e341', 15, '使用人の判定、金の価値ありだ。', 'ありがとう。'],
  ['serena', 'e199', 'e342', 11, 'あなたを合格にしたら、', '終わってしまうから。'],
  ['serena', 'e208', 'e343', 9, 'わたしも。ずっと、', '好きだったの。最初から。'],
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
console.log('OK: split e136->e336, e147->e337, e172->e338, e174->e339, e178->e340, e192->e341, e199->e342, e208->e343');
