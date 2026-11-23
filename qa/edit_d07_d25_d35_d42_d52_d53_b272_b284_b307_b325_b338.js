// W2 優奈の17字最長行（d07／d25／d35／d42／d52／d53）＋美咲の19字最長行（b272／b284／b307／b325／b338）の分割（文面不変・分割のみ）
// 実測（qa/measure_d07_d25_d35_d42_d52_d53_b272_b284_b307_b325_b338.js）：
// - 優奈 d07／d25／d35／d42／d52／d53 は17字で優奈の同率最長行（次点も17字の d58／d61）。
//   d07 は白鳥、元の jump=d414 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d25 は悠太、元の jump=d366 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d35 は優奈、元の jump=d347 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   d42 は優奈、元の jump=d367 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d52 は優奈、元の jump=d501 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d53 は悠太、元の jump=d397 を後半へ引き継ぎ。「、」の後（6字）で分割。
// - 美咲 b272／b284／b307／b325／b338 は19字で美咲の同率最長行（次点も19字の b341／b367／b401）。
//   b272 は美咲、元の jump=b517 を後半へ引き継ぎ。「。」の後（3字）で分割。
//   b284 は悠太、元の jump=b506 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   b307 は美咲、元の jump=b13 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   b325 は美咲、元の jump=b18 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   b338 は悠太、元の jump=b114 を後半へ引き継ぎ。「。」の後（9字）で分割。
// 方式は qa/edit_d641_d714_b206_b218_b266.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d845〜d850（優奈）・b774〜b778（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d07_d25_d35_d42_d52_d53_b272_b284_b307_b325_b338.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd07', 'd845', 5, '二人とも、', '始める前にお茶をどうぞ。'],
  ['yuna', 'd25', 'd846', 6, '……この本、', '目録に無いんですよね。'],
  ['yuna', 'd35', 'd847', 5, '……はい。', 'どうか、忘れてください。'],
  ['yuna', 'd42', 'd848', 6, '朝のことは、', '本当に忘れてください。'],
  ['yuna', 'd52', 'd849', 6, '園田さんは、', '毎週来る常連さんです。'],
  ['yuna', 'd53', 'd850', 6, '窓際の席の、', 'あのおじいさんですね。'],
  ['misaki', 'b272', 'b774', 3, 'うん。', 'わたしの全部、悠太くんにあげる。'],
  ['misaki', 'b284', 'b775', 6, '看板の字は、', '美咲さんが書いたやつです。'],
  ['misaki', 'b307', 'b776', 9, '……王冠みたいに。', 'ジャラジャラしてます'],
  ['misaki', 'b325', 'b777', 8, 'お買い物ですか。', 'それとも、何かお探しで'],
  ['misaki', 'b338', 'b778', 9, '濃い字で、丁寧な。', '誰かが後から書いた字'],
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
console.log('OK: split d07->d845, d25->d846, d35->d847, d42->d848, d52->d849, d53->d850, b272->b774, b284->b775, b307->b776, b325->b777, b338->b778');
