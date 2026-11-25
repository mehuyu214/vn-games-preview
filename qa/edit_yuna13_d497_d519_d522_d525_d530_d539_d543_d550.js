// W2 優奈の13字行 d497／d519／d522／d525／d530／d539／d543／d550 の分割（文面不変・分割のみ）
// 実測（qa/measure_yuna13_d497_d519_d522_d525_d530_d539_d543_d550.js）：
// - 優奈 13字行=52件。13字超え78件は全て地の文（name=""・d01等）のため分割対象外（前ランと同様）。
//   d497 は悠太、元の jump=d270 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   d519 は榊、元の jump=d798 を後半へ引き継ぎ。文末が「、」のため「『言えなかった」（7字）で分割。
//   d522 は優奈、元の jump=d277 を後半へ引き継ぎ。face=sad・char=true を後半へ継承。「、」の後（6字）で分割。
//   d525 は優奈、元の jump=d49 を後半へ引き継ぎ。face=shy・char=true を後半へ継承。「、」の後（6字）で分割。
//   d530 は榊、元の jump=d202 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d539 は白鳥、元の jump=d752 を後半へ引き継ぎ。文末が「、」のため「お茶にまで」（5字）で分割。
//   d543 は悠太、元の jump=d838 を後半へ引き継ぎ。文末が「、」のため「数えるだけの」（6字）で分割。
//   d550 は優奈、元の jump=d267 を後半へ引き継ぎ。face=smile・char=true を後半へ継承。「、」の後（5字）で分割。
// 方式は qa/edit_yuna13_d431_d438_d447_d459_d471_d484_d488_d496.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d1111〜d1118（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_yuna13_d497_d519_d522_d525_d530_d539_d543_d550.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd497', 'd1111', 4, '判子も、', '押してもらいました'],
  ['yuna', 'd519', 'd1112', 7, '『言えなかった', 'ことだけが、'],
  ['yuna', 'd522', 'd1113', 6, '届けるのは、', '祖母の言葉だけ'],
  ['yuna', 'd525', 'd1114', 6, '本のことも、', 'わたしのことも'],
  ['yuna', 'd530', 'd1115', 5, 'その方は、', '今もこの図書館に'],
  ['yuna', 'd539', 'd1116', 5, 'お茶にまで', '判子を押したら、'],
  ['yuna', 'd543', 'd1117', 6, '数えるだけの', '簡単なお仕事、'],
  ['yuna', 'd550', 'd1118', 5, 'この言葉、', 'ママが大好きなの'],
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
console.log('OK: split d497->d1111, d519->d1112, d522->d1113, d525->d1114, d530->d1115, d539->d1116, d543->d1117, d550->d1118');
