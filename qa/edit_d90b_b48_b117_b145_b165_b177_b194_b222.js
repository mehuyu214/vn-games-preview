// W2 優奈の18字最長行（d90b）＋美咲の20字最長行（b48／b117／b145／b165／b177／b194／b222）の分割（文面不変・分割のみ）
// 実測（qa/measure_d90b_b48_b117_b145_b165_b177_b194_b222.js）：
// - 優奈 d90b は18字で優奈の最長行（次点も18字の d147／d156／d201／d204b／d204c／d205／d245）。
//   d90b は榊、元の jump=d481 を後半へ引き継ぎ。「整理で」の後（8字）で分割。
// - 美咲 b48／b117／b145／b165／b177／b194／b222 は20字で美咲の同率最長行（次点も20字の b233）。
//   b48 は美咲（face=serious・char=true を後半へ継承）、元の jump=b398 を後半へ引き継ぎ。「。」の後（12字）で分割。
//   b117 は美咲（face=smile・char=true を後半へ継承）、元の jump=b511 を後半へ引き継ぎ。「、」の後（13字）で分割。
//   b145 は店長、元の jump=b342 を後半へ引き継ぎ。「は、」の後（12字）で分割。
//   b165 は美咲（face=surprise・char=true を後半へ継承）、元の jump=b420 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   b177 は美咲（face=serious を後半へ継承）、元の jump=b376 を後半へ引き継ぎ。「、」の後（12字）で分割。
//   b194 は美咲（face=shy を後半へ継承）、元の jump=b463 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   b222 は美咲（face=sad を後半へ継承）、元の jump=b551 を後半へ引き継ぎ。「の」の後（10字）で分割。
// 方式は qa/edit_b544_d06_d10_d28_d34_d48_d71b_d85.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d810（優奈）・b734〜b740（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d90b_b48_b117_b145_b165_b177_b194_b222.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd90b', 'd810', 8, '祖母の遺品整理で', '日記が出てきまして。'],
  ['misaki', 'b48', 'b734', 12, '……お待たせ、しました。', 'これ、ですよね。'],
  ['misaki', 'b117', 'b735', 13, 'うん。棚卸しが終わったら、', '二人で見よう。'],
  ['misaki', 'b145', 'b736', 12, '美咲ちゃんの雨シフトは、', 'おれが組んでた。'],
  ['misaki', 'b165', 'b737', 10, '……海外。……いつ、', '帰ってくるんですか。'],
  ['misaki', 'b177', 'b738', 12, '写真……。若い男の人が、', '二人。笑ってる。'],
  ['misaki', 'b194', 'b739', 9, '……じゃあ、書く。', '悠太くん、隣で見てて。'],
  ['misaki', 'b222', 'b740', 10, 'あの傘が、お父さんの', '物だって知りました。'],
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
console.log('OK: split d90b->d810, b48->b734, b117->b735, b145->b736, b165->b737, b177->b738, b194->b739, b222->b740');
