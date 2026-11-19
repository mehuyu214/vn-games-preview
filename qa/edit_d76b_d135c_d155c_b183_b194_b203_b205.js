// W2 優奈の次点最長台詞（d76b／d135c／d155c・29字）＋美咲の次点最長台詞（b183／b194／b203／b205・34字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d76b_d135c_d155c_b183_b194_b203_b205.js）：
// - 優奈 d76b／d135c／d155c は29字で優奈の同率最長行（d170 も29字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d76b は白鳥、後続は d77。1つ目の「。」の後で分割（文末に「。」なし）。
//   d135c は園田、元の jump=d341 を後半へ引き継ぎ。1つ目の「。」の後で分割。
//   d155c は白鳥、元の jump=d330 を後半へ引き継ぎ。「』」の後で分割。
// - 美咲 b183／b194／b203／b205 は34字で美咲の同率最長行（b218／b226／b232／b267 も34字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b183 は美咲（face=cry を後半へ継承）、後続は b184。1つ目の「。」の後で分割（文末に「。」なし）。
//   b194 は美咲（face=shy を後半へ継承）、後続は b195。2つ目の「。」の後で分割（文末に「。」なし）。
//   b203 は店長、後続は b204。2つ目の「。」の後で分割（文末に「。」なし）。
//   b205 は美咲（face=serious・char=true を後半へ継承）、後続は b206。2つ目の「。」の後で分割（文末に「。」なし）。
// 方式は qa/edit_d26_d187_d229_d259_d332_b148_b170_b171_b182.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d539〜d541（優奈）・b462〜b465（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d76b_d135c_d155c_b183_b194_b203_b205.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd76b', 'd539', 9, 'どうぞ、ゆっくり。', 'お茶にまで判子を押したら、味が変わります'],
  ['yuna', 'd135c', 'd540', 12, '気づいたら手元にあって。', '謝りに来たら、もう辞めていたんだ。'],
  ['yuna', 'd155c', 'd541', 17, '『届ける勇気が、半分足りなかった』', 'と、よく言っていました。'],
  ['misaki', 'b183', 'b462', 19, 'お父さん、五年前の春に亡くなってるの。', '事故で、急に。何の前触れもなく'],
  ['misaki', 'b194', 'b463', 20, '……じゃあ、書く。悠太くん、隣で見てて。', '逃げないでね。書き終わるまで'],
  ['misaki', 'b203', 'b464', 22, 'おれは奥にいる。今日は主役の邪魔はしないよ。', '若いもんに任せる夜もある'],
  ['misaki', 'b205', 'b465', 19, '……来るかな。本当に、来てくれるかな。', '最後の雨に。約束はしてないのに'],
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
console.log('OK: split d76b->d539, d135c->d540, d155c->d541, b183->b462, b194->b463, b203->b464, b205->b465');
