// W2 優奈の同率最長台詞（d51／d98／d104／d121／d128・19字）＋美咲の同率最長台詞（b238／b247・22字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d51_d98_d104_d121_d128_b238_b247.js）：
// - 優奈 d51／d98／d104／d121／d128 は19字で優奈の同率最長行（次点も19字の d129／d134b／d141）。
//   d51 は悠太、元の jump=d329 を後半へ引き継ぎ。「宛てた」の後（11字）で分割。
//   d98 は悠太、元の jump=d451 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   d104 は優奈（face=serious・char=true を後半へ継承）、元の jump=d493 を後半へ引き継ぎ。「、」の後（11字）で分割。
//   d121 は白鳥、元の jump=d548 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   d128 は悠太、元の jump=d661 を後半へ引き継ぎ。「、」の後（6字）で分割。
// - 美咲 b238／b247 は22字で美咲の同率最長行（次点も22字の b264／b267／b276／b277／b294／b311）。
//   b238 は悠太、元の jump=b433 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   b247 は美咲（face=sad を後半へ継承）、元の jump=b499 を後半へ引き継ぎ。「、」の後（14字）で分割。
// 方式は qa/edit_d43_d45_d49_b95_b102_b129_b180_b195_b203.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d762〜d766（優奈）・b691〜b692（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d51_d98_d104_d121_d128_b238_b247.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd51', 'd762', 11, '園田さんって人に宛てた', '手紙でしたよね。'],
  ['yuna', 'd98', 'd763', 4, '（館長、', 'ルールがお茶基準すぎるだろう。'],
  ['yuna', 'd104', 'd764', 11, '榊梓。わたしの祖母で、', '先代の司書です。'],
  ['yuna', 'd121', 'd765', 4, '『本は、', '届くべき人の元へ届けること』。'],
  ['yuna', 'd128', 'd766', 6, '同じ詩集を、', '何度も何度も借りてますね、'],
  ['misaki', 'b238', 'b691', 9, '（店長、その台詞、', '今日だけは文句なしに許す。'],
  ['misaki', 'b247', 'b692', 14, '傘は……まだ、預かってても、', 'いいですか……。'],
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
console.log('OK: split d51->d762, d98->d763, d104->d764, d121->d765, d128->d766, b238->b691, b247->b692');
