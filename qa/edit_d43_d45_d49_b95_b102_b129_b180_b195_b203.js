// W2 優奈の同率最長台詞（d43／d45／d49・19字）＋美咲の同率最長台詞（b95／b102／b129／b180／b195／b203・22字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d43_d45_d49_b95_b102_b129_b180_b195_b203.js）：
// - 優奈 d43／d45／d49 は19字で優奈の同率最長行（次点も19字の d51／d98／d104／d121／d128）。
//   d43 は悠太、元の jump=d500 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   d45 は悠太、元の jump=d622 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d49 は悠太、元の jump=d597 を後半へ引き継ぎ。「、」の後（7字）で分割。
// - 美咲 b95／b102／b129／b180／b195／b203 は22字で美咲の同率最長行（次点も22字の b238／b247）。
//   b95 は藤井、元の jump=b314 を後半へ引き継ぎ。「。」の後（6字）で分割。
//   b102 は美咲（face=surprise を後半へ継承）、元の jump=b302 を後半へ引き継ぎ。「……」の後（13字）で分割。
//   b129 は悠太、元の jump=b513 を後半へ引き継ぎ。「、」の後（19字）で分割。
//   b180 は悠太、元の jump=b319 を後半へ引き継ぎ。「。」の後（6字）で分割。
//   b195 は悠太、元の jump=b426 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   b203 は店長、元の jump=b464 を後半へ引き継ぎ。「。」の後（8字）で分割。
// 方式は qa/edit_d08_d20_d23_d26_d32_b47_b54.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d759〜d761（優奈）・b685〜b690（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d43_d45_d49_b95_b102_b129_b180_b195_b203.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd43', 'd759', 9, '忘れられませんよ、', 'あんな顔をされたら。'],
  ['yuna', 'd45', 'd760', 8, 'その司書さんが、', '朝は本を隠したんです。'],
  ['yuna', 'd49', 'd761', 7, '本を見る目は、', '優奈さん仕込みですから。'],
  ['misaki', 'b95', 'b685', 6, 'ただいまー。', '傘、今度はちゃんと持ってきたよ。'],
  ['misaki', 'b102', 'b686', 13, '……誰に、似ているって……', 'わたしが、ですか。'],
  ['misaki', 'b129', 'b687', 19, '（名言っぽく言えば済むと思ってる顔だ、', 'これ。'],
  ['misaki', 'b180', 'b688', 6, '読みますか。', '……美咲さん、手、震えてますよ。'],
  ['misaki', 'b195', 'b689', 9, '傘は俺が磨きます。', '柄の傷、一つずつ、丁寧に。'],
  ['misaki', 'b203', 'b690', 8, 'おれは奥にいる。', '今日は主役の邪魔はしないよ。'],
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
console.log('OK: split d43->d759, d45->d760, d49->d761, b95->b685, b102->b686, b129->b687, b180->b688, b195->b689, b203->b690');
