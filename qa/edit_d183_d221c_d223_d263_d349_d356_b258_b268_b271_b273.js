// W2 優奈の同率最長台詞（d183／d221c／d223／d263／d349／d356・26字）＋美咲の同率最長台詞（b258／b268／b271／b273・33字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d183_d221c_d223_d263_d349_d356_b258_b268_b271_b273.js）：
// - 優奈 d183／d221c／d223／d263／d349／d356 は26字で優奈の同率最長行（次点は25字多数）。
//   d183 は優奈（face=sad・char=true を後半へ継承）、元の jump=d421 を後半へ引き継ぎ。1つ目の「。」の後（15字）で分割。
//   d221c は園田、元の jump=d390 を後半へ引き継ぎ。1つ目の「。」の後（12字）で分割。
//   d223 は園田、元の jump=d379 を後半へ引き継ぎ。1つ目の「。」の後（10字）で分割。
//   d263 は優奈（face=smile・char=true を後半へ継承）、元の jump=d411 を後半へ引き継ぎ。1つ目の「。」の後（14字）で分割。
//   d349 は優奈（face=smile・char=true を後半へ継承）、元の jump=d269 を後半へ引き継ぎ。1つ目の「。」の後（16字）で分割（文末に「。」なし）。
//   d356 は白鳥、元の jump=d76b を後半へ引き継ぎ。1つ目の「。」の後（10字）で分割。
// - 美咲 b258／b268／b271／b273 は33字で美咲の同率最長行（b284／b292 も33字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b258 は美咲（face=smile・char=true を後半へ継承）、後続は b259。2つ目の「。」の後（12字）で分割（文末に「。」なし）。
//   b268 は美咲（face=love を後半へ継承）、後続は b269。1つ目の「。」の後（15字）で分割（文末に「。」なし）。
//   b271 は悠太、後続は b272。1つ目の「。」の後（17字）で分割（文末に「。」なし）。
//   b273 は悠太、後続は b274。1つ目の「。」の後（12字）で分割（文末に「。」なし）。
// 方式は qa/edit_d149b_b246_b247_b250_b256.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d571〜d576（優奈）・b502〜b505（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d183_d221c_d223_d263_d349_d356_b258_b268_b271_b273.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd183', 'd571', 15, 'なぜ、言えなかったんでしょう。', 'あんなに近かったのに。'],
  ['yuna', 'd221c', 'd572', 12, 'わしも、同じだったのに。', '言えなかったのは、わしもだ。'],
  ['yuna', 'd223', 'd573', 10, 'わしも言えなかった。', 'だから通い続けたんだ、この席に。'],
  ['yuna', 'd263', 'd574', 14, 'ふふ、それは規則違反ですよ。', '……特別に、許可します。'],
  ['yuna', 'd349', 'd575', 16, 'おばあちゃんが、読んでくれた本。', '悠太さん、閉館ですよ'],
  ['yuna', 'd356', 'd576', 10, '熱いので気をつけて。', '判子は要りません、お茶ですから。'],
  ['misaki', 'b258', 'b502', 12, '悠太くん。廃棄、出たよ。', '供養しよう、二人で。今日は唐揚げが余ってる'],
  ['misaki', 'b268', 'b503', 15, '悠太くんじゃなきゃ、だめなの。', '分かってるくせに。何度も言わせないで'],
  ['misaki', 'b271', 'b504', 17, '美咲さん……本当に、いいんですか。', '最後まで、本当に。後悔しませんか'],
  ['misaki', 'b273', 'b505', 12, '美咲さん、綺麗です……。', '目、逸らさないでください。ずっと見ていたい'],
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
console.log('OK: split d183->d571, d221c->d572, d223->d573, d263->d574, d349->d575, d356->d576, b258->b502, b268->b503, b271->b504, b273->b505');
