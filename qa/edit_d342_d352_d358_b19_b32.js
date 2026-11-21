// W2 優奈の同率最長台詞（d342／d352／d358・23字）＋美咲の次点最長台詞（b19／b32・26字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d342_d352_d358_b19_b32.js）：
// - 優奈 d342／d352／d358 は23字で優奈の同率最長行（d363／d370／d397／d399／d407 も23字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d342 は優奈（face=serious・char=true を後半へ継承）、元の jump=d144 を後半へ引き継ぎ。「権限で、」の読点の後（10字）で分割。
//   d352 は優奈（face=serious・char=true を後半へ継承）、元の jump=d204b を後半へ引き継ぎ。1つ目の「。」の後（17字）で分割。
//   d358 は白鳥、元の jump=d155b を後半へ引き継ぎ。「だけは、」の読点の後（10字）で分割。
// - 美咲 b19／b32 は26字で美咲の次点最長行（b75／b78／b81／b87／b93／b114 も26字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   b19 は悠太、元の jump=b392 を後半へ引き継ぎ。「？」＋全角スペースの後（12字）で分割。
//   b32 は藤井、元の jump=b396 を後半へ引き継ぎ。1つ目の「。」の後（18字）で分割。
// 方式は qa/edit_d217_d223b_d253_d275c_d335_b211_b229_b262_b290_b301_b310.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d642〜d644（優奈）・b569〜b570（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d342_d352_d358_b19_b32.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd342', 'd642', 10, '祖母は館長の権限で、', '記録そのものを消したんです'],
  ['yuna', 'd352', 'd643', 17, 'もう、直すだけの日々は終わりです。', '逃げません。'],
  ['yuna', 'd358', 'd644', 10, 'あの本のことだけは、', 'ずっと気にかけていました。'],
  ['misaki', 'b19', 'b569', 12, '（あの雨の日の傘……？　', 'そんな商品、うちにあったか。'],
  ['misaki', 'b32', 'b570', 18, 'ん？　あんた、どっかで見た顔だねえ。', '五、六年前かな。'],
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
console.log('OK: split d342->d642, d352->d643, d358->d644, b19->b569, b32->b570');
