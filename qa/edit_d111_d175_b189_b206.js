// W2 優奈の同率最長台詞（d111／d175・25字）＋美咲の同率最長台詞（b189／b206・32字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d111_d175_b189_b206.js）：
// - 優奈 d111／d175 は25字で優奈の同率最長行（d207／d225／d225b／d333／d366／d367 も25字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   d111 は白鳥、元の jump=d357 を後半へ引き継ぎ。1つ目の「。」の後（15字）で分割。
//   d175 は悠太、後続は d176。1つ目の「。」の後（13字）で分割。
// - 美咲 b189／b206 は32字で美咲の同率最長行（b264／b272／b275／b286 も32字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   b189 は美咲（face=serious を後半へ継承）、後続は b190。1つ目の「。」の後（14字）で分割。
//   b206 は悠太、後続は b207。2つ目の「。」の後（19字）で分割（1つ目だと後半27字と長すぎるため）。
// 方式は qa/edit_d44_d46_d62_d78_d88_d99_b11_b91_b92_b117_b118_b129.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d585〜d586（優奈）・b514〜b515（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d111_d175_b189_b206.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd111', 'd585', 15, '悠太さん、よく来てくれました。', 'さあ、座って座って。'],
  ['yuna', 'd175', 'd586', 13, '修理の端切れで作りました。', '下手ですけど、気持ちです'],
  ['misaki', 'b189', 'b514', 14, '責めてるんじゃ、ないと思う。', 'わたしは、父のことを、誰も責めてない'],
  ['misaki', 'b206', 'b515', 19, '来ますよ。雨の日だけ、来る人ですから。', '必ず来ます。俺が保証します'],
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
console.log('OK: split d111->d585, d175->d586, b189->b514, b206->b515');
