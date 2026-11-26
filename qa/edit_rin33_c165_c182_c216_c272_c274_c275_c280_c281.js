// W2 凛の33字行 c165／c182／c216／c272／c274／c275／c280／c281 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin33_c165_c182_c216_c272_c274_c275_c280_c281.js）：
// - 凛の台詞の最長は33字（8件：c165・c182・c216・c272・c274・c275・c280・c281）。34字以上は0件。桜の台詞31字以上は0件。
//   c165 は真壁、元の後続は c166。「ふうん。……健闘を祈るよ、」（13字）で分割。
//   c182 は凛、元の後続は c183。「小野寺、やめなさい。」（10字）で分割。
//   c216 は悠太、元の後続は c217。「小野寺さんは座っててください。」（15字）で分割。
//   c272 は凛、元の後続は c273。「悠太、報告がある。」（9字）で分割。
//   c274 は凛、元の後続は c275。「責任の取り方も込みでね。」（12字）で分割。
//   c275 は悠太、元の後続は c276。「俺は。……俺は、どうなるんですか、」（17字）で分割。
//   c280 は小野寺、元の後続は c281。「せ、先輩！　本当に行っちゃうんですかぁ、」（20字）で分割。
//   c281 は凛、元の後続は c282。「小野寺、泣くな。」（8字）で分割。
// 方式は qa/edit_rin33_c76_c78_c79_c84_c95_c100_c139_c142.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c335〜c342（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin33_c165_c182_c216_c272_c274_c275_c280_c281.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c165', 'c335', 13, 'ふうん。……健闘を祈るよ、', '本番で会おう、助手くん、楽しみにしてる。'],
  ['rin', 'c182', 'c336', 10, '小野寺、やめなさい。', '今は、その時じゃ——お願い、やめて、頼むから。'],
  ['rin', 'c216', 'c337', 15, '小野寺さんは座っててください。', '凛さんは大丈夫です、絶対に、信じて。'],
  ['rin', 'c272', 'c338', 9, '悠太、報告がある。', '来春から、他大学のポストに行くわ、私、決めたの。'],
  ['rin', 'c274', 'c339', 12, '責任の取り方も込みでね。', '研究室は続く。それでいいのよ、皆のために。'],
  ['rin', 'c275', 'c340', 17, '俺は。……俺は、どうなるんですか、', '凛さん、俺のことは、どうなるの。'],
  ['rin', 'c280', 'c341', 20, 'せ、先輩！　本当に行っちゃうんですかぁ、', '嘘ですよね、冗談ですよね！'],
  ['rin', 'c281', 'c342', 8, '小野寺、泣くな。', 'これは誤差じゃないわ、決定なのよ、もう決まったの。'],
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
console.log('OK: split c165->c335, c182->c336, c216->c337, c272->c338, c274->c339, c275->c340, c280->c341, c281->c342');
