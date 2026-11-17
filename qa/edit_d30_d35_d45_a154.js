// W2 各作品の最長台詞の分割（文面不変・分割のみ）
// 実測（qa/measure_d30_d35_d45_a154.js）：
// - 優奈 d30／d35／d45 は45字で優奈の最長行（d268 も45字で同率だが本ランは
//   前ラン次回候補の3行のみ対象。d268 は次回候補に残す）。
//   d30 は優奈（face=shy・char=true）、d35 は優奈（face=sad・char=true・jump=d36）、
//   d45 は悠太（face・char なし）。いずれも句点の区切りで2ノードに分割する。
// - 桜 a154 は44字で桜の最長行（a246 も44字だが分割済みの前半ノード）。
//   a154 はさくら（face=smile・char=true）。
// 方式は qa/edit_d135_d197_a170_a221.js と同じ：前半ノードに jump、後半ノード
// （scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 新規ノード d346・d347・d348（優奈）・a307（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d30_d35_d45_a154.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

const SPLITS = [
  // [作品ID, 対象ID, 新規ID, 前半テキスト, 後半テキスト]
  ['yuna', 'd30', 'd346',
    '……ありがとう、ございます。',
    '悠太さんは、優しい方ですね。疑いもせず、本を返してくれるなんて'],
  ['yuna', 'd35', 'd347',
    '……はい。どうか、忘れてください。',
    'お願いします。悠太さんにだけは、迷惑をかけたくないんです'],
  ['yuna', 'd45', 'd348',
    'その司書さんが、朝は本を隠したんです。俺から。',
    '規則より大事な何かがあった、ってことですよね'],
  ['sakura', 'a154', 'a307',
    'フィルムの一枚目に写ってる人。その人が来たら、',
    '渡すか開けるかは。その人と、決めなさいって'],
];

for (const [gid, id, newId, first, second] of SPLITS) {
  const g = GAMES.find(x => x.id === gid);
  const idx = g.scenes.findIndex(n => n.id === id);
  if (idx < 0) throw new Error(`not found: ${id}`);
  const node = g.scenes[idx];
  if (node.text !== first + second) throw new Error(`text mismatch: ${id}`);
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
console.log('OK: split d30->d346, d35->d347, d45->d348, a154->a307');
