// W2 優奈の同率最長台詞（d231／d242／d243／d243b・20字）＋美咲の同率最長台詞（b90／b100・23字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d231_d242_d243_d243b_b90_b100.js）：
// - 優奈 d231／d242／d243／d243b は20字で優奈の同率最長行（次点も20字の d256／d279／d332／d353）。
//   d231 は悠太、元の jump=d391 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   d242 は優奈（face=shy・char=true を後半へ継承）、元の jump=d460 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   d243 は悠太、元の jump=d531 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   d243b は悠太、元の jump=d363 を後半へ引き継ぎ。「、」の後（7字）で分割。
// - 美咲 b90／b100 は23字で美咲の同率最長行（次点も23字の b103／b132／b150／b151／b157／b160）。
//   b90 は悠太、元の jump=b523 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   b100 は悠太、元の jump=b368 を後半へ引き継ぎ。「。」の後（11字）で分割。
// 方式は qa/edit_d155_d161_d185b_d193b_b04_b18_b40_b51_b53_b89.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d731〜d734（優奈）・b659・b660（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d231_d242_d243_d243b_b90_b100.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd231', 'd731', 5, '（届いた。', '半世紀の手紙が、ついに届いた。'],
  ['yuna', 'd242', 'd732', 5, '悠太さん。', 'わたしと、付き合ってください。'],
  ['yuna', 'd243', 'd733', 9, '……はい。喜んで。', '半世紀も待たせません。'],
  ['yuna', 'd243b', 'd734', 7, '考える時間は、', 'もう十分にありましたから。'],
  ['misaki', 'b90', 'b659', 10, '（五年。雨のたびに、', 'この店で待ち続けてたのか。'],
  ['misaki', 'b100', 'b660', 11, 'なんて言ったんですか。', '気になるじゃないですか。'],
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
console.log('OK: split d231->d731, d242->d732, d243->d733, d243b->d734, b90->b659, b100->b660');
