// W2 優奈の18字最長行（d630）＋美咲の19字最長行（b148／b158／b181／b183／b205）の分割（文面不変・分割のみ）
// 実測（qa/measure_d630_b148_b158_b181_b183_b205.js）：
// - 優奈 d630 は18字で優奈の同率最長行（次点も18字の d641／d714）。
//   d630 は園田、元の jump=d418 を後半へ引き継ぎ。「、」の後（13字）で分割。
// - 美咲 b148／b158／b181／b183／b205 は19字で美咲の同率最長行（次点も19字の b206／b218／b266）。
//   b148 は悠太、元の jump=b458 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   b158 は美咲、元の jump=b531 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   b181 は美咲、元の jump=b549 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   b183 は美咲、元の jump=b462 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b205 は美咲、元の jump=b465 を後半へ引き継ぎ。「。」の後（7字）で分割。
// 方式は qa/edit_d517_d520_d523_d543_d551_d555_d602_b112_b129_b131.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d842（優奈）・b766〜b770（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d630_b148_b158_b181_b183_b205.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd630', 'd842', 13, '若い娘さんが勧めてくれた、', '詩集一冊。'],
  ['misaki', 'b148', 'b766', 6, '店長の口癖、', '今日は全然出てきませんね。'],
  ['misaki', 'b158', 'b767', 5, '待ちます。', '五年間、そうしてきたんです。'],
  ['misaki', 'b181', 'b768', 6, '『雨の日は、', '傘を貸せる人間であれ』……'],
  ['misaki', 'b183', 'b769', 5, 'お父さん、', '五年前の春に亡くなってるの。'],
  ['misaki', 'b205', 'b770', 7, '……来るかな。', '本当に、来てくれるかな。'],
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
console.log('OK: split d630->d842, b148->b766, b158->b767, b181->b768, b183->b769, b205->b770');
