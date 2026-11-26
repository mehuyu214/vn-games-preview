// W2 優奈の13字行 d872／d880／d886／d888 の分割（文面不変・分割のみ）
// 実測（qa/measure_yuna13_d872_d880_d886_d888.js）：
// - 優奈 13字行=4件（これが最後の4件）。13字超え78件は全て地の文（name=""）のため分割対象外（前ランで機械確認済み）。
//   d872 は園田、元の jump=d224 を後半へ引き継ぎ。「待ち続けた席なんだ、」（10字）で分割。
//   d880 は優奈、元の jump=d197 を後半へ引き継ぎ。face=sad・char=true を後半へ継承。「本の中で眠っていた」（9字）で分割。
//   d886 は優奈、元の jump=d148 を後半へ引き継ぎ。face=cry・char=true を後半へ継承。「半分だけ」（4字）で分割。
//   d888 は悠太、元の jump=d452 を後半へ引き継ぎ。「梓さんって」（5字）で分割。
// 方式は qa/edit_yuna13_d766_d787_d792_d794_d828_d832_d857_d863.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d1159〜d1162（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_yuna13_d872_d880_d886_d888.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd872', 'd1159', 10, '待ち続けた席なんだ、', 'ここは'],
  ['yuna', 'd880', 'd1160', 9, '本の中で眠っていた', '告白です'],
  ['yuna', 'd886', 'd1161', 4, '半分だけ', '足りなかったんです'],
  ['yuna', 'd888', 'd1162', 5, '梓さんって', '言いましたよね。'],
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
console.log('OK: split d872->d1159, d880->d1160, d886->d1161, d888->d1162');
