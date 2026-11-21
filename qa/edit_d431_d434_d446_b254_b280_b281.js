// W2 優奈の同率最長台詞（d431／d434／d446・22字）＋美咲の同率最長台詞（b254／b280／b281・25字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d431_d434_d446_b254_b280_b281.js）：
// - 優奈 d431／d434／d446 は22字で優奈の同率最長行（d487／d554 も22字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d431 は白鳥、元の jump=d120 を後半へ引き継ぎ。「。」の後（13字）で分割。
//   d434 は優奈（face=serious・char=true を後半へ継承）、元の jump=d173 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   d446 は優奈（face=serious・char=true を後半へ継承）、元の jump=d67 を後半へ引き継ぎ。「。」の後（7字）で分割。
// - 美咲 b254／b280／b281 は25字で美咲の同率最長行（b285／b287／b491 も25字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   b254 は美咲（face=sad を後半へ継承）、元の jump=b437 を後半へ引き継ぎ。「。」の後（13字）で分割。
//   b280 は美咲（face=sleepy・char=true を後半へ継承）、元の jump=b323 を後半へ引き継ぎ。「。」の後（17字）で分割。
//   b281 は悠太、元の jump=b359 を後半へ引き継ぎ。「。」の後（13字）で分割。
// 方式は qa/edit_d371_d400_d414_d417_d427_b223_b224_b226_b227_b237.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d690〜d692（優奈）・b616〜b618（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d431_d434_d446_b254_b280_b281.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd431', 'd690', 13, '直す人が、現れましたから。', '待っていた人が、ね'],
  ['yuna', 'd434', 'd691', 10, '待ったは、今日まで。', '明日、この本は旅立ちます'],
  ['yuna', 'd446', 'd692', 7, '考える時間を。', '心の、製本が終わるまでの時間を'],
  ['misaki', 'b254', 'b616', 13, '傘、バックヤードに戻して。', 'いつもの場所に、お願い。'],
  ['misaki', 'b280', 'b617', 17, '……悠太くんの腕の中、あったかい。', '眠くなってきた。'],
  ['misaki', 'b281', 'b618', 13, 'おやすみなさい、美咲さん。', '明日も、隣にいますから。'],
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
console.log('OK: split d431->d690, d434->d691, d446->d692, b254->b616, b280->b617, b281->b618');
