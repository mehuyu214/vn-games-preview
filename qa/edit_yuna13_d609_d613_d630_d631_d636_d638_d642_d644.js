// W2 優奈の13字行 d609／d613／d630／d631／d636／d638／d642／d644 の分割（文面不変・分割のみ）
// 実測（qa/measure_yuna13_d609_d613_d630_d631_d636_d638_d642_d644.js）：
// - 優奈 13字行=36件。13字超え78件は全て地の文（name=""）のため分割対象外（前ランと同様、今回も機械確認済み）。
//   d609 は榊、元の jump=d185 を後半へ引き継ぎ。「会えた」（6字）で分割。
//   d613 は悠太、元の jump=d353 を後半へ引き継ぎ。「のが」（7字）で分割。
//   d630 は園田、元の jump=d842 を後半へ引き継ぎ。「さんが」（6字）で分割。
//   d631 は悠太、元の jump=d155 を後半へ引き継ぎ。「返っ」（7字）で分割。
//   d636 は悠太、元の jump=d388 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d638 は園田、元の jump=d409 を後半へ引き継ぎ。「から」（8字）で分割。
//   d642 は優奈、元の jump=d144 を後半へ引き継ぎ。face=serious・char=true を後半へ継承。「もの」（6字）で分割。
//   d644 は白鳥、元の jump=d155b を後半へ引き継ぎ。「かけ」（7字）で分割。
// 方式は qa/edit_yuna13_d555_d559_d563_d568_d569_d583_d595_d601.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d1127〜d1134（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_yuna13_d609_d613_d630_d631_d636_d638_d642_d644.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd609', 'd1127', 6, 'でも、会えた', 'からいい』って'],
  ['yuna', 'd613', 'd1128', 7, '自然に渡すのが', '一番ですね。'],
  ['yuna', 'd630', 'd1129', 6, '若い娘さんが', '勧めてくれた、'],
  ['yuna', 'd631', 'd1130', 7, '館長に跳ね返っ', 'てしまった）'],
  ['yuna', 'd636', 'd1131', 5, '最初から、', '同志だったんだ。'],
  ['yuna', 'd638', 'd1132', 8, 'いつか会えるから', '、ってね。'],
  ['yuna', 'd642', 'd1133', 6, '記録そのもの', 'を消したんです'],
  ['yuna', 'd644', 'd1134', 7, 'ずっと気にかけ', 'ていました。'],
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
console.log('OK: split d609->d1127, d613->d1128, d630->d1129, d631->d1130, d636->d1131, d638->d1132, d642->d1133, d644->d1134');
