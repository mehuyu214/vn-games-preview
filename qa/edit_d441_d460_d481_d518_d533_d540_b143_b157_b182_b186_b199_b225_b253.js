// W2 優奈の17字最長行（d441／d460／d481／d518／d533／d540）＋美咲の18字最長行（b143／b157／b182／b186／b199／b225／b253）の分割（文面不変・分割のみ）
// 実測（qa/measure_d441_d460_d481_d518_d533_d540_b143_b157_b182_b186_b199_b225_b253.js）：
// - 優奈 d441／d460／d481／d518／d533／d540 は17字で優奈の同率最長行（次点も17字の d568／d593）。
//   d441 は優奈、face=serious・char=true を後半へ継承、元の jump=d241 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   d460 は優奈、face=shy・char=true を後半へ継承、元の jump=d243 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   d481 は榊、元の jump=d91 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d518 は優奈、face=sad・char=true を後半へ継承、元の jump=d197 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   d533 は優奈、face=shy・char=true を後半へ継承、元の jump=d31 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d540 は園田、元の jump=d341 を後半へ引き継ぎ。「、」の後（7字）で分割。
// - 美咲 b143／b157／b182／b186／b199／b225／b253 は18字で美咲の同率最長行（次点も18字の b262）。
//   b143 は店長、元の jump=b581 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b157 は悠太、元の jump=b665 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   b182 は悠太、元の jump=b638 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   b186 は悠太、元の jump=b585 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   b199 は悠太、元の jump=b493 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   b225 は相沢、元の jump=b305 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b253 は悠太、元の jump=b436 を後半へ引き継ぎ。「。」の後（7字）で分割。
// 方式は qa/edit_d425_d433_b140.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d877〜d882（優奈）・b804〜b810（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d441_d460_d481_d518_d533_d540_b143_b157_b182_b186_b199_b225_b253.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd441', 'd877', 10, '祖母の言葉じゃなく、', 'わたしの言葉で'],
  ['yuna', 'd460', 'd878', 8, '……言えました。', 'やっと、言えました'],
  ['yuna', 'd481', 'd879', 8, '『あの本だけは、', '図書館に残した』と'],
  ['yuna', 'd518', 'd880', 4, '半世紀、', '本の中で眠っていた告白です'],
  ['yuna', 'd533', 'd881', 6, '疑いもせず、', '本を返してくれるなんて'],
  ['yuna', 'd540', 'd882', 7, '謝りに来たら、', 'もう辞めていたんだ。'],
  ['misaki', 'b143', 'b804', 7, '前の店主から、', '傘ごと引き継いだんだ。'],
  ['misaki', 'b157', 'b805', 4, 'じゃあ、', '本当に待つしかないんですね。'],
  ['misaki', 'b182', 'b806', 6, '（この傘は、', '美咲の父親のものだった、'],
  ['misaki', 'b186', 'b807', 8, 'お父さんの傘を、', 'そっと返してくれた。'],
  ['misaki', 'b199', 'b808', 4, '言葉は、', 'その場で言えばいいんですよ。'],
  ['misaki', 'b225', 'b809', 7, '……事故の日、', '私は彼の隣にいました。'],
  ['misaki', 'b253', 'b810', 7, '美咲さん……。', '言葉、見つかりません。'],
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
console.log('OK: split d441->d877, d460->d878, d481->d879, d518->d880, d533->d881, d540->d882, b143->b804, b157->b805, b182->b806, b186->b807, b199->b808, b225->b809, b253->b810');
