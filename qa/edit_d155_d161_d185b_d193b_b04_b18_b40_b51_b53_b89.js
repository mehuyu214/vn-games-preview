// W2 優奈の同率最長台詞（d155／d161／d185b／d193b・20字）＋美咲の同率最長台詞（b04／b18／b40／b51／b53／b89・23字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d155_d161_d185b_d193b_b04_b18_b40_b51_b53_b89.js）：
// - 優奈 d155／d161／d185b／d193b は20字で優奈の同率最長行（次点も20字の d231／d242／d243／d243b）。
//   d155 は白鳥、元の jump=d358 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d161 は榊、jumpなし（次は d162）を後半へ引き継ぎ。「。」の後（7字）で分割。
//   d185b は悠太、jumpなし（次は d185c）を後半へ引き継ぎ。「。」の後（10字）で分割。
//   d193b は悠太、jumpなし（次は d193c）を後半へ引き継ぎ。「、」の後（7字）で分割。
// - 美咲 b04／b18／b40／b51／b53／b89 は23字で美咲の同率最長行（次点も23字の b90／b100）。
//   b04 は美咲（face=serious を後半へ継承）、元の jump=b535 を後半へ引き継ぎ。「。」の後（6字）で分割。
//   b18 は相沢、元の jump=b326 を後半へ引き継ぎ。「、」の後（15字）で分割。
//   b40 は悠太、元の jump=b397 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   b51 は美咲（face=sad を後半へ継承）、元の jump=b445 を後半へ引き継ぎ。「、」の後（13字）で分割。
//   b53 は悠太、元の jump=b446 を後半へ引き継ぎ。「？」＋全角スペースの後（10字）で分割。
//   b89 は美咲（face=serious を後半へ継承）、元の jump=b450 を後半へ引き継ぎ。「、」の後（14字）で分割。
// 方式は qa/edit_d07b_d17_d31_d145b_b418_b434.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d727〜d730（優奈）・b653〜b658（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d155_d161_d185b_d193b_b04_b18_b40_b51_b53_b89.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd155', 'd727', 6, '梓さんはね、', '最後まで後悔していましたよ。'],
  ['yuna', 'd161', 'd728', 7, '僕も、ですか。', '……ありがとう、ございます'],
  ['yuna', 'd185b', 'd729', 10, '（匂いだけじゃない。', 'もう気づいてる顔だ）'],
  ['yuna', 'd193b', 'd730', 7, '（優奈さんが、', '自分から切り出した……！）'],
  ['misaki', 'b04', 'b653', 6, '唐揚げ弁当。', '……いただく前に、まず供養するね。'],
  ['misaki', 'b18', 'b654', 15, 'あの……『あの雨の日の傘』は、', 'まだありますか。'],
  ['misaki', 'b40', 'b655', 8, '（高そうな傘だ。', '……いったい、誰のものなんだ。'],
  ['misaki', 'b51', 'b656', 13, 'あの……あの時の、お礼を、', 'ずっと言いたくて……'],
  ['misaki', 'b53', 'b657', 10, '（あの男？　友人？　', '話がまったく見えてこない。'],
  ['misaki', 'b89', 'b658', 14, 'うん。持ち主が取りに来たら、', 'お礼を言いたくて。'],
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
console.log('OK: split d155->d727, d161->d728, d185b->d729, d193b->d730, b04->b653, b18->b654, b40->b655, b51->b656, b53->b657, b89->b658');
