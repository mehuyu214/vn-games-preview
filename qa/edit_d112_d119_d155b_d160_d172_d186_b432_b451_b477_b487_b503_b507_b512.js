// W2 優奈の16字最長行（d112／d119／d155b／d160／d172／d186）＋美咲の18字最長行（b432／b451／b477／b487／b503／b507／b512）の分割（文面不変・分割のみ）
// 実測（qa/measure_d112_d119_d155b_d160_d172_d186_b432_b451_b477_b487_b503_b507_b512.js）：
// - 優奈 d112／d119／d155b／d160／d172／d186 は16字で優奈の同率最長行（次点も16字の d208／d215）。
//   d112 は優奈、face=confused・char=true を後半へ継承、元の jump=d626 を後半へ引き継ぎ。「まで」の後（8字）で分割。
//   d119 は白鳥、元の jump=d431 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d155b は悠太、jumpなし（後続 d155c へ）、「、」の後（8字）で分割。
//   d160 は悠太、元の jump=d163 を後半へ引き継ぎ。「。」の後（7字）で分割。
//   d172 は優奈、face=serious・char=true を後半へ継承、元の jump=d434 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d186 は園田、元の jump=d610 を後半へ引き継ぎ。「、」の後（5字）で分割。
// - 美咲 b432／b451／b477／b487／b503／b507／b512 は18字で美咲の同率最長行（次点も18字の b514）。
//   b432 は相沢、元の jump=b231 を後半へ引き継ぎ。「。」の後（11字）で分割。
//   b451 は美咲、face=surprise・char=true を後半へ継承、元の jump=b99 を後半へ引き継ぎ。「。」の後（11字）で分割。
//   b477 は相沢、元の jump=b45 を後半へ引き継ぎ。「。」の後（11字）で分割。
//   b487 は美咲、face=confused を後半へ継承、元の jump=b122 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   b503 は美咲、face=love を後半へ継承、元の jump=b269 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   b507 は美咲、face=smile を後半へ継承、元の jump=b293 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   b512 は悠太、元の jump=b119 を後半へ引き継ぎ。「。」の後（13字）で分割。
// 方式は qa/edit_d16_d24_b421.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d893〜d898（優奈）・b820〜b826（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d112_d119_d155b_d160_d172_d186_b432_b451_b477_b487_b503_b507_b512.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd112', 'd893', 8, '館長、わたしまで', '呼ばれた理由は、'],
  ['yuna', 'd119', 'd894', 7, '止める理由が、', 'なかったからです。'],
  ['yuna', 'd155b', 'd895', 8, '（届ける勇気の、', '残りの半分……）'],
  ['yuna', 'd160', 'd896', 7, 'その意気です。', '俺も隣にいますから'],
  ['yuna', 'd172', 'd897', 6, 'ええ。でも、', 'もう終わりにします。'],
  ['yuna', 'd186', 'd898', 5, 'わしはね、', '後悔はしていないんだ。'],
  ['misaki', 'b432', 'b820', 11, 'ありがとう、美咲さん。', '……ありがとう'],
  ['misaki', 'b451', 'b821', 11, '何か、言ってましたか。', '車の中で、何か'],
  ['misaki', 'b477', 'b822', 11, '……ずっと、雨の日に。', '……そうですか'],
  ['misaki', 'b487', 'b823', 10, 'なんで店長の名前が、', '五年も前の台帳に'],
  ['misaki', 'b503', 'b824', 9, '分かってるくせに。', '何度も言わせないで'],
  ['misaki', 'b507', 'b825', 9, 'みんなのおかげで。', '……さあ、開店だよ'],
  ['misaki', 'b512', 'b826', 13, '二人で見ます、逃げません。', '約束します'],
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
console.log('OK: split d112->d893, d119->d894, d155b->d895, d160->d896, d172->d897, d186->d898, b432->b820, b451->b821, b477->b822, b487->b823, b503->b824, b507->b825, b512->b826');
