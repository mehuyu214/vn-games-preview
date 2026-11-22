// W2 優奈の18字最長行（d258b）＋美咲の20字最長行（b244／b265／b312／b330／b331／b344／b374）の分割（文面不変・分割のみ）
// 実測（qa/measure_d258b_b244_b265_b312_b330_b331_b344_b374.js）：
// - 優奈 d258b は18字で優奈の同率最長行（次点も18字の d260／d341／d343／d357／d362／d364／d375）。
//   d258b は優奈（face=ecstasy・char=true・r18=true を後半へ継承）、元の jump=d549 を後半へ引き継ぎ。「、」の後（9字）で分割。
// - 美咲 b244／b265／b312／b330／b331／b344／b374 は20字で美咲の同率最長行（次点も20字の b393）。
//   b244 は美咲（face=shy を後半へ継承）、元の jump=b384 を後半へ引き継ぎ。「……」の後（10字）で分割。
//   b265 は悠太、元の jump=b358 を後半へ引き継ぎ。「……」の後（10字）で分割。
//   b312 は美咲（face=sad・char=true を後半へ継承）、元の jump=b65 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   b330 は相沢、元の jump=b43 を後半へ引き継ぎ。「。」の後（11字）で分割。末尾に句点なしの原文のまま。
//   b331 は藤井、元の jump=b46 を後半へ引き継ぎ。「。」の後（8字）で分割。末尾に句点なしの原文のまま。
//   b344 は美咲（face=sad を後半へ継承）、元の jump=b154 を後半へ引き継ぎ。「。」の後（10字）で分割。末尾に句点なしの原文のまま。
//   b374 は藤井、元の jump=b163 を後半へ引き継ぎ。「。」の後（8字）で分割。末尾に句点なしの原文のまま。
// 方式は qa/edit_d147_d156_d201_d204b_d204c_d205_d245_b233.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d818（優奈）・b742〜b748（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d258b_b244_b265_b312_b330_b331_b344_b374.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd258b', 'd818', 9, 'もっと……近くに、', '感じていたいです。'],
  ['misaki', 'b244', 'b742', 10, 'うん。聞かせて。……', '閉店したら、うちで。'],
  ['misaki', 'b265', 'b743', 10, '終わりに、って。……', 'じゃあ、これからは。'],
  ['misaki', 'b312', 'b744', 9, '誰にも言わないで。', '店長にも、藤井さんにも'],
  ['misaki', 'b330', 'b745', 11, '若い方なのに、夜勤で。', '五年と聞きましたが'],
  ['misaki', 'b331', 'b746', 8, '変わってるねえ。', '晴れの日はどこにいるのさ'],
  ['misaki', 'b344', 'b747', 10, '五年、守ってくれて。', 'シフトも、傘も、全部'],
  ['misaki', 'b374', 'b748', 8, '耳寄り情報だよ。', '今度ホテルに送った時にね'],
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
console.log('OK: split d258b->d818, b244->b742, b265->b743, b312->b744, b330->b745, b331->b746, b344->b747, b374->b748');
