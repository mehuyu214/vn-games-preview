// W2 美咲の残る最長行（b772／b795／b801／b805／b808／b843／b878、14字・7件全部）の分割（文面不変・分割のみ）
// 実測（qa/measure_misaki14_b772_b795_b801_b805_b808_b843_b878.js）：
// - 美咲 b772／b795／b801／b805／b808／b843／b878 は14字で美咲の最長行（7件同率の残り全部）。
//   b772 は美咲、元の jump=b466 を後半へ引き継ぎ。face=serious・char=true を後半へ継承。「、」の後（3字）で分割。
//   b795 は藤井、元の jump=b318 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   b801 は悠太、元の jump=b338 を後半へ引き継ぎ。「と」の後（6字）で分割。
//   b805 は悠太、元の jump=b665 を後半へ引き継ぎ。「待つ」の後（5字）で分割。
//   b808 は悠太、元の jump=b493 を後半へ引き継ぎ。「言えば」の後（7字）で分割。
//   b843 は店長、元の jump=b604 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   b878 は相沢、元の jump=b328 を後半へ引き継ぎ。「しまった」の後（8字）で分割。
// 方式は qa/edit_misaki14_b696_..._b771.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b1041〜b1047（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_misaki14_b772_b795_b801_b805_b808_b843_b878.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b772', 'b1041', 3, 'まず、', 'これを読んでください。'],
  ['misaki', 'b795', 'b1042', 10, '待ってるみたいだよ、', 'あの人。'],
  ['misaki', 'b801', 'b1043', 6, '他のページと', '字が違いますね。'],
  ['misaki', 'b805', 'b1044', 5, '本当に待つ', 'しかないんですね。'],
  ['misaki', 'b808', 'b1045', 7, 'その場で言えば', 'いいんですよ。'],
  ['misaki', 'b843', 'b1046', 4, '『まあ、', 'なんとかなるっしょ』'],
  ['misaki', 'b878', 'b1047', 8, '驚かせてしまった', 'ようですね。'],
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
console.log('OK: split b772->b1041, b795->b1042, b801->b1043, b805->b1044, b808->b1045, b843->b1046, b878->b1047');
