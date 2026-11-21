// W2 優奈の次点最長台詞（d47／d64／d89・22字）＋美咲の同率最長台詞（b124／b126・26字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d47_d64_d89_b124_b126.js）：
// - 優奈 d47／d64／d89 は22字で優奈の同率最長行（d94／d97／d103／d105／d114 も22字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d47 は悠太、元の jump=d334 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d64 は優奈（face=sad・char=true を後半へ継承）、元の jump=d466 を後半へ引き継ぎ。「……」の後（10字）で分割。
//   d89 は優奈（face=smile・char=true を後半へ継承）、元の jump=d468 を後半へ引き継ぎ。「。」の後（9字）で分割。
// - 美咲 b124／b126 は26字で美咲の同率最長行（b131／b139／b143／b149／b164／b179 も26字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   b124 は美咲（face=serious・char=true を後半へ継承）、元の jump=b454 を後半へ引き継ぎ。「。」の後（12字）で分割。
//   b126 は美咲（face=sad を後半へ継承）、元の jump=b411 を後半へ引き継ぎ。「。」の後（14字）で分割。
// 方式は qa/edit_d363_d370_d397_d399_d407_b75_b78_b81_b87_b93_b114.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d650〜d652（優奈）・b577〜b578（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d47_d64_d89_b124_b126.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd47', 'd650', 8, '目録に無い本を、', '数か月も直し続けるんですか。'],
  ['yuna', 'd64', 'd651', 10, '任せる、だなんて……', 'それは、少しずるいです。'],
  ['yuna', 'd89', 'd652', 9, 'ご用件を、どうぞ。', 'お力になれることでしたら。'],
  ['misaki', 'b124', 'b577', 12, '……店長に、聞いてみる。', '傘のこと、知ってるはずだよ。'],
  ['misaki', 'b126', 'b578', 14, 'ううん。……雨の日に、聞く。', '直接、顔を見て聞きたい。'],
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
console.log('OK: split d47->d650, d64->d651, d89->d652, b124->b577, b126->b578');
