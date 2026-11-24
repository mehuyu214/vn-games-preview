// W2 優奈の15字最長行（d03／d44／d66／d72／d87／d111）＋美咲の17字最長行（b388／b407／b436／b459／b485／b488）の分割（文面不変・分割のみ）
// 実測（qa/measure_d03_d44_d66_d72_d87_d111_b388_b407_b436_b459_b485_b488.js）：
// - 優奈 d03／d44／d66／d72／d87／d111 は15字で優奈の同率最長行（次点も15字の d120／d135）。
//   d03 は優奈、元の jump=d490 を後半へ引き継ぎ。9字で分割。face=smile・char=true を後半へ継承。
//   d44 は優奈、元の jump=d579 を後半へ引き継ぎ。10字で分割。face=serious・char=true を後半へ継承。
//   d66 は優奈、元の jump=d446 を後半へ引き継ぎ。6字で分割。face=serious・char=true を後半へ継承。
//   d72 は優奈、元の jump=d600 を後半へ引き継ぎ。9字で分割。face=serious・char=true を後半へ継承。
//   d87 は悠太、元の jump=d603 を後半へ引き継ぎ。7字で分割。
//   d111 は白鳥、元の jump=d585 を後半へ引き継ぎ。9字で分割。
// - 美咲 b388／b407／b436／b459／b485／b488 は17字で美咲の同率最長行（次点も17字の b494／b496）。
//   b388 は美咲、元の jump=b267 を後半へ引き継ぎ。「。」の後（7字）で分割。face=smile を後半へ継承。
//   b407 は美咲、元の jump=b107 を後半へ引き継ぎ。「……」の後（6字）で分割。face=serious を後半へ継承。
//   b436 は悠太、元の jump=b254 を後半へ引き継ぎ。「。」の後（7字）で分割。
//   b459 は店長、元の jump=b171 を後半へ引き継ぎ。「。」の後（7字）で分割。
//   b485 は悠太、元の jump=b97 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   b488 は店長、元の jump=b135 を後半へ引き継ぎ。「。」の後（8字）で分割。
// 方式は qa/edit_d712_d719_b342_b358.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d933〜d938（優奈）・b860〜b865（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d03_d44_d66_d72_d87_d111_b388_b407_b436_b459_b485_b488.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd03', 'd933', 9, 'おはようございます', '、悠太さん。'],
  ['yuna', 'd44', 'd934', 10, 'わたしは、規則を守る', '司書です。'],
  ['yuna', 'd66', 'd935', 6, '……少しだけ', '、時間をください。'],
  ['yuna', 'd72', 'd936', 9, '園田さん、その席は', '指定席では、'],
  ['yuna', 'd87', 'd937', 7, '（出た、今日の', '『閉館ですよ』。'],
  ['yuna', 'd111', 'd938', 9, '悠太さん、よく来て', 'くれました。'],
  ['misaki', 'b388', 'b860', 7, 'もう待たない。', '自分から、歩いていく'],
  ['misaki', 'b407', 'b861', 6, '勝手には……', '見ちゃいけないものです'],
  ['misaki', 'b436', 'b862', 7, 'ごめんなさい。', '俺も、隣で固まってて'],
  ['misaki', 'b459', 'b863', 7, '大きいのだよ。', '台風並みって言ってた'],
  ['misaki', 'b485', 'b864', 8, 'ここは店ですよ。', '家と間違えてません'],
  ['misaki', 'b488', 'b865', 8, '再開発だってさ。', 'ビルの建て替えでね'],
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
console.log('OK: split d03->d933, d44->d934, d66->d935, d72->d936, d87->d937, d111->d938, b388->b860, b407->b861, b436->b862, b459->b863, b485->b864, b488->b865');
