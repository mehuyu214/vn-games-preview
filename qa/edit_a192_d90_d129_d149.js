// W2 各作品の最長台詞の分割（文面不変・分割のみ）
// 実測（qa/measure_a192_d90.js）：
// - 桜 a192 は56字で桜の最長行（次点 a35／a177／a194:48字）。駅で待っていた
//   理由を明かす場面で、句点の区切りで2ノードに分割する。
// - 優奈 d90／d129／d149 は48字で優奈の最長行（次点 d04／d121:47字）。
//   d90 は存在しない本の説明、d129 は祖母の規則違反の告白（jump=d137 あり）、
//   d149 は祖母と同じ性質の告白。いずれも句点の区切りで2ノードに分割する。
// 方式は qa/edit_a272_d47_d75.js と同じ：前半ノードに jump、後半ノード
// （scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。d129 のみ
// 元の jump（d137）を後半ノードへ引き継ぐ。
// 新規ノード a300（桜）・d336・d337・d338（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_a192_d90_d129_d149.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

const SPLITS = [
  // [作品ID, 対象ID, 新規ID, 前半テキスト, 後半テキスト]
  ['sakura', 'a192', 'a300',
    'うん。夏休み、おじいちゃんが撮った。だから、駅で待ってたの。',
    '悠太が帰るって、噂で聞いて。偶然なんて、嘘。ごめんね'],
  ['yuna', 'd90', 'd336',
    '存在しない本を、探しているんです。祖母の手がかりで。',
    '日記に、どうしても気になる一文がありまして。'],
  ['yuna', 'd129', 'd337',
    '未返却の本は、除籍されるはずなんです。規則では。',
    '……祖母が、自分で規則を破った。初めて知りました'],
  ['yuna', 'd149', 'd338',
    '……わたしも、同じなんです。祖母と、同じ。',
    '気持ちを、言葉の代わりに本へ閉じ込めてしまうところが。'],
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
console.log('OK: split a192->a300, d90->d336, d129->d337, d149->d338');
