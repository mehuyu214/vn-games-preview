// W2 各作品の最長台詞の分割（文面不変・分割のみ）
// 実測（qa/measure_d135c_d143b_d170_a150.js）：
// - 優奈 d135c／d143b／d170 は47字で優奈の最長行（次点 d135／d197:46字）。
//   d135c は園田の台詞、d143b・d170 は優奈の台詞で face・char を後半へ継承。
// - 桜 a150 は47字で桜の最長行（次点 a170／a221:45字）。face=smile・char=true
//   を後半へ継承。いずれも句点の区切りで2ノードに分割する。
// 方式は qa/edit_a35_a177_a194_d04_d121.js と同じ：前半ノードに jump、後半ノード
// （scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 新規ノード d341・d342・d343（優奈）・a304（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d135c_d143b_d170_a150.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

const SPLITS = [
  // [作品ID, 対象ID, 新規ID, 前半テキスト, 後半テキスト]
  ['yuna', 'd135c', 'd341',
    '気づいたら手元にあって。謝りに来たら、もう辞めていたんだ。',
    '梓さんはね。伝言ひとつ、残せなかった'],
  ['yuna', 'd143b', 'd342',
    '未返却で、本当は処分されるはずでした。規則では。',
    '祖母は館長の権限で、記録そのものを消したんです'],
  ['yuna', 'd170', 'd343',
    'わたしも同じでした。直している間は、渡さなくて済むんです。',
    '修理中という言葉は、とても便利でした'],
  ['sakura', 'a150', 'a304',
    'うん。……おじいちゃんはね。絶対に開けるな、って言ったフィルムを。',
    'わたしに、預けたの。死ぬ前に'],
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
console.log('OK: split d135c->d341, d143b->d342, d170->d343, a150->a304');
