// W2 優奈の16字最長行（d440／d449）＋美咲の17字最長行（b123／b152）の分割（文面不変・分割のみ）
// 実測（qa/measure_d440_d449_b123_b152.js）：
// - 優奈 d440／d449 は16字で優奈の同率最長行（次点も16字の d478／d501／d508／d527／d537／d545）。
//   d440 は榊、元の jump=d233 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d449 は悠太、元の jump=d92 を後半へ引き継ぎ。「、」の後（11字）で分割。
// - 美咲 b123／b152 は17字で美咲の同率最長行（次点も17字の b153／b164／b170／b175／b210／b211）。
//   b123 は悠太、元の jump=b546 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   b152 は店長、元の jump=b604 を後半へ引き継ぎ。「。」の後（3字）で分割。
// 方式は qa/edit_d398_d401_d402_d418_d430_d437_b45_b57_b71_b73_b93_b97.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d915〜d916（優奈）・b842〜b843（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d440_d449_b123_b152.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd440', 'd915', 8, 'あなたの想いは、', '無駄じゃなかった'],
  ['yuna', 'd449', 'd916', 11, '……優奈さんの顔色が、', '変わった）'],
  ['misaki', 'b123', 'b842', 9, '（引き継いだのは、', '傘だけじゃない。'],
  ['misaki', 'b152', 'b843', 3, 'そう。', '『まあ、なんとかなるっしょ』'],
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
console.log('OK: split d440->d915, d449->d916, b123->b842, b152->b843');
