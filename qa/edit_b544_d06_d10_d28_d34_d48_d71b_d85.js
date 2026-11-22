// W2 美咲の次点最長台詞（b544・21字）＋優奈の18字最長行（d06／d10／d28／d34／d48／d71b／d85）の分割（文面不変・分割のみ）
// 実測（qa/measure_b544_d06_d10_d28_d34_d48_d71b_d85.js）：
// - 美咲 b544 は21字で美咲の最長行（次点は20字の b48／b117／b145／b165／b177／b194／b222）。
//   b544 は悠太、元の jump=b71 を後半へ引き継ぎ。「。」の後（9字）で分割。
// - 優奈 d06／d10／d28／d34／d48／d71b／d85 は18字で優奈の同率最長行（次点も18字の d90b）。
//   d06 は悠太、元の jump=d443 を後半へ引き継ぎ。「『簡単』」の後（9字）で分割。
//   d10 は優奈（face=smile・char=true を後半へ継承）、元の jump=d462 を後半へ引き継ぎ。「修理の」の後（9字）で分割。
//   d28 は優奈（face=sad・char=true を後半へ継承）、元の jump=d428 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   d34 は悠太、元の jump=d429 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   d48 は優奈（face=shy・char=true を後半へ継承）、元の jump=d525 を後半へ引き継ぎ。「。」の後（11字）で分割。
//   d71b は園田、元の jump=d400 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d85 は榊、元の jump=d448 を後半へ引き継ぎ。「、」の後（12字）で分割。
// 方式は qa/edit_d557_b502_b505_b538.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b733（美咲）・d803〜d809（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_b544_d06_d10_d28_d34_d48_d71b_d85.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b544', 'b733', 9, '今夜はそれでいい。', '先輩の沈黙を、守る夜だ）'],
  ['yuna', 'd06', 'd803', 9, '（三万冊が『簡単』', 'の範囲なのか……。'],
  ['yuna', 'd10', 'd804', 8, '悠太さんは修理の', '続きをお願いします。'],
  ['yuna', 'd28', 'd805', 9, '……ごめんなさい。', 'でも、お願いです。'],
  ['yuna', 'd34', 'd806', 10, '言えない理由がある、', 'ってことですね。'],
  ['yuna', 'd48', 'd807', 12, '……よく、見ていますね。', '悠太さんは。'],
  ['yuna', 'd71b', 'd808', 8, 'いつもは一人で、', '本と話してるのにね。'],
  ['yuna', 'd85', 'd809', 12, 'あの、閉館って……もう、', 'ダメですか。'],
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
console.log('OK: split b544->b733, d06->d803, d10->d804, d28->d805, d34->d806, d48->d807, d71b->d808, d85->d809');
