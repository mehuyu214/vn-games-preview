// W2 優奈の18字最長行（d485）＋美咲の19字最長行（b50／b52／b69／b99／b105）の分割（文面不変・分割のみ）
// 実測（qa/measure_d485_b50_b52_b69_b99_b105.js）：
// - 優奈 d485 は18字で優奈の同率最長行（次点も18字の d517／d520／d523／d543／d551／d555／d602）。
//   d485 は悠太、元の jump=d147 を後半へ引き継ぎ。「。」の後（4字）で分割。末尾に句点なしの原文のまま。
// - 美咲 b50／b52／b69／b99／b105 は19字で美咲の同率最長行（次点も19字の b112／b129／b131）。
//   b50 は相沢、元の jump=b478 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   b52 は相沢、元の jump=b294 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   b69 は悠太、元の jump=b536 を後半へ引き継ぎ。「。」の後（7字）で分割。
//   b99 は藤井、元の jump=b599 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   b105 は藤井、元の jump=b336 を後半へ引き継ぎ。「。」の後（10字）で分割。
// 方式は qa/edit_d388_d406_d410_d451_d457_d462_d475_b12_b16_b30.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d834（優奈）・b758〜b762（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d485_b50_b52_b69_b99_b105.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd485', 'd834', 4, 'ずっと。', '誰にも読まれず、誰にも届かず'],
  ['misaki', 'b50', 'b758', 5, '……ああ。', '本当に、まだあったんですね。'],
  ['misaki', 'b52', 'b759', 5, '違います。', '私は、あの男の……友人です。'],
  ['misaki', 'b69', 'b760', 7, '分かりました。', '話せる時で、いいですよ。'],
  ['misaki', 'b99', 'b761', 8, '車の中でずっと、', '窓の外を見て言ったの。'],
  ['misaki', 'b105', 'b762', 10, 'あとね、メモの住所。', '車に置いてったよ。'],
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
console.log('OK: split d485->d834, b50->b758, b52->b759, b69->b760, b99->b761, b105->b762');
