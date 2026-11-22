// W2 優奈の同率最長台詞（d365／d373／d378／d384／d387・19字）＋美咲の同率最長台詞（b240／b250／b252・21字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d365_d373_d378_d384_d387_b240_b250_b252.js）：
// - 優奈 d365／d373／d378／d384／d387 は19字で優奈の同率最長行（次点も19字の d412／d415／d432）。
//   d365 は優奈（face=serious・char=true を後半へ継承）、元の jump=d23 を後半へ引き継ぎ。「、」の後（12字）で分割。
//   d373 は白鳥、元の jump=d156b を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d378 は優奈（face=serious・char=true を後半へ継承）、元の jump=d218 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   d384 は悠太、元の jump=d129 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   d387 は白鳥、元の jump=d154 を後半へ引き継ぎ。「、」の後（13字）で分割。
// - 美咲 b240／b250／b252 は21字で美咲の同率最長行（次点も21字の b290／b296／b305／b313／b328）。
//   b240 は相沢、元の jump=b435 を後半へ引き継ぎ。「、」の後（13字）で分割。
//   b250 は藤井、元の jump=b500 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   b252 は美咲（face=sad・char=true を後半へ継承）、元の jump=b357 を後半へ引き継ぎ。「、」の後（12字）で分割。
// 方式は qa/edit_d339_d340_d361_b128_b138_b141_b159_b197.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d786〜d790（優奈）・b714〜b716（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d365_d373_d378_d384_d387_b240_b250_b252.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd365', 'd786', 12, '理由は、あとで……いえ、', '今は言えません'],
  ['yuna', 'd373', 'd787', 6, '直し続けた、', 'その手が持っているんです。'],
  ['yuna', 'd378', 'd788', 9, '園田さんに宛てた、', 'たった一通の手紙です'],
  ['yuna', 'd384', 'd789', 9, '『未返却』のまま、', '記録が終わってますね'],
  ['yuna', 'd387', 'd790', 13, '静かな図書館で飲む一杯は、', '格別なんです'],
  ['misaki', 'b240', 'b714', 13, '美咲さん。……お父さんに、', 'よく似ています。'],
  ['misaki', 'b250', 'b715', 8, '紳士、時間だよ。', '……ごめんね、お嬢ちゃん。'],
  ['misaki', 'b252', 'b716', 12, '……わたし、五年待って、', '何も言えなかった。'],
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
console.log('OK: split d365->d786, d373->d787, d378->d788, d384->d789, d387->d790, b240->b714, b250->b715, b252->b716');
