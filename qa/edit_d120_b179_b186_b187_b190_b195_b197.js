// W2 優奈の次点最長台詞（d120・33字）＋美咲の同率最長台詞（b179／b186／b187／b190／b195／b197・35字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d120_b179_b186_b187_b190_b195_b197.js）：
// - 優奈 d120 は33字で優奈の最長行（d141／d198／d224／d245／d252／d253／d257 も33字で同率だが本ランは前ラン次回候補の1行のみ対象）。
//   d120 は優奈（face=sad・char=true を後半へ継承）、後続は d121。2つ目の「。」の後で分割（文末に「。」なし）。
// - 美咲 b179／b186／b187／b190／b195／b197 は35字で美咲の同率最長行（b200／b204 も35字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   b179 は美咲（face=surprise を後半へ継承）、後続は b180。2つ目の「。」の後で分割（文末に「。」なし）。
//   b186 は悠太、後続は b187（本ランで同時に分割するが、b423→b187→b424 と連鎖するため問題なし）。2つ目の「。」の後で分割（文末に「。」なし）。
//   b187 は美咲（face=sad を後半へ継承）、後続は b188。唯一の「。」の後で分割（文末に「。」なし）。
//   b190 は悠太、後続は b191。2つ目の「。」の後で分割（文末に「。」なし）。
//   b195 は悠太、後続は b196。2つ目の「。」の後で分割（文末に「。」なし）。
//   b197 は悠太（元の jump=b202 を後半へ引き継ぎ）、後続は b202。唯一の「。」の後で分割（文末は「）」）。
// 方式は qa/edit_d24_d43_d52_d54_d92_d115_d116_b165_b175.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d506（優奈）・b422〜b427（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d120_b179_b186_b187_b190_b195_b197.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd120', 'd506', 23, 'わたしは、規則を破っています。それは事実です。', '言い逃れは、しません'],
  ['misaki', 'b179', 'b422', 26, 'もう一枚、紙が入ってる。……小さい字で、びっしりと。', '手紙、みたいなもの'],
  ['misaki', 'b186', 'b423', 26, 'お父さんの傘を、そっと返してくれた。名前も言わずに。', 'お礼も受け取らずに'],
  ['misaki', 'b187', 'b424', 24, '相沢さんは、事故の時、一緒にいた人なんだと思う。', '……父と、最後にいた人'],
  ['misaki', 'b190', 'b425', 26, '会えば分かります。最後の雨の日に、全部聞きましょう。', '本人の口から、全部'],
  ['misaki', 'b195', 'b426', 22, '傘は俺が磨きます。柄の傷、一つずつ、丁寧に。', '五年分の埃、全部落とします'],
  ['misaki', 'b197', 'b427', 21, '（五年分の埃と一緒に、後悔も落ちればいい。', '彼女の分も、相沢さんの分も）'],
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
  secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split d120->d506, b179->b422, b186->b423, b187->b424, b190->b425, b195->b426, b197->b427');
