// W2 優奈の17字最長行（d58／d61）＋美咲の19字最長行（b341／b367／b401）の分割（文面不変・分割のみ）
// 実測（qa/measure_d58_d61_b341_b367_b401.js）：
// - 優奈 d58／d61 は17字で優奈の同率最長行（次点も17字の d75／d76／d90／d106／d113／d146）。
//   d58 は優奈、元の jump=d399 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d61 は優奈、jumpなし（後続 d62 へ）。「、」の後（9字）で分割。
// - 美咲 b341／b367／b401 は19字で美咲の同率最長行（次点も19字の b409／b414／b430／b481／b495）。
//   b341 は美咲、元の jump=b141 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   b367 は藤井、元の jump=b98 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   b401 は悠太、元の jump=b77 を後半へ引き継ぎ。「。」の後（9字）で分割。
// 方式は qa/edit_d07_d25_d35_d42_d52_d53_b272_b284_b307_b325_b338.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d851〜d852（優奈）・b779〜b781（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d58_d61_b341_b367_b401.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd58', 'd851', 7, '……わたしは、', '直していただけです。'],
  ['yuna', 'd61', 'd852', 9, '一緒に……ですか、', '悠太さんも一緒に'],
  ['misaki', 'b341', 'b779', 10, '『大島に引き継ぐ』。', 'あれ、店長ですよね'],
  ['misaki', 'b367', 'b780', 9, '駅前のホテルまで。', '雨の中、ずぶ濡れでね'],
  ['misaki', 'b401', 'b781', 9, '雨、降ってるのに。', '相沢さん、でしたっけ'],
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
console.log('OK: split d58->d851, d61->d852, b341->b779, b367->b780, b401->b781');
