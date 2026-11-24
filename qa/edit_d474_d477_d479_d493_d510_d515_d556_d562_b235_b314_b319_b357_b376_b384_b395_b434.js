// W2 優奈の15字最長行（d474／d477／d479／d493／d510／d515／d556／d562）＋美咲の16字最長行（b235／b314／b319／b357／b376／b384／b395／b434）の分割（文面不変・分割のみ）
// 実測（qa/measure_d474_d477_d479_d493_d510_d515_d556_d562_b235_b314_b319_b357_b376_b384_b395_b434.js）：
// - 優奈 d474／d477／d479／d493／d510／d515／d556／d562 は15字で優奈の同率最長行（8件同率）。
//   d474 は白鳥、元の jump=d152 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d477 は優奈、元の jump=d254 を後半へ引き継ぎ。「、」の後（4字）で分割。face=love・char=true を後半へ継承。
//   d479 は悠太、元の jump=d32 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d493 は優奈、元の jump=d105 を後半へ引き継ぎ。「、」の後（4字）で分割。face=serious・char=true を後半へ継承。
//   d510 は悠太、元の jump=d246 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   d515 は優奈、元の jump=d261 を後半へ引き継ぎ。「。」の後（5字）で分割。face=pleasure・char=true を後半へ継承。
//   d556 は榊、元の jump=d403 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d562 は優奈、元の jump=d149b を後半へ引き継ぎ。「て」の後（7字）で分割。face=sad・char=true を後半へ継承。
// - 美咲 b235／b314／b319／b357／b376／b384／b395／b434 は16字で美咲の同率最長行（8件同率）。
//   b235 は相沢、元の jump=b496 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b314 は藤井、元の jump=b96 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   b319 は悠太、元の jump=b181 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b357 は美咲、元の jump=b253 を後半へ引き継ぎ。「、」の後（9字）で分割。face=sad・char=true を後半へ継承。
//   b376 は美咲、元の jump=b178 を後半へ引き継ぎ。「。」の後（5字）で分割。face=serious を後半へ継承（charなし）。
//   b384 は美咲、元の jump=b261 を後半へ引き継ぎ。「。」の後（6字）で分割。face=shy を後半へ継承（charなし）。
//   b395 は藤井、元の jump=b31 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   b434 は藤井、元の jump=b652 を後半へ引き継ぎ。「、」の後（10字）で分割。
// 方式は qa/edit_d452_..._b219.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d971〜d978（優奈）・b898〜b905（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d474_d477_d479_d493_d510_d515_d556_d562_b235_b314_b319_b357_b376_b384_b395_b434.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd474', 'd971', 8, '重い話のあとは、', 'お茶に限ります'],
  ['yuna', 'd477', 'd972', 4, 'それが、', 'わたしの新しい規則です'],
  ['yuna', 'd479', 'd973', 6, 'あの慌て方、', 'ただごとじゃない）'],
  ['yuna', 'd493', 'd974', 4, 'そして、', 'わたしの憧れの人でした'],
  ['yuna', 'd510', 'd975', 4, 'それは、', 'さすがに酷くないですか'],
  ['yuna', 'd515', 'd976', 5, 'わたしを。', '全部、悠太さんにだけ'],
  ['yuna', 'd556', 'd977', 8, '目録に無い本を、', '探しています。'],
  ['yuna', 'd562', 'd978', 7, '本へ閉じ込めて', 'しまうところが。'],
  ['misaki', 'b235', 'b898', 7, '誰かと一緒に、', '歩くための傘です。'],
  ['misaki', 'b314', 'b899', 5, '学習した。', '先週はひどかったからね'],
  ['misaki', 'b319', 'b900', 7, '大丈夫ですか、', '俺が持ちましょうか'],
  ['misaki', 'b357', 'b901', 9, '目の前にいたのに、', '声が出なかった'],
  ['misaki', 'b376', 'b902', 5, '海の前で。', '……一人は、相沢さんだ'],
  ['misaki', 'b384', 'b903', 6, 'ゆっくりね。', '二人きりで、ちゃんと'],
  ['misaki', 'b395', 'b904', 8, 'しかも紳士だね。', '雨なのに品がある'],
  ['misaki', 'b434', 'b905', 10, '泣くのは車の中でね、', 'たっぷりと。'],
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
console.log('OK: split d474->d971, d477->d972, d479->d973, d493->d974, d510->d975, d515->d976, d556->d977, d562->d978, b235->b898, b314->b899, b319->b900, b357->b901, b376->b902, b384->b903, b395->b904, b434->b905');
