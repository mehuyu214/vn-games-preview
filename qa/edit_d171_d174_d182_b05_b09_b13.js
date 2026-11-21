// W2 優奈の同率最長台詞（d171／d174／d182・22字）＋美咲の次点最長台詞（b05／b09／b13・25字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d171_d174_d182_b05_b09_b13.js）：
// - 優奈 d171／d174／d182 は22字で優奈の同率最長行（d184／d185c／d193／d199b／d216 も22字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d171 は悠太、元の jump=d456 を後半へ引き継ぎ。「『待った』」の後（14字）で分割。
//   d174 は優奈（face=surprise・char=true を後半へ継承）、元の jump=d495 を後半へ引き継ぎ。「。」の後（6字）で分割。
//   d182 は白鳥、元の jump=d406 を後半へ引き継ぎ。「、」の後（7字）で分割。
// - 美咲 b05／b09／b13 は25字で美咲の同率最長行（b27／b34／b65／b66／b99 も25字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   b05 は悠太、元の jump=b360 を後半へ引き継ぎ。「、」の後（11字）で分割。
//   b09 は悠太、元の jump=b324 を後半へ引き継ぎ。「。」の後（16字）で分割。
//   b13 は店長、元の jump=b442 を後半へ引き継ぎ。「。」の後（10字）で分割。
// 方式は qa/edit_d128_d136_d142_d153_d156c_b192_b228_b248_b263_b299.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d666〜d668（優奈）・b592〜b594（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d171_d174_d182_b05_b09_b13.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd171', 'd666', 14, '修理は、優奈さんの『待った』', 'だったんですね。'],
  ['yuna', 'd174', 'd667', 6, '栞、ですか。', '悠太さんが作ったんですか、これ。'],
  ['yuna', 'd182', 'd668', 7, 'これが梓さん、', 'そして窓際が若い園田さんです。'],
  ['misaki', 'b05', 'b592', 11, '（供養って言いながら、', 'もう箸が進んでるんですけど。'],
  ['misaki', 'b09', 'b593', 16, '店長、今ごろ帰ってきたんですか。', '傘、持ってました？'],
  ['misaki', 'b13', 'b594', 10, 'おっと、これは失敬。', '……まあ、なんとかなるっしょ。'],
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
console.log('OK: split d171->d666, d174->d667, d182->d668, b05->b592, b09->b593, b13->b594');
