// W2 優奈の13字行 d371／d387／d400／d403／d404／d417／d421／d425 の分割（文面不変・分割のみ）
// 実測（qa/measure_yuna13_d371_d387_d400_d403_d404_d417_d421_d425.js）：
// - 優奈 13字行=68件。13字超え78件は全て地の文（name=""・d01等）のため分割対象外（前ランと同様）。
//   d371 は優奈、元の jump=d685 を後半へ引き継ぎ。face=sad・char=true を後半へ継承。「、」の後（6字）で分割。
//   d387 は白鳥、元の jump=d790 を後半へ引き継ぎ。「で」の後（7字）で分割。
//   d400 は園田、元の jump=d686 を後半へ引き継ぎ。「ここが」の後（6字）で分割。
//   d403 は榊、元の jump=d94 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d404 は白鳥、元の jump=d118 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   d417 は白鳥、元の jump=d688 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   d421 は優奈、元の jump=d184 を後半へ引き継ぎ。face=sad・char=true を後半へ継承。「、」の後（6字）で分割。
//   d425 は園田、元の jump=d875 を後半へ引き継ぎ。「ずっと」の後（3字）で分割（文中の区切りが他に無いため）。
// 方式は qa/edit_yuna13_d232_d240b_d253b_d333_d339_d351_d360_d370.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d1095〜d1102（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_yuna13_d371_d387_d400_d403_d404_d417_d421_d425.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd371', 'd1095', 6, '書いたのに、', '渡せなかった。'],
  ['yuna', 'd387', 'd1096', 7, '静かな図書館で', '飲む一杯は、'],
  ['yuna', 'd400', 'd1097', 6, 'ああ、ここが', '落ち着くんだ。'],
  ['yuna', 'd403', 'd1098', 7, '祖母が残した、', 'たった一冊を'],
  ['yuna', 'd404', 'd1099', 9, '腕を上げましたね、', '優奈さん'],
  ['yuna', 'd417', 'd1100', 9, '『極秘』の判子を、', '二人分。'],
  ['yuna', 'd421', 'd1101', 6, '毎日会えて、', '話も弾んだのに'],
  ['yuna', 'd425', 'd1102', 3, 'ずっと', '気になっていたんだ、'],
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
console.log('OK: split d371->d1095, d387->d1096, d400->d1097, d403->d1098, d404->d1099, d417->d1100, d421->d1101, d425->d1102');
