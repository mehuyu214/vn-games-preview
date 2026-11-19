// W2 優奈の同率最長台詞（d24／d43／d52／d54／d92／d115／d116・33字）＋美咲の同率最長台詞（b165／b175・35字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d24_d43_d52_d54_d92_d115_d116_b165_b175.js）：
// - 優奈 d24／d43／d52／d54／d92／d115／d116 は33字で優奈の同率最長行（次点 d120:33字）。
//   d24 は優奈（face=sad・char=true を後半へ継承）、後続は d25。2つ目の「。」の後で分割（文末に「。」なし）。
//   d43 は悠太、後続は d44。唯一の「。」の後で分割（文末に「。」なし）。
//   d52 は優奈（face=sad・char=true を後半へ継承）、後続は d53。唯一の「。」の後で分割（文末に「。」なし）。
//   d54 は優奈（face=sad・char=true を後半へ継承）、後続は d55。2つ目の「。」の後で分割（文末に「。」なし）。
//   d92 は優奈（face=serious・char=true を後半へ継承）、後続は d93。唯一の「。」の後で分割（文末に「。」なし）。
//   d115 は白鳥、後続は d116。2つ目の「。」の後で分割（文末に「。」なし）。
//   d116 は優奈（face=surprise・char=true を後半へ継承）、後続は d117。2つ目の「。」の後で分割（文末に「。」なし）。
// - 美咲 b165／b175 は35字で美咲の同率最長行（b179／b186／b187／b190／b195／b197 も35字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   b165 は美咲（face=surprise・char=true を後半へ継承）、後続は b166。2つ目の「。」の後で分割（文末に「。」なし）。
//   b175 は美咲（face=surprise を後半へ継承）、後続は b176。2つ目の「。」の後で分割（文末に「。」なし）。
// 方式は qa/edit_d277_b135_b141_b150_b151_b161_b164.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d499〜d505（優奈）・b420〜b421（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d24_d43_d52_d54_d92_d115_d116_b165_b175.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd24', 'd499', 24, '見なかったことに、してください。お願いですから。', '今日のことは、全部'],
  ['yuna', 'd43', 'd500', 19, '忘れられませんよ、あんな顔をされたら。', '心配で、放っておけないんです'],
  ['yuna', 'd52', 'd501', 17, '園田さんは、毎週来る常連さんです。', 'いつも同じ席の、窓際の席の方です'],
  ['yuna', 'd54', 'd502', 23, '手紙は、届かなかったんです。何十年も、ずっと。', '本の中で、眠ったまま'],
  ['yuna', 'd92', 'd503', 21, '当館の蔵書は、全て目録に登録されています。', '一冊の例外も、ありません'],
  ['yuna', 'd115', 'd504', 24, 'ええ。そして、あの本のことも、私は知っています。', '最初から、ずっとね'],
  ['yuna', 'd116', 'd505', 22, '館長、ご存じだったんですか。あの本のことを。', '……なぜ、今まで黙って'],
  ['misaki', 'b165', 'b420', 20, '……海外。……いつ、帰ってくるんですか。', '藤井さん、本当なんですか、それ'],
  ['misaki', 'b175', 'b421', 17, '……回る。悠太くん、これ、回るよ。', '開くよ、本当に。……中、何か入ってる'],
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
console.log('OK: split d24->d499, d43->d500, d52->d501, d54->d502, d92->d503, d115->d504, d116->d505, b165->b420, b175->b421');
