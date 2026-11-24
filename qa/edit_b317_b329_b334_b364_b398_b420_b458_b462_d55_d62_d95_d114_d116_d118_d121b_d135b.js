// W2 美咲の最長行（b317／b329／b334／b364／b398／b420／b458／b462、15字）＋優奈の最長行（d55／d62／d95／d114／d116／d118／d121b／d135b、14字）の分割（文面不変・分割のみ）
// 実測（qa/measure_b317_b329_b334_b364_b398_b420_b458_b462_d55_d62_d95_d114_d116_d118_d121b_d135b.js）：
// - 美咲 b317／b329／b334／b364／b398／b420／b458／b462 は15字で美咲の最長行（31件同率の先頭8件）。
//   b317 は藤井、元の jump=b161 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b329 は美咲、元の jump=b650 を後半へ引き継ぎ。「、」の後（7字）で分割。face=sad・char=true を後半へ継承。
//   b334 は美咲、元の jump=b55 を後半へ引き継ぎ。「、」の後（8字）で分割。face=surprise を後半へ継承。
//   b364 は相沢、元の jump=b56 を後半へ引き継ぎ。「。」の後（6字）で分割。
//   b398 は美咲、元の jump=b49 を後半へ引き継ぎ。「。」の後（9字）で分割。face=serious・char=true を後半へ継承。
//   b420 は美咲、元の jump=b166 を後半へ引き継ぎ。「、」の後（5字）で分割。face=surprise・char=true を後半へ継承。
//   b458 は悠太、元の jump=b149 を後半へ引き継ぎ。「。」の後（4字）で分割。
//   b462 は美咲、元の jump=b184 を後半へ引き継ぎ。「。」の後（7字）で分割。face=cry を後半へ継承。
// - 優奈 d55／d62／d95／d114／d116／d118／d121b／d135b は14字で優奈の最長行（67件同率の先頭8件）。
//   d55 は悠太、元の jump=d598 を後半へ引き継ぎ。「届ければいい」の後（6字）で分割。
//   d62 は悠太、元の jump=d581 を後半へ引き継ぎ。「から」の後（8字）で分割。
//   d95 は榊、元の jump=d567 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d114 は悠太、元の jump=d657 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   d116 は優奈、元の jump=d658 を後半へ引き継ぎ。「、」の後（3字）で分割。face=surprise・char=true を後半へ継承。
//   d118 は優奈、元の jump=d659 を後半へ引き継ぎ。「、」の後（3字）で分割。face=angry・char=true を後半へ継承。
//   d121b は白鳥、元の jump=d628 を後半へ引き継ぎ。「。」の後（3字）で分割。
//   d135b は優奈、jump なし（後続は配列次ノード d135c）で分割。「、」の後（6字）で分割。face=surprise・char=true を後半へ継承。
// 方式は qa/edit_b208_..._d54.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b938〜b945（美咲）・d1003〜d1010（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_b317_b329_b334_b364_b398_b420_b458_b462_d55_d62_d95_d114_d116_d118_d121b_d135b.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b317', 'b938', 5, '　この辺、', '夜はあたしの庭なのに'],
  ['misaki', 'b329', 'b939', 7, '……よかった、', '本当によかった。'],
  ['misaki', 'b334', 'b940', 8, '元気なんですか、', '教えてください'],
  ['misaki', 'b364', 'b941', 6, 'ありがとう。', '本当に、ありがとう'],
  ['misaki', 'b398', 'b942', 9, '間違いないですか。', '木の柄の、傘'],
  ['misaki', 'b420', 'b943', 5, '藤井さん、', '本当なんですか、それ'],
  ['misaki', 'b458', 'b944', 4, '珍しい。', '本気の話ってことですか'],
  ['misaki', 'b462', 'b945', 7, '事故で、急に。', '何の前触れもなく'],
  ['yuna', 'd55', 'd1003', 6, '届ければいい', 'じゃないですか、'],
  ['yuna', 'd62', 'd1004', 8, '一人で抱えるから', '重いんです。'],
  ['yuna', 'd95', 'd1005', 5, '祖母は昔、', 'ここの司書でした。'],
  ['yuna', 'd114', 'd1006', 10, '館長だったんですか、', '梓さん。'],
  ['yuna', 'd116', 'd1007', 3, '館長、', 'ご存じだったんですか。'],
  ['yuna', 'd118', 'd1008', 3, 'なぜ、', '止めなかったんですか。'],
  ['yuna', 'd121b', 'd1009', 3, 'ええ。', 'お茶、もう一杯どうぞ。'],
  ['yuna', 'd135b', 'd1010', 6, '……祖母の、', '若い頃の話ですね'],
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
console.log('OK: split b317->b938, b329->b939, b334->b940, b364->b941, b398->b942, b420->b943, b458->b944, b462->b945, d55->d1003, d62->d1004, d95->d1005, d114->d1006, d116->d1007, d118->d1008, d121b->d1009, d135b->d1010');
