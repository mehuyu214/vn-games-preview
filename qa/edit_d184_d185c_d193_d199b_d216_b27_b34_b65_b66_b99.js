// W2 優奈の同率最長台詞（d184／d185c／d193／d199b／d216・22字）＋美咲の同率最長台詞（b27／b34／b65／b66／b99・25字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d184_d185c_d193_d199b_d216_b27_b34_b65_b66_b99.js）：
// - 優奈 d184／d185c／d193／d199b／d216 は22字で優奈の同率最長行（d226／d232／d240 も22字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   d184 は榊、元の jump=d374 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d185c は園田、元の jump=d458 を後半へ引き継ぎ。「。」の後（12字）で分割。
//   d193 は優奈（face=serious・char=true を後半へ継承）、元の jump=d437 を後半へ引き継ぎ。「。」の後（15字）で分割。
//   d199b は榊、元の jump=d376 を後半へ引き継ぎ。「。」の後（15字）で分割。
//   d216 は園田、元の jump=d425 を後半へ引き継ぎ。「。」の後（10字）で分割。
// - 美咲 b27／b34／b65／b66／b99 は25字で美咲の同率最長行（b104／b119／b136 も25字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   b27 は悠太、元の jump=b309 を後半へ引き継ぎ。「、」の後（12字）で分割。
//   b34 は藤井、元の jump=b363 を後半へ引き継ぎ。「。」の後（6字）で分割。
//   b65 は悠太、元の jump=b448 を後半へ引き継ぎ。「。」の後（11字）で分割。
//   b66 は美咲（face=serious を後半へ継承）、元の jump=b480 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   b99 は藤井、元の jump=b406 を後半へ引き継ぎ。「。」の後（19字）で分割。
// 方式は qa/edit_d171_d174_d182_b05_b09_b13.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d669〜d673（優奈）・b595〜b599（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d184_d185c_d193_d199b_d216_b27_b34_b65_b66_b99.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd184', 'd669', 8, '祖母の日記にも、', '同じことが書いてありました。'],
  ['yuna', 'd185c', 'd670', 12, '明日、何かあるんだろう。', '顔を見れば分かるよ。'],
  ['yuna', 'd193', 'd671', 15, '榊さん、少しお話ができますか。', '大事な話です。'],
  ['yuna', 'd199b', 'd672', 15, '祖母の想いを、届けたいんです。', 'それだけです。'],
  ['yuna', 'd216', 'd673', 10, 'ああ、すまなかった。', '返しそびれてしまってね。'],
  ['misaki', 'b27', 'b595', 12, 'いえ、あの、うちの先輩、', '普段はあんなじゃなくて……'],
  ['misaki', 'b34', 'b596', 6, 'まあいいや。', 'お兄ちゃん、ホットコーヒーちょうだい。'],
  ['misaki', 'b65', 'b597', 11, '内緒って、何をですか。', '俺、何も分かってないですよ。'],
  ['misaki', 'b66', 'b598', 5, '……全部。', '傘のことも、あの人のことも、今夜の全部。'],
  ['misaki', 'b99', 'b599', 19, '車の中でずっと、窓の外を見て言ったの。', 'ぽつりとね。'],
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
  secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split d184->d669, d185c->d670, d193->d671, d199b->d672, d216->d673, b27->b595, b34->b596, b65->b597, b66->b598, b99->b599');
