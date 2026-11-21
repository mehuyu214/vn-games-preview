// W2 優奈の同率最長台詞（d226／d232／d240・22字）＋美咲の同率最長台詞（b104／b119／b136・25字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d226_d232_d240_b104_b119_b136.js）：
// - 優奈 d226／d232／d240 は22字で優奈の同率最長行（d252／d258／d277／d330／d336 も22字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d226 は優奈（face=cry・char=true を後半へ継承）、元の jump=d488 を後半へ引き継ぎ。「。」の後（13字）で分割。
//   d232 は榊、元の jump=d440 を後半へ引き継ぎ。「。」の後（13字）で分割。
//   d240 は優奈（face=serious・char=true を後半へ継承）、元の jump=d410 を後半へ引き継ぎ。「。」の後（12字）で分割。
// - 美咲 b104／b119／b136 は25字で美咲の同率最長行（b137／b152／b168／b178／b196 も25字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   b104 は悠太、元の jump=b369 を後半へ引き継ぎ。「に」の後（12字）で分割。
//   b119 は美咲（face=serious を後半へ継承）、元の jump=b371 を後半へ引き継ぎ。「』」の後（12字）で分割。
//   b136 は店長、元の jump=b455 を後半へ引き継ぎ。「。」の後（10字）で分割。
// 方式は qa/edit_d184_d185c_d193_d199b_d216_b27_b34_b65_b66_b99.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d674〜d676（優奈）・b600〜b602（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d226_d232_d240_b104_b119_b136.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd226', 'd674', 13, 'わたしは、直しただけです。', '本当に、それだけ。'],
  ['yuna', 'd232', 'd675', 13, '……祖母さん、よかったね。', '本当に、よかった。'],
  ['yuna', 'd240', 'd676', 12, '悠太さん、話があります。', '今日中に、言います。'],
  ['misaki', 'b104', 'b600', 12, '（寝たふりって、運転手に', 'はバレバレなんですけどね。'],
  ['misaki', 'b119', 'b601', 12, '『木製柄の傘、紙袋同封』', '……これだね、間違いない。'],
  ['misaki', 'b136', 'b602', 10, 'オーナーの都合でね。', 'おれも、先週聞いたばかりだよ。'],
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
console.log('OK: split d226->d674, d232->d675, d240->d676, b104->b600, b119->b601, b136->b602');
