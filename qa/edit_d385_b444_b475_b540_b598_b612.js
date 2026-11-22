// W2 優奈の18字最長行（d385）＋美咲の20字最長行（b444／b475／b540／b598／b612）の分割（文面不変・分割のみ）
// 実測（qa/measure_d385_b444_b475_b540_b598_b612.js）：
// - 優奈 d385 は18字で優奈の同率最長行（次点も18字の d388／d406／d410／d451／d457／d462／d475）。
//   d385 は園田、元の jump=d134b を後半へ引き継ぎ。「、」の後（9字）で分割。
// - 美咲 b444／b475／b540／b598／b612 は20字で美咲の同率最長行（次点は19字の b12／b16／b30）。
//   b444 は悠太、元の jump=b39 を後半へ引き継ぎ。「。」の後（13字）で分割。末尾に句点なしの原文のまま。
//   b475 は美咲（face=sad を後半へ継承）、元の jump=b40 を後半へ引き継ぎ。「。」の後（13字）で分割。末尾に句点なしの原文のまま。
//   b540 は悠太、元の jump=b295 を後半へ引き継ぎ。「。」の後（7字）で分割。
//   b598 は美咲（face=serious を後半へ継承）、元の jump=b480 を後半へ引き継ぎ。「、」の後（14字）で分割。
//   b612 は美咲（face=cry を後半へ継承）、元の jump=b527 を後半へ引き継ぎ。「、」の後（13字）で分割。
// 方式は qa/edit_d260_d341_d343_d357_d362_d364_d375_b393.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d826（優奈）・b750〜b754（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d385_b444_b475_b540_b598_b612.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd385', 'd826', 9, '爺の昔話は長いよ、', 'それでもいいかい。'],
  ['misaki', 'b444', 'b750', 13, 'ずいぶん大事そうに抱えて。', '落とし物ですか'],
  ['misaki', 'b475', 'b751', 13, '木でできてる、重い傘だよ。', '安物じゃないの'],
  ['misaki', 'b540', 'b752', 7, 'いただきます。', '今日はなんのお弁当ですか。'],
  ['misaki', 'b598', 'b753', 14, '傘のことも、あの人のことも、', '今夜の全部。'],
  ['misaki', 'b612', 'b754', 13, 'わたし、お父さんのことで、', '責めてません。'],
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
console.log('OK: split d385->d826, b444->b750, b475->b751, b540->b752, b598->b753, b612->b754');
