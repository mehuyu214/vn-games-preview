// W2 優奈の13字行 d555／d559／d563／d568／d569／d583／d595／d601 の分割（文面不変・分割のみ）
// 実測（qa/measure_yuna13_d555_d559_d563_d568_d569_d583_d595_d601.js）：
// - 優奈 13字行=44件。13字超え78件は全て地の文（name=""・d01等）のため分割対象外（前ランと同様）。
//   d555 は悠太、元の jump=d840 を後半へ引き継ぎ。「守って」（8字）で分割。
//   d559 は優奈、元の jump=d359 を後半へ引き継ぎ。face=smile・char=true を後半へ継承。「、」の後（6字）で分割。
//   d563 は園田、元の jump=d467 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d568 は悠太、元の jump=d883 を後半へ引き継ぎ。「の」（6字）で分割。
//   d569 は悠太、元の jump=d386 を後半へ引き継ぎ。「じゃない」（6字）で分割。
//   d583 は榊、元の jump=d492 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d595 は悠太、元の jump=d394 を後半へ引き継ぎ。「記録」（6字）で分割。
//   d601 は悠太、元の jump=d447 を後半へ引き継ぎ。「何十年」（6字）で分割。
// 方式は qa/edit_yuna13_d497_d519_d522_d525_d530_d539_d543_d550.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d1119〜d1126（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_yuna13_d555_d559_d563_d568_d569_d583_d595_d601.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd555', 'd1119', 7, '廃棄から守って', 'たんですね、'],
  ['yuna', 'd559', 'd1120', 6, '人と違って、', '正直ですから。'],
  ['yuna', 'd563', 'd1121', 5, 'でも席は、', '空いてたからね。'],
  ['yuna', 'd568', 'd1122', 6, 'カウンターの', '上で止まった。'],
  ['yuna', 'd569', 'd1123', 7, '本だけじゃない', '気がします。'],
  ['yuna', 'd583', 'd1124', 5, '聞くだけ、', '聞いてください。'],
  ['yuna', 'd595', 'd1125', 6, 'この本の記録', 'が無いんです。'],
  ['yuna', 'd601', 'd1126', 5, 'もう何十年', 'になるんだろう。'],
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
console.log('OK: split d555->d1119, d559->d1120, d563->d1121, d568->d1122, d569->d1123, d583->d1124, d595->d1125, d601->d1126');
