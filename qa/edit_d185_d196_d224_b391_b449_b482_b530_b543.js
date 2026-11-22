// W2 優奈の同率最長台詞（d185／d196／d224・19字）＋美咲の同率最長台詞（b391／b449／b482／b530／b543・22字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d185_d196_d224_b391_b449_b482_b530_b543.js）：
// - 優奈 d185／d196／d224 は19字で優奈の同率最長行（次点も19字の d229／d241／d268／d276／d329）。
//   d185 は園田、元の jump=d457 を後半へ引き継ぎ。「皆さん。」の後（7字）で分割。
//   d196 は優奈（face=sad・char=true を後半へ継承）、元の jump=d423 を後半へ引き継ぎ。「宛てて」の後（11字）で分割。
//   d224 は優奈（face=cry・char=true を後半へ継承）、元の jump=d509 を後半へ引き継ぎ。「ずっと」の後（7字）で分割。
// - 美咲 b391／b449／b482／b530／b543 は22字で美咲の同率最長行（次点は21字の b55／b80／b91）。
//   b391 は店長、元の jump=b11 を後半へ引き継ぎ。「。」の後（13字）で分割。
//   b449 は美咲（face=sad を後半へ継承）、元の jump=b84 を後半へ引き継ぎ。「、」の後（12字）で分割。
//   b482 は悠太、元の jump=b83 を後半へ引き継ぎ。「、」の後（12字）で分割。
//   b530 は悠太、元の jump=b134 を後半へ引き継ぎ。「。」の後（14字）で分割。
//   b543 は美咲（face=sad・char=true を後半へ継承）、元の jump=b69 を後半へ引き継ぎ。「。」の後（10字）で分割。
// 方式は qa/edit_d143_d143b_d145_d150_d169_b327_b362.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d775〜d777（優奈）・b701〜b705（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d185_d196_d224_b391_b449_b482_b530_b543.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd185', 'd775', 7, 'やあ、皆さん。', 'お茶の匂いに釣られてね。'],
  ['yuna', 'd196', 'd776', 11, '祖母が、ある方に宛てて', '書いた手紙です。'],
  ['yuna', 'd224', 'd777', 7, '二人は、ずっと', 'すれ違っていたんですね。'],
  ['misaki', 'b391', 'b701', 13, '傘は途中で裏返ったけどね。', '骨が一本、逝ったよ'],
  ['misaki', 'b449', 'b702', 12, 'ずぶ濡れのわたしを見て、', '黙って傘を差し出して'],
  ['misaki', 'b482', 'b703', 12, '……相沢さんじゃなくて、', '別の人。傘をくれた人'],
  ['misaki', 'b530', 'b704', 14, '……俺も嫌な予感しかしない。', '封筒が分厚いし）'],
  ['misaki', 'b543', 'b705', 10, '今は、まだ話せない。', '心の整理が、ついてなくて'],
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
console.log('OK: split d185->d775, d196->d776, d224->d777, b391->b701, b449->b702, b482->b703, b530->b704, b543->b705');
