// W2 優奈の18字最長行（d260／d341／d343／d357／d362／d364／d375）＋美咲の20字最長行（b393）の分割（文面不変・分割のみ）
// 実測（qa/measure_d260_d341_d343_d357_d362_d364_d375_b393.js）：
// - 優奈 d260／d341／d343／d357／d362／d364／d375 は18字で優奈の同率最長行（次点も18字の d385）。
//   d260 は優奈（face=pleasure・char=true・r18=true を後半へ継承）、元の jump=d515 を後半へ引き継ぎ。「……」の後（6字）で分割。
//   d341 は園田、元の jump=d136 を後半へ引き継ぎ。「。」の後（6字）で分割。末尾に句点なしの原文のまま。
//   d343 は優奈（face=sad・char=true を後半へ継承）、元の jump=d171 を後半へ引き継ぎ。「、」の後（10字）で分割。末尾に句点なしの原文のまま。
//   d357 は白鳥、元の jump=d112 を後半へ引き継ぎ。「、」の後（7字）で分割。末尾に句点なしの原文のまま。
//   d362 は園田、元の jump=d225b を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d364 は悠太、元の jump=d14 を後半へ引き継ぎ。「、」の後（6字）で分割。末尾に句点なしの原文のまま。
//   d375 は優奈（face=serious・char=true を後半へ継承）、元の jump=d553 を後半へ引き継ぎ。「、」の後（6字）で分割。
// - 美咲 b393 は20字で美咲の同率最長行（次点も20字の b444／b475／b540／b598／b612）。
//   b393 は美咲（face=serious を後半へ継承）、元の jump=b24 を後半へ引き継ぎ。「。」の後（11字）で分割。末尾に句点なしの原文のまま。
// 方式は qa/edit_d258b_b244_b265_b312_b330_b331_b344_b374.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d819〜d825（優奈）・b749（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d260_d341_d343_d357_d362_d364_d375_b393.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd260', 'd819', 6, '見ないで……', 'いえ、見ていてください。'],
  ['yuna', 'd341', 'd820', 6, '梓さんはね。', '伝言ひとつ、残せなかった'],
  ['yuna', 'd343', 'd821', 10, '修理中という言葉は、', 'とても便利でした'],
  ['yuna', 'd357', 'd822', 7, 'お茶は三人分、', 'たっぷり淹れてあります'],
  ['yuna', 'd362', 'd823', 7, '手紙ってのは、', '届けば負けないんだな。'],
  ['yuna', 'd364', 'd824', 6, '台帳と二回、', '照らし合わせたんですけど'],
  ['yuna', 'd375', 'd825', 6, 'それだけは、', 'どうか分かってください。'],
  ['misaki', 'b393', 'b749', 11, 'お願い、すぐ戻るから。', '……お願い、聞いて'],
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
console.log('OK: split d260->d819, d341->d820, d343->d821, d357->d822, d362->d823, d364->d824, d375->d825, b393->b749');
