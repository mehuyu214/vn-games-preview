// W2 優奈の同率最長台詞（d363／d370／d397／d399／d407・23字）＋美咲の同率最長台詞（b75／b78／b81／b87／b93／b114・26字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d363_d370_d397_d399_d407_b75_b78_b81_b87_b93_b114.js）：
// - 優奈 d363／d370／d397／d399／d407 は23字で優奈の同率最長行（次点は22字の d47／d64／d89）。
//   d363 は悠太、元の jump=d244 を後半へ引き継ぎ。「中で、」の読点の後（12字）で分割。
//   d370 は優奈（face=serious・char=true を後半へ継承）、元の jump=d143b を後半へ引き継ぎ。2つ目の「、」の後（13字）で分割。
//   d397 は悠太、元の jump=d54 を後半へ引き継ぎ。「よく、」の読点の後（12字）で分割。
//   d399 は優奈（face=shy・char=true を後半へ継承）、元の jump=d59 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   d407 は優奈（face=serious・char=true を後半へ継承）、元の jump=d194 を後半へ引き継ぎ。2つ目の「。」の後（17字）で分割。
// - 美咲 b75／b78／b81／b87／b93／b114 は26字で美咲の同率最長行（b124／b126 も26字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   b75 は美咲（face=serious を後半へ継承）、元の jump=b400 を後半へ引き継ぎ。2つ目の「。」の後（8字）で分割。
//   b78 は悠太、元の jump=b402 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   b81 は美咲（face=sad を後半へ継承）、元の jump=b403 を後半へ引き継ぎ。「なくて、」の読点の後（16字）で分割。
//   b87 は美咲（face=sad を後半へ継承）、元の jump=b404 を後半へ引き継ぎ。「。」の後（11字）で分割。
//   b93 は美咲（face=sad を後半へ継承）、元の jump=b405 を後半へ引き継ぎ。「。」の後（17字）で分割。
//   b114 は美咲（face=serious を後半へ継承）、元の jump=b339 を後半へ引き継ぎ。「。」の後（13字）で分割。
// 方式は qa/edit_d342_d352_d358_b19_b32.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d645〜d649（優奈）・b571〜b576（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d363_d370_d397_d399_d407_b75_b78_b81_b87_b93_b114.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd363', 'd645', 12, '修理を手伝う日々の中で、', '答えは決まっていました'],
  ['yuna', 'd370', 'd646', 13, '除籍の印も、廃棄の記録も、', 'どこにもありません。'],
  ['yuna', 'd397', 'd647', 12, '知ってます。俺にもよく、', '声をかけてくれる人です'],
  ['yuna', 'd399', 'd648', 9, '本当に、それだけ。', '守るだなんて、大それたことは'],
  ['yuna', 'd407', 'd649', 17, '本当です。昨日は、嘘をつきました。', 'ごめんなさい'],
  ['misaki', 'b75', 'b571', 8, 'うん。供養仲間。', '食べるのが一番の供養だからね、ほら。'],
  ['misaki', 'b78', 'b572', 10, 'あの傘、なんですか。', '聞いてもいいですか、先輩として。'],
  ['misaki', 'b81', 'b573', 16, '高校の帰り道。傘、持ってなくて、', '駅前で立ち往生して。'],
  ['misaki', 'b87', 'b574', 11, 'お礼も言えなかったの。', '気づいたら、もう雨の中だった。'],
  ['misaki', 'b93', 'b575', 17, '……あの人、今どうしてるんだろう。', '元気でいるのかな。'],
  ['misaki', 'b114', 'b576', 13, '『持ち主来店まで永久保管。', '大島に引き継ぐ』……大島？'],
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
console.log('OK: split d363->d645, d370->d646, d397->d647, d399->d648, d407->d649, b75->b571, b78->b572, b81->b573, b87->b574, b93->b575, b114->b576');
