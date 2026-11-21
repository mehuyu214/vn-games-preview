// W2 優奈の同率最長台詞（d94／d97／d103／d105／d114・22字）＋美咲の同率最長台詞（b131／b139／b143／b149／b164／b179・26字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d94_d97_d103_d105_d114_b131_b139_b143_b149_b164_b179.js）：
// - 優奈 d94／d97／d103／d105／d114 は22字で優奈の同率最長行（d116／d118／d127 も22字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   d94 は優奈（face=sad・char=true を後半へ継承）、元の jump=d469 を後半へ引き継ぎ。「。」の後（13字）で分割。
//   d97 は榊、元の jump=d526 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   d103 は悠太、元の jump=d452 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   d105 は悠太、元の jump=d430 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d114 は悠太、元の jump=d494 を後半へ引き継ぎ。「。」の後（14字）で分割。
// - 美咲 b131／b139／b143／b149／b164／b179 は26字で美咲の同率最長行（b186／b190 も26字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   b131 は店長、元の jump=b316 を後半へ引き継ぎ。「。」の後（19字）で分割。
//   b139 は店長、元の jump=b340 を後半へ引き継ぎ。「。」の後（13字）で分割。
//   b143 は店長、jumpなし（後続は配列順で b144）。「。」の後（18字）で分割。
//   b149 は店長、元の jump=b304 を後半へ引き継ぎ。「』は、」の後（16字）で分割。
//   b164 は藤井、元の jump=b419 を後半へ引き継ぎ。「。」の後（17字）で分割。
//   b179 は美咲（face=surprise を後半へ継承）、元の jump=b422 を後半へ引き継ぎ。「。」の後（12字）で分割。
// 方式は qa/edit_d47_d64_d89_b124_b126.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d653〜d657（優奈）・b579〜b584（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d94_d97_d103_d105_d114_b131_b139_b143_b149_b164_b179.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd94', 'd653', 13, '……お力には、なれません。', '申し訳ありません。'],
  ['yuna', 'd97', 'd654', 9, '孫の、榊悠真です。', 'どうか、手がかりだけでも。'],
  ['yuna', 'd103', 'd655', 5, '優奈さん。', '今の人、梓さんって言いましたよね。'],
  ['yuna', 'd105', 'd656', 8, 'じゃあ榊さんは、', '優奈さんの従兄弟ってことに。'],
  ['yuna', 'd114', 'd657', 14, '館長だったんですか、梓さん。', '司書じゃなくて。'],
  ['misaki', 'b131', 'b579', 19, '二人とも、ちょっと聞いてほしいっしょ。', '大事な話だよ。'],
  ['misaki', 'b139', 'b580', 13, 'まあ、なんとかなるっしょ。', '……なんとか、しないとね。'],
  ['misaki', 'b143', 'b581', 18, '前の店主から、傘ごと引き継いだんだ。', 'この店と一緒にね'],
  ['misaki', 'b149', 'b582', 16, '『まあ、なんとかなるっしょ』は、', '前の店主の口癖だよ。'],
  ['misaki', 'b164', 'b583', 17, 'あの人、来月、海外に行くんだって。', '長くだよ、たぶん。'],
  ['misaki', 'b179', 'b584', 12, 'もう一枚、紙が入ってる。', '……小さい字で、びっしりと。'],
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
console.log('OK: split d94->d653, d97->d654, d103->d655, d105->d656, d114->d657, b131->b579, b139->b580, b143->b581, b149->b582, b164->b583, b179->b584');
