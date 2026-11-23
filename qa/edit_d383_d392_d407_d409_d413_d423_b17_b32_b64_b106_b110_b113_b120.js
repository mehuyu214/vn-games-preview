// W2 優奈の17字最長行（d383／d392／d407／d409／d413／d423）＋美咲の18字最長行（b17／b32／b64／b106／b110／b113／b120）の分割（文面不変・分割のみ）
// 実測（qa/measure_d383_d392_d407_d409_d413_d423_b17_b32_b64_b106_b110_b113_b120.js）：
// - 優奈 d383／d392／d407／d409／d413／d423 は17字で優奈の同率最長行（次点も17字の d425／d433）。
//   d383 は悠太、元の jump=d60 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d392 は優奈、face=sad・char=true を後半へ継承、元の jump=d279 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d407 は優奈、face=serious・char=true を後半へ継承、元の jump=d649 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   d409 は園田、元の jump=d224 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   d413 は優奈、face=smile・char=true を後半へ継承、元の jump=d276 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d423 は優奈、face=sad・char=true を後半へ継承、元の jump=d746 を後半へ引き継ぎ。「、」の後（5字）で分割。
// - 美咲 b17／b32／b64／b106／b110／b113／b120 は18字で美咲の同率最長行（次点も18字の b140）。
//   b17 は美咲、face=smile・char=true を後半へ継承、元の jump=b325 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   b32 は藤井、元の jump=b570 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b64 は美咲、face=sad・char=true を後半へ継承、元の jump=b312 を後半へ引き継ぎ。「。」の後（7字）で分割。
//   b106 は美咲、face=serious を後半へ継承、元の jump=b407 を後半へ引き継ぎ。「。」の後（7字）で分割。
//   b110 は美咲、face=serious・char=true を後半へ継承、元の jump=b486 を後半へ引き継ぎ。「…」の後（5字）で分割。
//   b113 は悠太、元の jump=b338 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   b120 は悠太、元の jump=b452 を後半へ引き継ぎ。「『」の後（6字）で分割。
// 方式は qa/edit_d352_d368_b605.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d869〜d874（優奈）・b796〜b802（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d383_d392_d407_d409_d413_d423_b17_b32_b64_b106_b110_b113_b120.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd383', 'd869', 8, '言葉にしない分、', '行動が正直な人だ）'],
  ['yuna', 'd392', 'd870', 8, 'わたしの言葉は、', 'まだ製本中なんです'],
  ['yuna', 'd407', 'd871', 5, '本当です。', '昨日は、嘘をつきました。'],
  ['yuna', 'd409', 'd872', 4, '半世紀、', '待ち続けた席なんだ、ここは'],
  ['yuna', 'd413', 'd873', 5, '隣にいる、', 'というのは大きなことです'],
  ['yuna', 'd423', 'd874', 5, '恋の手紙、', 'と言っていいと思います。'],
  ['misaki', 'b17', 'b796', 9, 'いらっしゃいませ。', 'どうぞ、こちらへ。'],
  ['misaki', 'b32', 'b797', 7, 'ん？　あんた、', 'どっかで見た顔だねえ。'],
  ['misaki', 'b64', 'b798', 7, '……悠太くん。', '今夜のことは、内緒ね。'],
  ['misaki', 'b106', 'b799', 7, '……藤井さん。', 'それ、個人情報ですよ。'],
  ['misaki', 'b110', 'b800', 5, '五年分\u2026\u2026', 'どこから見ればいいのかな。'],
  ['misaki', 'b113', 'b801', 4, '備考欄、', '他のページと字が違いますね。'],
  ['misaki', 'b120', 'b802', 6, '備考は……『', '持ち主来店まで永久保管。'],
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
console.log('OK: split d383->d869, d392->d870, d407->d871, d409->d872, d413->d873, d423->d874, b17->b796, b32->b797, b64->b798, b106->b799, b110->b800, b113->b801, b120->b802');
