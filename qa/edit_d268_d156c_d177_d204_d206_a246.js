// W2 各作品の最長台詞の分割（文面不変・分割のみ）
// 実測（qa/measure_d268_a246.js）：
// - 優奈 d268 は45字で優奈の最長行（前ラン次回候補）。d156c／d177／d204／d206 は
//   44字で同率次点。d268 は優奈（face=smile・char=true）、d177 は優奈
//   （face=shy・char=true）、d204 は優奈（face=serious・char=true）、d156c・d206 は
//   悠太（face・char なし）。いずれも句点の区切りで2ノードに分割する。
// - 桜 a246 は44字で桜の最長行（15:5x に a298 へ分割済みの前半ノード）。
//   a246 はさくら（face=serious・char=true、jump=a298）。
// 方式は qa/edit_d30_d35_d45_a154.js と同じ：前半ノードに jump、後半ノード
// （scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 新規ノード d349〜d353（優奈）・a308（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d268_d156c_d177_d204_d206_a246.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

const SPLITS = [
  // [作品ID, 対象ID, 新規ID, 前半テキスト, 後半テキスト]
  ['yuna', 'd268', 'd349',
    'ママが子供の頃に読んだ、大切な本なの。',
    'おばあちゃんが、読んでくれた本。悠太さん、閉館ですよ'],
  ['yuna', 'd156c', 'd350',
    '判子、押しておきました。『許可』の判子です。',
    '届ける許可は、館長が出します。あとは貴方次第'],
  ['yuna', 'd177', 'd351',
    '閉館ですよ、悠太さん。……今日は、帰りたくない気分ですけれど。',
    'もう少しだけ、ここにいたい'],
  ['yuna', 'd204', 'd352',
    '明日……はい、明日、渡します。決めました。',
    'もう、直すだけの日々は終わりです。逃げません。'],
  ['yuna', 'd206', 'd353',
    '園田さんはいつもの席。自然に渡すのが一番ですね。',
    '大げさな演出は、この物語には似合いません'],
  ['sakura', 'a246', 'a308',
    '悠太。わたし、嘘つかないから。今から言うのは、全部ほんと。',
    '好きです。ずっと、好きだった。'],
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
console.log('OK: split d268->d349, d156c->d350, d177->d351, d204->d352, d206->d353, a246->a308');
