// W2 優奈の16字最長行（d16／d24）＋美咲の18字最長行（b421）の分割（文面不変・分割のみ）
// 実測（qa/measure_d16_d24_b421.js）：
// - 優奈 d16／d24 は16字で優奈の同率最長行（次点も16字の d112／d119／d155b／d160／d172／d186）。
//   d16 は優奈、face=serious・char=true を後半へ継承、元の jump=d427 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d24 は優奈、face=sad・char=true を後半へ継承、元の jump=d596 を後半へ引き継ぎ。「、」の後（9字）で分割。
// - 美咲 b421 は18字で美咲の同率最長行（次点も18字の b432／b451／b477／b487／b503／b507／b512）。
//   b421 は美咲、face=surprise を後半へ継承、元の jump=b176 を後半へ引き継ぎ。「。」の後（8字）で分割。
// 方式は qa/edit_d604_d619_d625_d655_d721_d741_b285_b298_b299_b320_b336_b337_b390.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d891〜d892（優奈）・b819（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d16_d24_b421.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd16', 'd891', 7, '貸出カードは、', '入っていましたか？'],
  ['yuna', 'd24', 'd892', 9, '見なかったことに、', 'してください。'],
  ['misaki', 'b421', 'b819', 8, '開くよ、本当に。', '……中、何か入ってる'],
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
console.log('OK: split d16->d891, d24->d892, b421->b819');
