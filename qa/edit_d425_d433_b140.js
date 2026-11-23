// W2 優奈の17字最長行（d425／d433）＋美咲の18字最長行（b140）の分割（文面不変・分割のみ）
// 実測（qa/measure_d425_d433_b140.js）：
// - 優奈 d425／d433 は17字で優奈の同率最長行（次点も17字の d441／d460／d481／d518／d533／d540）。
//   d425 は園田、元の jump=d217 を後半へ引き継ぎ。「、」の後（13字）で分割。
//   d433 は悠太、元の jump=d158 を後半へ引き継ぎ。「、」の後（7字）で分割。
// - 美咲 b140 は18字で美咲の同率最長行（次点も18字の b143／b157／b182／b186／b199／b225／b253）。
//   b140 は美咲、face=sad を後半へ継承、元の jump=b341 を後半へ引き継ぎ。「。」の後（5字）で分割。
// 方式は qa/edit_d383_d392_d407_d409_d413_d423_b17_b32_b64_b106_b110_b113_b120.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d875〜d876（優奈）・b803（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d425_d433_b140.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd425', 'd875', 13, 'ずっと気になっていたんだ、', 'この本は'],
  ['yuna', 'd433', 'd876', 7, 'お茶と判子で、', '人の背中を押す人だ）'],
  ['misaki', 'b140', 'b803', 5, '……店長。', '台帳の備考、知ってますか。'],
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
console.log('OK: split d425->d875, d433->d876, b140->b803');
