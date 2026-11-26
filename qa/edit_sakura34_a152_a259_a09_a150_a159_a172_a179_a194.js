// W2 桜の最長台詞 a152／a259（34字）／a09／a150／a159／a172／a179／a194（33字）の分割（文面不変・分割のみ）
// 実測（qa/measure_sakura14.js）：
// - 桜の台詞の最長は34字（a152・a259 の2件）、次が33字（9件）。優奈・美咲は台詞13字以下まで完了済み。
//   優奈の14字超え78件・桜の地の文は全て name="" の地の文のため分割対象外。
//   a152 は桜、face=serious・char=true を後半へ継承。元の後続は a153。「うん。現像も、焼くのも、全部だめ。」（17字）で分割。
//   a259 は桜、face=ecstasy・char=true・r18=true を後半へ継承。元の後続は a260。「うん、あっ……だいじょうぶ、だから。」（18字）で分割。
//   a09 は桜、face=smile・char=true を後半へ継承。元の後続は a10。「時間を置くと、像が浮かんでくるの。」（17字）で分割。
//   a150 は桜、元の jump=a304 を後半へ引き継ぎ。face=smile・char=true を後半へ継承。「うん。……おじいちゃんはね。」（14字）で分割。
//   a159 は悠太、元の後続は a160。「（今のは平らじゃない。柔らかい嘘だ）。」（19字）で分割。
//   a172 は藤堂、元の後続は a173。「……頑固ですね。先代に、似ている。」（17字）で分割。
//   a179 は藤堂、元の後続は a180。「……ありません。だからこそ、怖い。」（17字）で分割。
//   a194 は桜、元の jump=a303 を後半へ引き継ぎ。face=serious・char=true を後半へ継承。「うん。おじいちゃんの、最後の約束。」（17字）で分割。
// 方式は qa/edit_yuna13_d872_d880_d886_d888.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード a314〜a321（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_sakura34_a152_a259_a09_a150_a159_a172_a179_a194.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['sakura', 'a152', 'a314', 17, 'うん。現像も、焼くのも、全部だめ。', '開けていいのは、最初のコマの人だけ'],
  ['sakura', 'a259', 'a315', 18, 'うん、あっ……だいじょうぶ、だから。', 'もっと、悠太を感じたい……あんっ'],
  ['sakura', 'a09', 'a316', 17, '時間を置くと、像が浮かんでくるの。', '悠太も、昔よりずっと大人っぽいよ'],
  ['sakura', 'a150', 'a317', 14, 'うん。……おじいちゃんはね。', '絶対に開けるな、って言ったフィルムを。'],
  ['sakura', 'a159', 'a318', 19, '（今のは平らじゃない。柔らかい嘘だ）。', '（駅の件にも、何かあるのか）'],
  ['sakura', 'a172', 'a319', 17, '……頑固ですね。先代に、似ている。', '一週間、待ちます。それが限度です'],
  ['sakura', 'a179', 'a320', 17, '……ありません。だからこそ、怖い。', '分からないものは、大きく見えます'],
  ['sakura', 'a194', 'a321', 17, 'うん。おじいちゃんの、最後の約束。', 'わたしはずっと、守り番だったの。'],
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
console.log('OK: split a152->a314, a259->a315, a09->a316, a150->a317, a159->a318, a172->a319, a179->a320, a194->a321');
