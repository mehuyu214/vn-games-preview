// W2 優奈の16字最長行（d379／d394）＋美咲の17字最長行（b08／b42）の分割（文面不変・分割のみ）
// 実測（qa/measure_d379_d394_b08_b42.js）：
// - 優奈 d379／d394 は16字で優奈の同率最長行（次点も16字の d398／d401／d402／d418／d430／d437）。
//   d379 は園田、元の jump=d223b を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d394 は悠太、元の jump=d16 を後半へ引き継ぎ。「、」の後（9字）で分割。
// - 美咲 b08／b42 は17字で美咲の同率最長行（次点も17字の b45／b57／b71／b73／b93／b97）。
//   b08 は店長、元の jump=b390 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   b42 は相沢、元の jump=b330 を後半へ引き継ぎ。「、」の後（10字）で分割。
// 方式は qa/edit_d221b_d247_d337_d349_d359_d369_b519_b522_b571_b642_b647_b673.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d907〜d908（優奈）・b834〜b835（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d379_d394_b08_b42.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd379', 'd907', 7, '会える理由が、', '欲しかったんだよ。'],
  ['yuna', 'd394', 'd908', 9, '番号も、ラベルも、', '何もありません'],
  ['misaki', 'b08', 'b834', 9, 'おーい、二人とも。', '生きてるかーい。'],
  ['misaki', 'b42', 'b835', 10, '彼女は……この店に、', '長いのですか。'],
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
console.log('OK: split d379->d907, d394->d908, b08->b834, b42->b835');
