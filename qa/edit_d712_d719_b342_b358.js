// W2 優奈の16字最長行（d712／d719）＋美咲の17字最長行（b342／b358）の分割（文面不変・分割のみ）
// 実測（qa/measure_d712_d719_b342_b358.js）：
// - 優奈 d712／d719 は16字で優奈の同率最長行（次点は15字の d03／d44／d66／d72／d87／d111）。
//   d712 は優奈、元の jump=d521 を後半へ引き継ぎ。「』」の後（10字）で分割。face=love・char=true を後半へ継承。
//   d719 は悠太、元の jump=d09 を後半へ引き継ぎ。8字で分割。
// - 美咲 b342／b358 は17字で美咲の同率最長行（次点も17字の b388／b407／b436／b459／b485／b488）。
//   b342 は店長、元の jump=b146 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   b358 は悠太、元の jump=b266 を後半へ引き継ぎ。「、」の後（9字）で分割。
// 方式は qa/edit_d573_d576_d599_d620_d667_d711_b230_b234_b271_b280_b300_b302.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d931〜d932（優奈）・b858〜b859（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d712_d719_b342_b358.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd712', 'd931', 10, '今のは『帰さないで』', 'の意味です。'],
  ['yuna', 'd719', 'd932', 8, 'うちの館長らしい', 'と言えばらしい）'],
  ['misaki', 'b342', 'b858', 8, '毎回ね、ずっと。', '雨の日は必ず彼女で'],
  ['misaki', 'b358', 'b859', 9, '俺たちは、これから', 'どうなるんですか'],
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
console.log('OK: split d712->d931, d719->d932, b342->b858, b358->b859');
