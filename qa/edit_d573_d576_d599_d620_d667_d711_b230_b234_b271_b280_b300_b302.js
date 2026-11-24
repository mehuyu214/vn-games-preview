// W2 優奈の16字最長行（d573／d576／d599／d620／d667／d711）＋美咲の17字最長行（b230／b234／b271／b280／b300／b302）の分割（文面不変・分割のみ）
// 実測（qa/measure_d573_d576_d599_d620_d667_d711_b230_b234_b271_b280_b300_b302.js）：
// - 優奈 d573／d576／d599／d620／d667／d711 は16字で優奈の同率最長行（次点も16字の d712／d719）。
//   d573 は園田、元の jump=d379 を後半へ引き継ぎ。「、」の後（11字）で分割。
//   d576 は白鳥、元の jump=d76b を後半へ引き継ぎ。「、」の後（9字）で分割。
//   d599 は悠太、元の jump=d383 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d620 は優奈、元の jump=d216 を後半へ引き継ぎ。「、」の後（9字）で分割。face=sad・char=true を後半へ継承。
//   d667 は優奈、元の jump=d495 を後半へ引き継ぎ。「、」の後（13字）で分割。face=surprise・char=true を後半へ継承。
//   d711 は優奈、元の jump=d332 を後半へ引き継ぎ。「、」の後（6字）で分割。face=shy・char=true を後半へ継承。
// - 美咲 b230／b234／b271／b280／b300／b302 は17字で美咲の同率最長行（次点も17字の b342／b358）。
//   b230 は相沢、元の jump=b432 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   b234 は相沢、元の jump=b674 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b271 は悠太、元の jump=b504 を後半へ引き継ぎ。「、」の後（10字）で分割。r18=true を後半へ継承。
//   b280 は美咲、元の jump=b617 を後半へ引き継ぎ。「、」の後（11字）で分割。face=sleepy・char=true を後半へ継承。
//   b300 は悠太、元の jump=b48 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   b302 は美咲、元の jump=b103 を後半へ引き継ぎ。「、」の後（8字）で分割。face=surprise を後半へ継承。
// 方式は qa/edit_d547_d558_b223_b226.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d925〜d930（優奈）・b852〜b857（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d573_d576_d599_d620_d667_d711_b230_b234_b271_b280_b300_b302.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd573', 'd925', 11, 'だから通い続けたんだ、', 'この席に。'],
  ['yuna', 'd576', 'd926', 9, '判子は要りません、', 'お茶ですから。'],
  ['yuna', 'd599', 'd927', 7, '彼女の中では、', 'きっと同じことだ。'],
  ['yuna', 'd620', 'd928', 9, '園田さんが借りた、', '最後の詩集です'],
  ['yuna', 'd667', 'd929', 13, '悠太さんが作ったんですか、', 'これ。'],
  ['yuna', 'd711', 'd930', 6, '悠太さんは、', '本当に優しいですね。'],
  ['misaki', 'b230', 'b852', 6, '……この傘、', '確かに受け取りました。'],
  ['misaki', 'b234', 'b853', 5, '雨の日に、', '誰かを待つためではなく、'],
  ['misaki', 'b271', 'b854', 10, '美咲さん……本当に、', 'いいんですか。'],
  ['misaki', 'b280', 'b855', 11, '……悠太くんの腕の中、', 'あったかい。'],
  ['misaki', 'b300', 'b856', 10, '……偶然か？　いや、', '出来すぎてる）'],
  ['misaki', 'b302', 'b857', 8, '誰に。藤井さん、', '本当にそう言ったの'],
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
console.log('OK: split d573->d925, d576->d926, d599->d927, d620->d928, d667->d929, d711->d930, b230->b852, b234->b853, b271->b854, b280->b855, b300->b856, b302->b857');
