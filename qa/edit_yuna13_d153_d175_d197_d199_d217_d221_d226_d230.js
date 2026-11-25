// W2 優奈の13字行 d153／d175／d197／d199／d217／d221／d226／d230 の分割（文面不変・分割のみ）
// 実測（qa/measure_yuna13_d153_d175_d197_d199_d217_d221_d226_d230.js）：
// - 優奈 13字行=84件。14字行は0件。13字を超える件は全て地の文のため分割対象外（前ランと同様）。
//   d153 は白鳥、元の jump=d664 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d175 は悠太、元の jump=d586 を後半へ引き継ぎ。「で」の後（7字）で分割。
//   d197 は榊、元の jump=d519 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d199 は榊、元の jump=d612 を後半へ引き継ぎ。「じゃ」の後（7字）で分割。
//   d217 は優奈、元の jump=d637 を後半へ引き継ぎ。face=serious・char=true を後半へ継承。「が」の後（6字）で分割。
//   d221 は園田、元の jump=d487 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d226 は優奈、元の jump=d674 を後半へ引き継ぎ。face=cry・char=true を後半へ継承。「、」の後（5字）で分割。
//   d230 は白鳥、元の jump=d709 を後半へ引き継ぎ。「、」の後（6字）で分割。
// 方式は qa/edit_misaki13_b836_b876_yuna13_first6.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d1079〜d1086（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_yuna13_d153_d175_d197_d199_d217_d221_d226_d230.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd153', 'd1079', 8, '閉館後のお茶は、', '格別です。'],
  ['yuna', 'd175', 'd1080', 7, '修理の端切れで', '作りました。'],
  ['yuna', 'd197', 'd1081', 7, '祖母の日記に、', 'ありました。'],
  ['yuna', 'd199', 'd1082', 7, '暴きたいんじゃ', 'ないんです。'],
  ['yuna', 'd217', 'd1083', 6, '中に、手紙が', '入っています。'],
  ['yuna', 'd221', 'd1084', 8, '……馬鹿だなあ、', '梓さんは。'],
  ['yuna', 'd226', 'd1085', 5, 'わたしは、', '直しただけです。'],
  ['yuna', 'd230', 'd1086', 6, '判子つきの、', 'とびきりです。'],
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
console.log('OK: split d153->d1079, d175->d1080, d197->d1081, d199->d1082, d217->d1083, d221->d1084, d226->d1085, d230->d1086');
