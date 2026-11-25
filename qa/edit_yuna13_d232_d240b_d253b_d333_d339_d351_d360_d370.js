// W2 優奈の13字行 d232／d240b／d253b／d333／d339／d351／d360／d370 の分割（文面不変・分割のみ）
// 実測（qa/measure_yuna13_d232_d240b_d253b_d333_d339_d351_d360_d370.js）：
// - 優奈 13字行=76件。14字行は0件。13字を超える件は全て地の文のため分割対象外（前ランと同様）。
//   d232 は榊、元の jump=d675 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d240b は優奈、元の jump=d710 を後半へ引き継ぎ。face=serious・char=true を後半へ継承。「わたし」の後（7字）で分割。
//   d253b は悠太、jump なし（次ノード d253c が後続）。「もっと」の後（6字）で分割。
//   d333 は優奈、元の jump=d590 を後半へ引き継ぎ。face=serious・char=true を後半へ継承。「、」の後（8字）で分割。
//   d339 は悠太、元の jump=d783 を後半へ引き継ぎ。「来た」の後（7字）で分割。
//   d351 は優奈、元の jump=d178 を後半へ引き継ぎ。face=shy・char=true を後半へ継承。「、」の後（7字）で分割。
//   d360 は白鳥、元の jump=d188 を後半へ引き継ぎ。「長い一」の後（7字）で分割。
//   d370 は優奈、元の jump=d646 を後半へ引き継ぎ。face=serious・char=true を後半へ継承。「、」の後（6字）で分割。
// 方式は qa/edit_yuna13_d153_d175_d197_d199_d217_d221_d226_d230.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d1087〜d1094（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_yuna13_d232_d240b_d253b_d333_d339_d351_d360_d370.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd232', 'd1087', 7, '……祖母さん、', 'よかったね。'],
  ['yuna', 'd240b', 'd1088', 7, 'だから、わたし', 'は言います。'],
  ['yuna', 'd253b', 'd1089', 6, 'うん。もっと', '近くに、行くよ'],
  ['yuna', 'd333', 'd1090', 8, '……閉館ですよ、', '悠太さん。'],
  ['yuna', 'd339', 'd1091', 7, '張り切って来た', 'んですけど、'],
  ['yuna', 'd351', 'd1092', 7, 'もう少しだけ、', 'ここにいたい'],
  ['yuna', 'd360', 'd1093', 7, '明日は、長い一', '日になります'],
  ['yuna', 'd370', 'd1094', 6, '除籍の印も、', '廃棄の記録も、'],
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
console.log('OK: split d232->d1087, d240b->d1088, d253b->d1089, d333->d1090, d339->d1091, d351->d1092, d360->d1093, d370->d1094');
