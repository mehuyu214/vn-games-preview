// W2 美咲の最長行（b515／b517／b561／b576／b580／b595／b600／b601、13字・34件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_misaki13_b515_b517_b561_b576_b580_b595_b600_b601.js）：
// - 美咲 b515／b517／b561／b576／b580／b595／b600／b601 は13字で美咲の最長台詞行（14字行は0件）。
//   b515 は悠太、元の jump=b207 を後半へ引き継ぎ。「。」の後（6字）で分割。
//   b517 は美咲、元の jump=b273 を後半へ引き継ぎ。face=shy を後半へ継承。「し」の後（8字）で分割。
//   b561 は美咲、元の jump=b350 を後半へ引き継ぎ。face=sad を後半へ継承。「に」の後（7字）で分割。
//   b576 は美咲、元の jump=b339 を後半へ引き継ぎ。face=serious を後半へ継承。「』」の後（8字）で分割。
//   b580 は店長、元の jump=b340 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b595 は悠太、元の jump=b309 を後半へ引き継ぎ。「じ」の後（7字）で分割。
//   b600 は悠太、元の jump=b369 を後半へ引き継ぎ。「ん」の後（7字）で分割。
//   b601 は美咲、元の jump=b371 を後半へ引き継ぎ。face=serious を後半へ継承。「、」の後（7字）で分割。
// 方式は qa/edit_misaki13_b433_b439_b444_b475_b479_b495_b505_b512.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b1096〜b1103（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_misaki13_b515_b517_b561_b576_b580_b595_b600_b601.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b515', 'b1096', 6, '必ず来ます。', '俺が保証します'],
  ['misaki', 'b517', 'b1097', 8, 'んっ……優しくし', 'て、お願い'],
  ['misaki', 'b561', 'b1098', 7, 'ここまで一緒に', 'いてくれて。'],
  ['misaki', 'b576', 'b1099', 8, '大島に引き継ぐ』', '……大島？'],
  ['misaki', 'b580', 'b1100', 7, '……なんとか、', 'しないとね。'],
  ['misaki', 'b595', 'b1101', 7, '普段はあんなじ', 'ゃなくて……'],
  ['misaki', 'b600', 'b1102', 7, 'はバレバレなん', 'ですけどね。'],
  ['misaki', 'b601', 'b1103', 7, '……これだね、', '間違いない。'],
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
console.log('OK: split b515->b1096, b517->b1097, b561->b1098, b576->b1099, b580->b1100, b595->b1101, b600->b1102, b601->b1103');
