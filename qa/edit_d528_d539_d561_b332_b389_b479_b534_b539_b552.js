// W2 優奈の同率最長台詞（d528／d539／d561・20字）＋美咲の同率最長台詞（b332／b389／b479／b534／b539／b552・23字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d528_d539_d561_b332_b389_b479_b534_b539_b552.js）：
// - 優奈 d528／d539／d561 は20字で優奈の同率最長行（次点は19字の d08／d20／d23／d26／d32）。
//   d528 は優奈（face=shy・char=true を後半へ継承）、元の jump=d351 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d539 は白鳥、元の jump=d77 を後半へ引き継ぎ。「、」の後（13字）で分割。
//   d561 は悠太、元の jump=d48 を後半へ引き継ぎ。「。」の後（10字）で分割。
// - 美咲 b332／b389／b479／b534／b539／b552 は23字で美咲の同率最長行（次点は22字の b47／b54）。
//   b332 は相沢、元の jump=b47 を後半へ引き継ぎ。「。」の後（14字）で分割。
//   b389 は店長、元の jump=b292 を後半へ引き継ぎ。「。」の後（12字）で分割。
//   b479 は悠太、元の jump=b64 を後半へ引き継ぎ。「。」の後（13字）で分割。
//   b534 は美咲（face=smile・char=true を後半へ継承）、元の jump=b243 を後半へ引き継ぎ。「。」の後（12字）で分割。
//   b539 は美咲（face=smile・char=true を後半へ継承）、元の jump=b03 を後半へ引き継ぎ。「。」の後（11字）で分割。
//   b552 は悠太、元の jump=b244 を後半へ引き継ぎ。「、」の後（10字）で分割。
// 方式は qa/edit_d428_d429_d453_d476_b256_b288.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d751〜d753（優奈）・b677〜b682（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d528_d539_d561_b332_b389_b479_b534_b539_b552.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd528', 'd751', 6, '……今日は、', '帰りたくない気分ですけれど。'],
  ['yuna', 'd539', 'd752', 13, 'お茶にまで判子を押したら、', '味が変わります'],
  ['yuna', 'd561', 'd753', 10, '新しい糸と、古い糊。', '何度も手入れされてる'],
  ['misaki', 'b332', 'b677', 14, 'それ以外では、来られなくて。', '……事情が、あって'],
  ['misaki', 'b389', 'b678', 12, '……なったねえ、本当に。', '五年が、朝の店になった'],
  ['misaki', 'b479', 'b679', 13, 'いつもの軽いやつじゃない。', '目が笑ってなかった）'],
  ['misaki', 'b534', 'b680', 12, '五年が、終わったんだね。', '本当に。……夢みたいだ'],
  ['misaki', 'b539', 'b681', 11, '廃棄のお弁当、出たよ。', '今日は唐揚げが余ってるの'],
  ['misaki', 'b552', 'b682', 10, '俺は、ずっと前から、', '美咲さんのことが……好きで'],
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
console.log('OK: split d528->d751, d539->d752, d561->d753, b332->b677, b389->b678, b479->b679, b534->b680, b539->b681, b552->b682');
