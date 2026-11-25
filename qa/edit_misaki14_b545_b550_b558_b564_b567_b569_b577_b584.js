// W2 美咲の次点最長行（b545／b550／b558／b564／b567／b569／b577／b584、14字・31件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_misaki14_b545_b550_b558_b564_b567_b569_b577_b584.js）：
// - 美咲 b545／b550／b558／b564／b567／b569／b577／b584 は14字で美咲の次点最長行（31件同率の先頭8件）。
//   b545 は美咲、元の jump=b791 を後半へ引き継ぎ。face=sad を後半へ継承。「と」の後（9字）で分割。
//   b550 は悠太、元の jump=b202 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   b558 は店長、元の jump=b148 を後半へ引き継ぎ。「る」の後（9字）で分割。
//   b564 は美咲、元の jump=b230 を後半へ引き継ぎ。face=smile を後半へ継承。「、」の後（6字）で分割。
//   b567 は美咲、元の jump=b78 を後半へ引き継ぎ。face=sad を後半へ継承。「、」の後（9字）で分割。
//   b569 は悠太、元の jump=b392 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   b577 は美咲、元の jump=b454 を後半へ引き継ぎ。face=serious・char=true を後半へ継承。「、」の後（5字）で分割。
//   b584 は美咲、元の jump=b422 を後半へ引き継ぎ。face=surprise を後半へ継承。「、」の後（8字）で分割。
// 方式は qa/edit_misaki14_b483_..._b533.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b1017〜b1024（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_misaki14_b545_b550_b558_b564_b567_b569_b577_b584.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b545', 'b1017', 9, '温かい缶コーヒーと', 'カイロと、'],
  ['misaki', 'b550', 'b1018', 8, '……と言いつつ、', '不安は残った'],
  ['misaki', 'b558', 'b1019', 9, '人はさ、答えを知る', 'と急ぐから'],
  ['misaki', 'b564', 'b1020', 6, '知ってます、', '父の字で見ました'],
  ['misaki', 'b567', 'b1021', 9, '期待したわたしが、', '馬鹿みたい'],
  ['misaki', 'b569', 'b1022', 6, 'そんな商品、', 'うちにあったか。'],
  ['misaki', 'b577', 'b1023', 5, '傘のこと、', '知ってるはずだよ。'],
  ['misaki', 'b584', 'b1024', 8, '……小さい字で、', 'びっしりと。'],
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
console.log('OK: split b545->b1017, b550->b1018, b558->b1019, b564->b1020, b567->b1021, b569->b1022, b577->b1023, b584->b1024');
