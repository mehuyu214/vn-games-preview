// W2 優奈の同率最長台詞（d221／d226／d227・35字）＋美咲の同率最長台詞（b87／b93・35字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d221_d226_d227_b87_b93.js）：
// - 優奈 d221／d226／d227 は35字で優奈の同率最長行（次点 d03／d78／d88／d104／d114:34字）。
//   d221 は園田、後続は d221b。「。」の後で分割。
//   d226 は優奈（face=cry・char=true を後半へ継承）、後続は d227（本ランで同時分割）。2つ目の「。」の後で分割。
//   d227 は園田、後続は d228。2つ目の「。」の後で分割。
// - 美咲 b87／b93 は35字で美咲の同率最長行（b99／b106／b107／b111／b125／b126 も35字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   b87 は美咲（face=sad を後半へ継承）、後続は b88。2つ目の「。」の後で分割。
//   b93 は美咲（face=sad を後半へ継承）、後続は b94。2つ目の「。」の後で分割。
// 方式は qa/edit_d146_d182b_b48_b56_b75_b76_b78_b81.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d487〜d489（優奈）・b404〜b405（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d221_d226_d227_b87_b93.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd221', 'd487', 13, '……馬鹿だなあ、梓さんは。', '本当に、馬鹿だ。わしも、同じ馬鹿だったのに。'],
  ['yuna', 'd226', 'd488', 22, 'わたしは、直しただけです。本当に、それだけ。', '届けたのは、祖母の勇気です'],
  ['yuna', 'd227', 'd489', 21, '届けたのも、あんただ。若い人は、偉いねえ。', 'わしたちの分まで、ありがとう'],
  ['misaki', 'b87', 'b404', 26, 'お礼も言えなかったの。気づいたら、もう雨の中だった。', '走って行っちゃって'],
  ['misaki', 'b93', 'b405', 26, '……あの人、今どうしてるんだろう。元気でいるのかな。', '傘、返せてないのに'],
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
  secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split d221->d487, d226->d488, d227->d489, b87->b404, b93->b405');
