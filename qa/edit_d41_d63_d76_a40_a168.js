// W2 各作品の最長台詞の分割（文面不変・分割のみ）
// 実測（qa/measure_d41_d63_d76_a40_a168.js）：
// - 優奈 d41／d63／d76 は43字で優奈の最長行（d111／d155／d167c／d187／d195 も
//   43字で同率だが本ランは前ラン次回候補の3行のみ対象）。d41 は悠太
//   （face・char なし）、d63 は優奈（face=smile・char=true、jump=d67）、
//   d76 は白鳥（face・char なし）。いずれも句点の区切りで2ノードに分割する。
// - 桜 a40／a168 は37字で桜の最長行（次点 a05:36字）。a40 は悠太、
//   a168 は藤堂（いずれも face・char なし）。
// 方式は qa/edit_d268_d156c_d177_d204_d206_a246.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 新規ノード d354〜d356（優奈）・a309・a310（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d41_d63_d76_a40_a168.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

const SPLITS = [
  // [作品ID, 対象ID, 新規ID, 前半テキスト, 後半テキスト]
  ['yuna', 'd41', 'd354',
    '（出て行けと言いながら、どこか寂しそうだ。',
    'この人の『閉館』は、いつも少しだけ嘘くさい）'],
  ['yuna', 'd63', 'd355',
    '悠太さんは、本当に……ありがとう、ございます。',
    '言葉にすると、軽くなってしまいますけれど'],
  ['yuna', 'd76', 'd356',
    '園田さん、お茶をお持ちしましたよ。',
    '熱いので気をつけて。判子は要りません、お茶ですから。'],
  ['sakura', 'a40', 'a309',
    '（――嘘だ。今のは、嘘の顔だ）。',
    '（さくらは嘘がつけない。それが常識だった）'],
  ['sakura', 'a168', 'a310',
    '取引です。若い方には、強く聞こえるでしょう。',
    '私は、穏便に済ませたいだけです'],
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
console.log('OK: split d41->d354, d63->d355, d76->d356, a40->a309, a168->a310');
