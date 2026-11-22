// W2 優奈の同率最長台詞（d535／d542／d546・19字）＋美咲の同率最長台詞（b472／b476／b483／b491／b498・21字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d535_d542_d546_b472_b476_b483_b491_b498.js）：
// - 優奈 d535／d542／d546 は19字で優奈の同率最長行（次点も19字の d557）。
//   d535 は白鳥、元の jump=d360 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d542 は優奈（face=sad・char=true を後半へ継承）、元の jump=d343 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d546 は榊、元の jump=d482 を後半へ引き継ぎ。「、」の後（8字）で分割。
// - 美咲 b472／b476／b483／b491／b498 は21字で美咲の同率最長行（次点も21字の b502／b505／b538）。
//   b472 は美咲（face=smile・char=true を後半へ継承）、元の jump=b284 を後半へ引き継ぎ。「。」の後（14字）で分割。
//   b476 は美咲、元の jump=b48 を後半へ引き継ぎ。「。」の後（15字）で分割。
//   b483 は悠太、元の jump=b87 を後半へ引き継ぎ。「。」の後（14字）で分割。
//   b491 は藤井、元の jump=b621 を後半へ引き継ぎ。「、」の後（14字）で分割。
//   b498 は相沢、元の jump=b247 を後半へ引き継ぎ。「。」の後（14字）で分割。
// 方式は qa/edit_d442_d443_d448_d490_d519_b335_b468_b471.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d799〜d801（優奈）・b725〜b729（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d535_d542_d546_b472_b476_b483_b491_b498.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd535', 'd799', 7, '明日のために、', '今日は早く休みましょう。'],
  ['yuna', 'd542', 'd800', 8, '直している間は、', '渡さなくて済むんです。'],
  ['yuna', 'd546', 'd801', 8, '諦めませんので、', 'よろしくお願いします。'],
  ['misaki', 'b472', 'b725', 14, '看板、届かなくなってきたよ。', 'よいしょ、っと'],
  ['misaki', 'b476', 'b726', 15, '今は……ごめんね、先に行って。', 'レジ、お願い'],
  ['misaki', 'b483', 'b727', 14, '名前も聞けなかったんですか。', 'お礼も言えずに'],
  ['misaki', 'b491', 'b728', 14, '目当ての医者がいるんだとか、', '本人の口から。'],
  ['misaki', 'b498', 'b729', 14, '今日は、顔を見られただけで。', '十分です、私は'],
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
console.log('OK: split d535->d799, d542->d800, d546->d801, b472->b725, b476->b726, b483->b727, b491->b728, b498->b729');
