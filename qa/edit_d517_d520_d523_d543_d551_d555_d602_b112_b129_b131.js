// W2 優奈の18字最長行（d517／d520／d523／d543／d551／d555／d602）＋美咲の19字最長行（b112／b129／b131）の分割（文面不変・分割のみ）
// 実測（qa/measure_d517_d520_d523_d543_d551_d555_d602_b112_b129_b131.js）：
// - 優奈 d517／d520／d523／d543／d551／d555／d602 は18字で優奈の同率最長行（次点も18字の d630）。
//   d517 は優奈、元の jump=d15 を後半へ引き継ぎ。「？」の後（9字）で分割。
//   d520 は園田、元の jump=d219 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   d523 は悠太、元の jump=d282 を後半へ引き継ぎ。「。」の後（6字）で分割。
//   d543 は悠太、元の jump=d339 を後半へ引き継ぎ。「、」の後（13字）で分割。
//   d551 は優奈、元の jump=d169 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d555 は悠太、元の jump=d444 を後半へ引き継ぎ。「、」の後（13字）で分割。
//   d602 は優奈、元の jump=d402 を後半へ引き継ぎ。「、」の後（6字）で分割。
// - 美咲 b112／b129／b131 は19字で美咲の同率最長行（次点も19字の b148／b158／b181／b183／b205）。
//   b112 は美咲、元の jump=b337 を後半へ引き継ぎ。「。」の後（6字）で分割。
//   b129 は悠太、元の jump=b687 を後半へ引き継ぎ。「ば」の後（10字）で分割（末尾の「、」直前での分割は避ける）。
//   b131 は店長、元の jump=b579 を後半へ引き継ぎ。「、」の後（5字）で分割。
// 方式は qa/edit_d485_b50_b52_b69_b99_b105.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d835〜d841（優奈）・b763〜b765（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d517_d520_d523_d543_d551_d555_d602_b112_b129_b131.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd517', 'd835', 9, '何かありましたか？', '　本のことで、何か'],
  ['yuna', 'd520', 'd836', 8, '……梓さんから。', 'まさか、そんなことが'],
  ['yuna', 'd523', 'd837', 6, '修理の続き。', '言える日まで、隣にいます'],
  ['yuna', 'd543', 'd838', 13, '数えるだけの簡単なお仕事、', 'ですよね。'],
  ['yuna', 'd551', 'd839', 6, '直すことは、', '渡す決意と表裏でしたから'],
  ['yuna', 'd555', 'd840', 13, '廃棄から守ってたんですね、', 'あの本を。'],
  ['yuna', 'd602', 'd841', 6, '……ですが、', 'ご用件だけなら伺います。'],
  ['misaki', 'b112', 'b763', 6, '……あった。', '『木製柄の傘、紙袋同封』。'],
  ['misaki', 'b129', 'b764', 9, '（名言っぽく言えば', '済むと思ってる顔だ、'],
  ['misaki', 'b131', 'b765', 5, '二人とも、', 'ちょっと聞いてほしいっしょ。'],
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
console.log('OK: split d517->d835, d520->d836, d523->d837, d543->d838, d551->d839, d555->d840, d602->d841, b112->b763, b129->b764, b131->b765');
