// W2 各作品の最長台詞の分割（文面不変・分割のみ）
// 実測（qa/measure_d13_d22_d25_d42_d44_d95_b52.js）：
// - 優奈 d13／d22／d25／d42／d44／d95 は42字で優奈の最長行（d143／d145b も42字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   d22 は優奈（face=serious・char=true）、d42 は優奈（face=sad・char=true）、d44 は優奈（face=serious・char=true）。
//   d13／d25 は悠太、d95 は榊（いずれも face・char・jump なし、配列上の後続へ進む）。
// - 美咲 b52 は41字で美咲の最長行（次点 b03／b16／b181／b276:40字）。
//   b52 は相沢（face・char・jump なし）。
// 方式は qa/edit_d225_d243b_a142.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 新規ノード d364〜d369（優奈）・b294（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d13_d22_d25_d42_d44_d95_b52.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

const SPLITS = [
  // [作品ID, 対象ID, 新規ID, 前半テキスト, 後半テキスト]
  ['yuna', 'd13', 'd364',
    '優奈さん、この本……目録に載ってないみたいです。',
    '台帳と二回、照らし合わせたんですけど'],
  ['yuna', 'd22', 'd365',
    'お願いです、悠太さん。今すぐ、その本を返して。',
    '理由は、あとで……いえ、今は言えません'],
  ['yuna', 'd25', 'd366',
    '……この本、目録に無いんですよね。',
    'それは事実で、目録に無い本は、本来ここに無いはずで'],
  ['yuna', 'd42', 'd367',
    '朝のことは、本当に忘れてください。',
    '何も、無かったんです。無かったことに、してください'],
  ['yuna', 'd44', 'd368',
    'わたしは、規則を守る司書です。それは変わりません。',
    '司書である前に、規則を守る人間です'],
  ['yuna', 'd95', 'd369',
    '祖母は昔、ここの司書でした。名前は、榊梓と言います。',
    '知っている方は、もう少ないそうで'],
  ['misaki', 'b52', 'b294',
    '違います。私は、あの男の……友人です。',
    '知人、と言うべきか。……本人では、ありません'],
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
console.log('OK: split d13->d364, d22->d365, d25->d366, d42->d367, d44->d368, d95->d369, b52->b294');
