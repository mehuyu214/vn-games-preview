// W2 優奈の13字行 d713／d714／d728／d730／d734／d739／d744／d750 の分割（文面不変・分割のみ）
// 実測（qa/measure_yuna13_d713_d714_d728_d730_d734_d739_d744_d750.js）：
// - 優奈 13字行=20件。13字超え78件は全て地の文（name=""）のため分割対象外（前ランで機械確認済み）。
//   d713 は優奈、元の jump=d477 を後半へ引き継ぎ。face=love・char=true を後半へ継承。「自分の気持ちにも、」（9字）で分割。
//   d714 は悠太、元の jump=d844 を後半へ引き継ぎ。「優奈さんのペース」（8字）で分割。
//   d728 は榊、元の jump=d162 を後半へ引き継ぎ。「……ありがとう、」（8字）で分割。
//   d730 は悠太、元の jump=d193c を後半へ引き継ぎ。「自分から切り出し」（8字）で分割。
//   d734 は悠太、元の jump=d363 を後半へ引き継ぎ。「もう十分にありま」（8字）で分割。
//   d739 は優奈、元の jump=d67 を後半へ引き継ぎ。face=smile・char=true を後半へ継承。「軽くなってしまい」（8字）で分割。
//   d744 は悠太、元の jump=d18 を後半へ引き継ぎ。「封がされたままの、」（9字）で分割。
//   d750 は悠太、元の jump=d248 を後半へ引き継ぎ。「告白に変わる日」（7字）で分割。
// 方式は qa/edit_yuna13_d652_d654_d662_d667_d695_d701_d703_d705.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d1143〜d1150（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_yuna13_d713_d714_d728_d730_d734_d739_d744_d750.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd713', 'd1143', 9, '自分の気持ちにも、', '正直に。'],
  ['yuna', 'd714', 'd1144', 8, '優奈さんのペース', 'でいこう、'],
  ['yuna', 'd728', 'd1145', 8, '……ありがとう、', 'ございます'],
  ['yuna', 'd730', 'd1146', 8, '自分から切り出し', 'た……！）'],
  ['yuna', 'd734', 'd1147', 8, 'もう十分にありま', 'したから。'],
  ['yuna', 'd739', 'd1148', 8, '軽くなってしまい', 'ますけれど'],
  ['yuna', 'd744', 'd1149', 9, '封がされたままの、', '古い手紙'],
  ['yuna', 'd750', 'd1150', 7, '告白に変わる日', 'が来るとは）'],
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
console.log('OK: split d713->d1143, d714->d1144, d728->d1145, d730->d1146, d734->d1147, d739->d1148, d744->d1149, d750->d1150');
