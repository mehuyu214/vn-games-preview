// W2 優奈の同率最長台詞（d143／d143b／d145／d150／d169・19字）＋美咲の同率最長台詞（b327／b362・22字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d143_d143b_d145_d150_d169_b327_b362.js）：
// - 優奈 d143／d143b／d145／d150／d169 は19字で優奈の同率最長行（次点も19字の d185／d196／d224）。
//   d143 は優奈（face=serious・char=true を後半へ継承）、元の jump=d370 を後半へ引き継ぎ。「除籍」の後（10字）で分割。
//   d143b は優奈（face=serious・char=true を後半へ継承）、元の jump=d606 を後半へ引き継ぎ。「処分」の後（10字）で分割。
//   d145 は優奈（face=sad・char=true を後半へ継承）、元の jump=d419 を後半へ引き継ぎ。「本の」の後（9字）で分割。
//   d150 は悠太、元の jump=d432 を後半へ引き継ぎ。「言い訳」の後（11字）で分割。
//   d169 は悠太、元の jump=d405 を後半へ引き継ぎ。「渡す」の後（8字）で分割。
// - 美咲 b327／b362 は22字で美咲の同率最長行（次点も22字の b391／b449／b482／b530／b543）。
//   b327 は悠太、元の jump=b23 を後半へ引き継ぎ。「。」の後（13字）で分割。
//   b362 は相沢、元の jump=b32 を後半へ引き継ぎ。「。」の後（11字）で分割。
// 方式は qa/edit_d129_d134b_d141_b264_b267_b276_b277_b294_b311.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d770〜d774（優奈）・b699〜b700（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d143_d143b_d145_d150_d169_b327_b362.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd143', 'd770', 10, 'この本は、祖母が除籍', 'しなかった本です。'],
  ['yuna', 'd143b', 'd771', 10, '未返却で、本当は処分', 'されるはずでした。'],
  ['yuna', 'd145', 'd772', 9, '手紙は、祖母が本の', '中に残したものです。'],
  ['yuna', 'd150', 'd773', 11, '（修理は、彼女の言い訳', 'でもあったんだ。'],
  ['yuna', 'd169', 'd774', 8, '直すたびに、渡す', '覚悟が要りますからね。'],
  ['misaki', 'b327', 'b699', 13, '大丈夫ですか、座りますか。', '水、持ってきますか'],
  ['misaki', 'b362', 'b700', 11, '急がなくて結構ですよ。', '彼女のペースで、どうぞ'],
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
console.log('OK: split d143->d770, d143b->d771, d145->d772, d150->d773, d169->d774, b327->b699, b362->b700');
