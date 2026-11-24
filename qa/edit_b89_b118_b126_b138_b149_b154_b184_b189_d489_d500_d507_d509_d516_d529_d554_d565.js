// W2 美咲の次点最長行（b89／b118／b126／b138／b149／b154／b184／b189、14字・71件同率の先頭8件）＋優奈の最長行（d489／d500／d507／d509／d516／d529／d554／d565、14字・30件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_d489_d500_d507_d509_d516_d529_d554_d565_b89_b118_b126_b138_b149_b154_b184_b189.js）：
// - 美咲 b89／b118／b126／b138／b149／b154／b184／b189 は14字で美咲の次点最長行（71件同率の先頭8件）。
//   b89 は美咲、元の jump=b658 を後半へ引き継ぎ。「。」の後（3字）で分割。face=serious を後半へ継承。
//   b118 は悠太、元の jump=b512 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   b126 は美咲、元の jump=b578 を後半へ引き継ぎ。「。」の後（4字）で分割。face=sad を後半へ継承。
//   b138 は美咲、元の jump=b710 を後半へ引き継ぎ。「、」の後（6字）で分割。face=serious を後半へ継承。
//   b149 は店長、元の jump=b891 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   b154 は店長、元の jump=b636 を後半へ引き継ぎ。「、」の後（3字）で分割。
//   b184 は悠太、元の jump=b639 を後半へ引き継ぎ。「……」の後（8字）で分割。
//   b189 は美咲、元の jump=b514 を後半へ引き継ぎ。「、」の後（8字）で分割。face=serious を後半へ継承。
// - 優奈 d489／d500／d507／d509／d516／d529／d554／d565 は14字で優奈の最長行（30件同率の先頭8件）。
//   d489 は園田、元の jump=d228 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   d500 は悠太、元の jump=d44 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   d507 は優奈、元の jump=d142 を後半へ引き継ぎ。「、」の後（3字）で分割。face=serious・char=true を後半へ継承。
//   d509 は優奈、元の jump=d225 を後半へ引き継ぎ。「、」の後（10字）で分割。face=cry・char=true を後半へ継承。
//   d516 は悠太、元の jump=d52 を後半へ引き継ぎ。「、」の後（11字）で分割。
//   d529 は悠太、元の jump=d189 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d554 は悠太、元の jump=d694 を後半へ引き継ぎ。「壊れた」の後（7字）で分割（末尾の「、」だけを後半にしないため）。
//   d565 は悠太、元の jump=d78 を後半へ引き継ぎ。「が」の後（6字）で分割。
// 方式は qa/edit_b21_..._d472.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b977〜b984（美咲）・d1043〜d1050（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_b89_b118_b126_b138_b149_b154_b184_b189_d489_d500_d507_d509_d516_d529_d554_d565.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b89', 'b977', 3, 'うん。', '持ち主が取りに来たら、'],
  ['misaki', 'b118', 'b978', 5, '……はい。', '終わったら、必ず。'],
  ['misaki', 'b126', 'b979', 4, 'ううん。', '……雨の日に、聞く。'],
  ['misaki', 'b138', 'b980', 6, '閉店したら、', '落とし物は全部、'],
  ['misaki', 'b149', 'b981', 4, '『まあ、', 'なんとかなるっしょ』'],
  ['misaki', 'b154', 'b982', 3, '礼は、', '傘を返せてからにしな。'],
  ['misaki', 'b184', 'b983', 8, 'あの雨の日は……', '四十九日の、'],
  ['misaki', 'b189', 'b984', 8, '責めてるんじゃ、', 'ないと思う。'],
  ['yuna', 'd489', 'd1043', 9, 'わしたちの分まで、', 'ありがとう'],
  ['yuna', 'd500', 'd1044', 4, '心配で、', '放っておけないんです'],
  ['yuna', 'd507', 'd1045', 3, 'もう、', '隠すのは終わりにします'],
  ['yuna', 'd509', 'd1046', 10, 'こんなに近い場所で、', '半世紀も'],
  ['yuna', 'd516', 'd1047', 11, '司書見習いの礼儀です、', 'そこは'],
  ['yuna', 'd529', 'd1048', 5, '俺たちは、', 'その立会人になる）'],
  ['yuna', 'd554', 'd1049', 7, '背表紙の壊れた', '本たちですね、'],
  ['yuna', 'd565', 'd1050', 6, '当たり前だが', '名言に聞こえる）'],
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
console.log('OK: split b89->b977, b118->b978, b126->b979, b138->b980, b149->b981, b154->b982, b184->b983, b189->b984, d489->d1043, d500->d1044, d507->d1045, d509->d1046, d516->d1047, d529->d1048, d554->d1049, d565->d1050');
