// W2 各作品の最長台詞の分割（文面不変・分割のみ）
// 実測（qa/measure_a35_a177_a194_d04_d121.js）：
// - 桜 a35／a177／a194 は48字で桜の最長行（次点 a150:47字）。いずれも句点の
//   区切りで2ノードに分割する。a194 は face=serious・char=true を後半へ継承。
// - 優奈 d04／d121 は47字で優奈の最長行（d135c／d143b／d170 も47字で同率だが
//   本ランは前ラン次回候補の d04／d121 のみ対象とし、残り3行は次回候補）。
//   d121 の配列上の後続は d121b（d122 は不存在）。
// 方式は qa/edit_a192_d90_d129_d149.js と同じ：前半ノードに jump、後半ノード
// （scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 新規ノード a301・a302・a303（桜）・d339・d340（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_a35_a177_a194_d04_d121.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

const SPLITS = [
  // [作品ID, 対象ID, 新規ID, 前半テキスト, 後半テキスト]
  ['sakura', 'a35', 'a301',
    'いえ。数十年前の未現像のロールを。',
    'もし保管されていれば、買い取りたい。金額は、言い値で構いません'],
  ['sakura', 'a177', 'a302',
    '先代が、我が家の不祥事を撮った。そう聞かされて、育ちました。',
    '父の代の、取り返しのつかない写真だと'],
  ['sakura', 'a194', 'a303',
    'うん。おじいちゃんの、最後の約束。わたしはずっと、守り番だったの。',
    '悠太が来るまで、誰にも渡さずに'],
  ['yuna', 'd04', 'd339',
    'おはようございます。数えるだけの簡単なお仕事、ですよね。',
    '張り切って来たんですけど、違いましたか'],
  ['yuna', 'd121', 'd340',
    '『本は、届くべき人の元へ届けること』。それが口癖でした。',
    '本は届けるものだ、と何度も聞きました。'],
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
console.log('OK: split a35->a301, a177->a302, a194->a303, d04->d339, d121->d340');
