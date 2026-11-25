// W2 美咲の次点最長行（b483／b491／b494／b498／b506／b521／b530／b533、14字・39件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_misaki14_b483_b491_b494_b498_b506_b521_b530_b533.js）：
// - 美咲 b483／b491／b494／b498／b506／b521／b530／b533 は14字で美咲の次点最長行（39件同率の先頭8件）。
//   b483 は悠太、元の jump=b727 を後半へ引き継ぎ。「た」の後（9字）で分割。
//   b491 は藤井、元の jump=b728 を後半へ引き継ぎ。「医者が」の後（7字）で分割。
//   b494 は相沢、元の jump=b866 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b498 は相沢、元の jump=b729 を後半へ引き継ぎ。「見」の後（7字）で分割。
//   b506 は悠太、元の jump=b285 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   b521 は相沢、元の jump=b58 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b530 は悠太、元の jump=b704 を後半へ引き継ぎ。「予」の後（7字）で分割。
//   b533 は悠太、元の jump=b194 を後半へ引き継ぎ。「。」の後（8字）で分割。
// 方式は qa/edit_d706_..._b478.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b1009〜b1016（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_misaki14_b483_b491_b494_b498_b506_b521_b530_b533.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b483', 'b1009', 9, '名前も聞けなかった', 'んですか。'],
  ['misaki', 'b491', 'b1010', 7, '目当ての医者が', 'いるんだとか、'],
  ['misaki', 'b494', 'b1011', 7, '……開けても、', 'いいんですか。'],
  ['misaki', 'b498', 'b1012', 7, '今日は、顔を見', 'られただけで。'],
  ['misaki', 'b506', 'b1013', 8, '大事な字ですよ。', '店の宝物です'],
  ['misaki', 'b521', 'b1014', 7, '……預かって、', 'いただけますか'],
  ['misaki', 'b530', 'b1015', 7, '……俺も嫌な予', '感しかしない。'],
  ['misaki', 'b533', 'b1016', 8, 'きっと書けます。', '思ったままを'],
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
console.log('OK: split b483->b1009, b491->b1010, b494->b1011, b498->b1012, b506->b1013, b521->b1014, b530->b1015, b533->b1016');
