// W2 優奈の同率最長台詞（d230／d240b・21字）＋美咲の同率最長台詞（b146／b154／b163・24字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d230_d240b_b146_b154_b163.js）：
// - 優奈 d230／d240b は21字で優奈の同率最長行（次点は21字の d244／d246／d253c／d257／d269／d275）。
//   d230 は白鳥、元の jump=d496 を後半へ引き継ぎ。「。」の後（13字）で分割。
//   d240b は優奈（face=serious・char=true を後半へ継承）、元の jump=d441 を後半へ引き継ぎ。「。」の後（13字）で分割。
// - 美咲 b146／b154／b163 は24字で美咲の同率最長行（次点は24字の b182／b184／b185／b187／b200）。
//   b146 は美咲（face=sad を後半へ継承）、元の jump=b457 を後半へ引き継ぎ。「。」の後（16字）で分割。
//   b154 は店長、元の jump=b373 を後半へ引き継ぎ。「。」の後（14字）で分割。
//   b163 は悠太、元の jump=b345 を後半へ引き継ぎ。「。」の後（7字）で分割。
// 方式は qa/edit_d144_d149_d151_d157_d204_d227_b88_b107_b122_b142_b144.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d709〜d710（優奈）・b635〜b637（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d230_d240b_b146_b154_b163.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd230', 'd709', 13, '判子つきの、とびきりです。', 'お任せください。'],
  ['yuna', 'd240b', 'd710', 13, 'だから、わたしは言います。', 'わたしの言葉で。'],
  ['misaki', 'b146', 'b635', 16, '……どうして、黙ってたんですか。', '五年も、ずっと。'],
  ['misaki', 'b154', 'b636', 14, '礼は、傘を返せてからにしな。', 'それが筋ってもんさ。'],
  ['misaki', 'b163', 'b637', 7, '耳寄り、って。', '藤井さんの情報はいつも半分噂で……'],
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
console.log('OK: split d230->d709, d240b->d710, b146->b635, b154->b636, b163->b637');
