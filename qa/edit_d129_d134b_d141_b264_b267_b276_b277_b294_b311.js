// W2 優奈の同率最長台詞（d129／d134b／d141・19字）＋美咲の同率最長台詞（b264／b267／b276／b277／b294／b311・22字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d129_d134b_d141_b264_b267_b276_b277_b294_b311.js）：
// - 優奈 d129／d134b／d141 は19字で優奈の同率最長行（次点も19字の d143／d143b／d145／d150／d169）。
//   d129 は優奈（face=sad・char=true を後半へ継承）、元の jump=d605 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d134b は悠太、jump なし・次は d134c を後半へ引き継ぎ。「。」の後（8字）で分割。
//   d141 は優奈（face=serious・char=true を後半へ継承）、元の jump=d507 を後半へ引き継ぎ。「。」の後（8字）で分割。
// - 美咲 b264／b267／b276／b277／b294／b311 は22字で美咲の同率最長行（次点も22字の b327／b362）。
//   b264 は美咲（face=shy を後半へ継承）、元の jump=b516 を後半へ引き継ぎ。「。」の後（7字）で分割。
//   b267 は悠太、元の jump=b469 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   b276 は美咲（face=ecstasy・r18=true を後半へ継承）、元の jump=b298 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   b277 は美咲（face=love・r18=true を後半へ継承）、元の jump=b439 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   b294 は相沢、元の jump=b53 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   b311 は悠太、元の jump=b62 を後半へ引き継ぎ。「。」の後（9字）で分割。
// 方式は qa/edit_d51_d98_d104_d121_d128_b238_b247.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d767〜d769（優奈）・b693〜b698（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d129_d134b_d141_b264_b267_b276_b277_b294_b311.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd129', 'd767', 7, '未返却の本は、', '除籍されるはずなんです。'],
  ['yuna', 'd134b', 'd768', 8, '（爺の昔話、か。', '……聞かせてもらおう）'],
  ['yuna', 'd141', 'd769', 8, '全部、話します。', '悠太さんにだけ、全部。'],
  ['misaki', 'b264', 'b693', 7, '……わたしも。', '待つのは、もう終わりにするの。'],
  ['misaki', 'b267', 'b694', 10, '俺で、いいんですか。', '……俺で、いいんですね。'],
  ['misaki', 'b276', 'b695', 10, 'ああっ……悠太くん、', '悠太くん……大好き……！'],
  ['misaki', 'b277', 'b696', 8, 'わたしたちの子、', 'できたらいいな……本気だよ。'],
  ['misaki', 'b294', 'b697', 10, '知人、と言うべきか。', '……本人では、ありません'],
  ['misaki', 'b311', 'b698', 9, '教えてくださいよ。', '『来たんだねえ』って何です'],
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
console.log('OK: split d129->d767, d134b->d768, d141->d769, b264->b693, b267->b694, b276->b695, b277->b696, b294->b697, b311->b698');
