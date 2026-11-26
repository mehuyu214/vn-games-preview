// W2 優奈の13字行 d766／d787／d792／d794／d828／d832／d857／d863 の分割（文面不変・分割のみ）
// 実測（qa/measure_yuna13_d766_d787_d792_d794_d828_d832_d857_d863.js）：
// - 優奈 13字行=12件。13字超え78件は全て地の文（name=""）のため分割対象外（前ランで機械確認済み）。
//   d766 は悠太、元の jump=d661 を後半へ引き継ぎ。「何度も何度も」（6字）で分割。
//   d787 は白鳥、元の jump=d156b を後半へ引き継ぎ。「その手が持って」（7字）で分割。
//   d792 は白鳥、元の jump=d08 を後半へ引き継ぎ。「日付も、ばっちり」（8字）で分割。
//   d794 は悠太、元の jump=d242 を後半へ引き継ぎ。「半世紀待った人」（7字）で分割。
//   d828 は白鳥、元の jump=d182b を後半へ引き継ぎ。「まだ二十代の頃」（7字）で分割。
//   d832 は優奈、元の jump=d327 を後半へ引き継ぎ。face=smile・char=true を後半へ継承。「わたしが選んで」（7字）で分割。
//   d857 は白鳥、元の jump=d417 を後半へ引き継ぎ。「押してほしくて」（7字）で分割。
//   d863 は悠太、元の jump=d529 を後半へ引き継ぎ。「半世紀の物語」（7字）で分割。
// 方式は qa/edit_yuna13_d713_d714_d728_d730_d734_d739_d744_d750.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d1151〜d1158（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_yuna13_d766_d787_d792_d794_d828_d832_d857_d863.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd766', 'd1151', 6, '何度も何度も', '借りてますね、'],
  ['yuna', 'd787', 'd1152', 7, 'その手が持って', 'いるんです。'],
  ['yuna', 'd792', 'd1153', 8, '日付も、ばっちり', '入ってます'],
  ['yuna', 'd794', 'd1154', 7, '半世紀待った人', 'たちがいる）'],
  ['yuna', 'd828', 'd1155', 7, 'まだ二十代の頃', 'の写真です。'],
  ['yuna', 'd832', 'd1156', 7, 'わたしが選んで', 'おきました。'],
  ['yuna', 'd857', 'd1157', 7, '押してほしくて', '呼びました。'],
  ['yuna', 'd863', 'd1158', 6, '半世紀の物語', 'に決着がつく。'],
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
console.log('OK: split d766->d1151, d787->d1152, d792->d1153, d794->d1154, d828->d1155, d832->d1156, d857->d1157, d863->d1158');
