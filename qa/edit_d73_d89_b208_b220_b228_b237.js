// W2 優奈の同率最長台詞（d73／d89・36字）＋美咲の同率最長台詞（b208／b220／b228／b237・36字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d73_d89_b208_b220_b228_b237.js）：
// - 優奈 d73／d89 は36字で優奈の同率最長行（d94／d99／d112／d118 も36字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   d73 は園田、後続は d74。2つ目の「。」の後で分割。
//   d89 は優奈（face=smile・char=true、後半へ継承）、後続は d90。2つ目の「。」の後で分割。
// - 美咲 b208／b220／b228／b237 は36字で美咲の同率最長行（b244／b245／b262／b263 も36字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b208 は悠太、後続は b209。2つ目の「。」の後で分割。
//   b220 は美咲（face=shy、後半へ継承）、後続は b221。2つ目の「。」の後で分割。
//   b228 は相沢、後続は b229。2つ目の「。」の後で分割。
//   b237 は店長、後続は b238。2つ目の「。」の後で分割。省略記号「……」は U+2026×2 を文字インデックスで確認済み。
// 方式は qa/edit_d05_d10_d33_d46_d49_d64_b177_b178_b185_b192.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d467〜d468（優奈）・b380〜b383（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d73_d89_b208_b220_b228_b237.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd73', 'd467', 26, '分かってる、規則は守るよ。でも席は、空いてたからね。', '誰も座ってなかったし'],
  ['yuna', 'd89', 'd468', 22, 'ご用件を、どうぞ。お力になれることでしたら。', '司書は、探し物の味方ですから'],
  ['misaki', 'b208', 'b380', 27, '礼は、傘を返せてから、ですよ。店長の受け売りですけど。', '今夜、返しましょう'],
  ['misaki', 'b220', 'b381', 25, '五年間、言えなかったお礼です。やっと、書けました。', '読んでください、お願い'],
  ['misaki', 'b228', 'b382', 26, '彼は言っていました。『雨の日は――』、よく口にして。', '口癖みたいに、何度も'],
  ['misaki', 'b237', 'b383', 25, 'ほら、なんとかなったっしょ。……よかった、本当に。', 'おれの代で終わらなくて'],
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
console.log('OK: split d73->d467, d89->d468, b208->b380, b220->b381, b228->b382, b237->b383');
