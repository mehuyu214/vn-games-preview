// W2 優奈の13字行 d652／d654／d662／d667／d695／d701／d703／d705 の分割（文面不変・分割のみ）
// 実測（qa/measure_yuna13_d652_d654_d662_d667_d695_d701_d703_d705.js）：
// - 優奈 13字行=28件。13字超え78件は全て地の文（name=""）のため分割対象外（機械確認済み）。
//   d652 は優奈、元の jump=d468 を後半へ引き継ぎ。face=smile・char=true を後半へ継承。「お力になれる」（6字）で分割。
//   d654 は榊、元の jump=d526 を後半へ引き継ぎ。「どうか、手がかり」（8字）で分割。
//   d662 は悠太、元の jump=d455 を後半へ引き継ぎ。「それが、あの詩集」（8字）で分割。
//   d667 は優奈、元の jump=d929 を後半へ引き継ぎ。face=surprise・char=true を後半へ継承。「悠太さんが作った」（8字）で分割。
//   d695 は優奈、元の jump=d461 を後半へ引き継ぎ。face=smile・char=true を後半へ継承。「……三万冊までは」（8字）で分割。
//   d701 は悠太、元の jump=d449 を後半へ引き継ぎ。「まさに、あの詩集」（8字）で分割。
//   d703 は悠太、元の jump=d473 を後半へ引き継ぎ。「こうして生まれた」（8字）で分割。
//   d705 は白鳥、元の jump=d474 を後半へ引き継ぎ。「ちょうどお茶の時間」（9字）で分割。
// 方式は qa/edit_yuna13_d609_d613_d630_d631_d636_d638_d642_d644.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d1135〜d1142（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_yuna13_d652_d654_d662_d667_d695_d701_d703_d705.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd652', 'd1135', 6, 'お力になれる', 'ことでしたら。'],
  ['yuna', 'd654', 'd1136', 8, 'どうか、手がかり', 'だけでも。'],
  ['yuna', 'd662', 'd1137', 8, 'それが、あの詩集', 'のことだ。'],
  ['yuna', 'd667', 'd1138', 8, '悠太さんが作った', 'んですか、'],
  ['yuna', 'd695', 'd1139', 8, '……三万冊までは', '、ですが。'],
  ['yuna', 'd701', 'd1140', 8, 'まさに、あの詩集', 'のことだ。'],
  ['yuna', 'd703', 'd1141', 8, 'こうして生まれた', 'んですね。'],
  ['yuna', 'd705', 'd1142', 9, 'ちょうどお茶の時間', 'ですよ。'],
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
console.log('OK: split d652->d1135, d654->d1136, d662->d1137, d667->d1138, d695->d1139, d701->d1140, d703->d1141, d705->d1142');
