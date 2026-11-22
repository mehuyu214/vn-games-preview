// W2 優奈の同率最長台詞（d355／d374／d376／d381・20字）＋美咲の同率最長台詞（b167／b169・23字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d355_d374_d376_d381_b167_b169.js）：
// - 優奈 d355／d374／d376／d381 は20字で優奈の同率最長行（次点も20字の d382／d395／d419／d423）。
//   d355 は優奈（face=smile・char=true を後半へ継承）、元の jump=d67 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d374 は榊、元の jump=d184b を後半へ引き継ぎ。「。」の後（10字）で分割。
//   d376 は榊、元の jump=d200 を後半へ引き継ぎ。「、」の後（3字）で分割。
//   d381 は優奈（face=serious・char=true を後半へ継承）、元の jump=d51 を後半へ引き継ぎ。「、」の後（5字）で分割。
// - 美咲 b167／b169 は23字で美咲の同率最長行（次点も23字の b171／b173／b188／b198／b221／b234）。
//   b167 は悠太、元の jump=b346 を後半へ引き継ぎ。「。」の後（6字）で分割。
//   b169 は美咲（face=serious を後半へ継承）、元の jump=b525 を後半へ引き継ぎ。「。」の後（7字）で分割。
// 方式は qa/edit_d256_d279_d332_d353_b103_b132_b150_b151_b157_b160.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d739〜d742（優奈）・b667・b668（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d355_d374_d376_d381_b167_b169.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd355', 'd739', 7, '言葉にすると、', '軽くなってしまいますけれど'],
  ['yuna', 'd374', 'd740', 10, '壊れるのが怖い、と。', '何度も、同じ言葉で。'],
  ['yuna', 'd376', 'd741', 3, '本は、', 'そのあとなら図書館に寄贈してもいい'],
  ['yuna', 'd381', 'd742', 5, 'わたしが、', '守らなければいけない本なんです'],
  ['misaki', 'b167', 'b667', 6, '（治療……。', 'だから『最後の雨』なんて言い方を。'],
  ['misaki', 'b169', 'b668', 7, '……月末まで。', 'あと、雨はあと何回来るんですか。'],
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
console.log('OK: split d355->d739, d374->d740, d376->d741, d381->d742, b167->b667, b169->b668');
