// W2 優奈の残る最長台詞と美咲の最長台詞の分割（文面不変・分割のみ）
// 実測（qa/measure_d217_d223_b03_b16_b181_b276.js）：
// - 優奈 d217／d223 は42字で優奈の最長行（前ランで d143／d145b／d147／d156／d184／d194／d199b／d213 を分割済み）。
//   d217 は優奈（face=serious・char=true）、d223 は園田（face・char・jump なし、配列上の後続 d223b へ進む）。
// - 美咲 b03／b16／b181／b276 は40字で美咲の最長行（次点 b06／b47／b77／b102:39字）。
//   b03 は悠太、b16 は相沢（いずれも face・char・jump なし）、b181 は美咲（face=sad）、b276 は美咲（face=ecstasy）。
// 方式は qa/edit_d143_d145b_d147_d156_d184_d194_d199b_d213.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 新規ノード d378・d379（優奈）、b295〜b298（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d217_d223_b03_b16_b181_b276.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

const SPLITS = [
  // [作品ID, 対象ID, 新規ID, 前半テキスト, 後半テキスト]
  ['yuna', 'd217', 'd378',
    '中に、手紙が入っています。開けてみてください。',
    '園田さんに宛てた、たった一通の手紙です'],
  ['yuna', 'd223', 'd379',
    'わしも言えなかった。だから通い続けたんだ、この席に。',
    '会える理由が、欲しかったんだよ。'],
  ['misaki', 'b03', 'b295',
    'お、いいですね。いただきます。今日はなんのお弁当ですか。',
    '唐揚げなら当たりの日です'],
  ['misaki', 'b16', 'b296',
    '……すみません。少し、よろしいですか。',
    'レジの方、少々お時間をいただきたいのですが'],
  ['misaki', 'b181', 'b297',
    '『雨の日は、傘を貸せる人間であれ』……これ、父の言葉だ。',
    'この字、お父さんの字だよ'],
  ['misaki', 'b276', 'b298',
    'ああっ……悠太くん、悠太くん……大好き……！',
    '　中で……いいの、そのまま出して……'],
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
console.log('OK: split d217->d378, d223->d379, b03->b295, b16->b296, b181->b297, b276->b298');
