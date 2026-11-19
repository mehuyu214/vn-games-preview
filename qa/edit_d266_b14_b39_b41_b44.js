// W2 優奈の同率最長台詞（d266・28字）＋美咲の次点最長台詞（b14／b39／b41／b44・33字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d266_b14_b39_b41_b44.js）：
// - 優奈 d266 は28字で優奈の同率最長行（d331／d347／d375 も28字で同率だが本ランは前ラン次回候補の1行のみ対象）。
//   d266 は優奈（face=smile・char=true を後半へ継承）、後続は d267。1つ目の「。」の後で分割。
// - 美咲 b14／b39／b41／b44 は33字で美咲の同率最長行（次点は33字多数）。
//   b14 は悠太、後続は b15。1つ目の「。」の後で分割。
//   b39 は美咲（face=sad を後半へ継承）、後続は b40。2つ目の「。」の後で分割。
//   b41 は美咲、元の jump=b48 を後半へ引き継ぎ。1つ目の「。」の後で分割。
//   b44 は相沢、後続は b45。2つ目の「。」の後で分割。
// 方式は qa/edit_d04_d21_d71_d102_d113b_d121_d258b_b269_b270_b283_b289.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d550（優奈）・b474〜b477（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d266_b14_b39_b41_b44.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd266', 'd550', 15, '『物語は、誰かの心に住むの』。', 'この言葉、ママが大好きなの'],
  ['misaki', 'b14', 'b474', 24, '（二回言えば大抵のことは解決すると思ってる人だ。', '王冠の件も含めて）'],
  ['misaki', 'b39', 'b475', 13, '違うの。ほら、柄のところ。', '木でできてる、重い傘だよ。安物じゃないの'],
  ['misaki', 'b41', 'b476', 12, '悠太くんには、後で話す。', '今は……ごめんね、先に行って。レジ、お願い'],
  ['misaki', 'b44', 'b477', 15, '……そうですか。五年、ですか。', '……ずっと、雨の日に。……そうですか'],
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
console.log('OK: split d266->d550, b14->b474, b39->b475, b41->b476, b44->b477');
