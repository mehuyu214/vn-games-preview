// W2 優奈の次点最長台詞（d557・19字）＋美咲の次点最長台詞（b502／b505／b538・21字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d557_b502_b505_b538.js）：
// - 優奈 d557 は19字で優奈の最長行（次点は18字の d06／d10／d28／d34／d48／d71b／d85）。
//   d557 は白鳥、元の jump=d404 を後半へ引き継ぎ。「、」の後（12字）で分割。
// - 美咲 b502／b505／b538 は21字で美咲の同率最長行（次点も21字の b544）。
//   b502 は美咲（face=smile・char=true を後半へ継承）、元の jump=b259 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   b505 は悠太、元の jump=b274 を後半へ引き継ぎ。「。」の後（13字）で分割。
//   b538 は美咲（face=sad・char=true を後半へ継承）、元の jump=b385 を後半へ引き継ぎ。「言わなきゃ」の後（9字）で分割。
// 方式は qa/edit_d535_d542_d546_b472_b476_b483_b491_b498.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d802（優奈）・b730〜b732（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d557_b502_b505_b538.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd557', 'd802', 12, 'ずっと、見ていましたよ、', '貴方の修理を。'],
  ['misaki', 'b502', 'b730', 10, '供養しよう、二人で。', '今日は唐揚げが余ってる'],
  ['misaki', 'b505', 'b731', 13, '目、逸らさないでください。', 'ずっと見ていたい'],
  ['misaki', 'b538', 'b732', 9, 'その……言わなきゃ', 'いけないことがあって……'],
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
console.log('OK: split d557->d802, b502->b730, b505->b731, b538->b732');
