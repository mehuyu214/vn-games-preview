// W2 美咲の最長行（b229／b232／b240／b254／b262／b270／b275／b281、13字・66件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_misaki13_b229_b232_b240_b254_b262_b270_b275_b281.js）：
// - 美咲 b229／b232／b240／b254／b262／b270／b275／b281 は13字で美咲の最長行（14字行は0件）。
//   b229 は美咲、元の jump=b564 を後半へ引き継ぎ。face=smile を後半へ継承。「る」の後（6字）で分割。
//   b232 は相沢、元の jump=b468 を後半へ引き継ぎ。「私」の後（6字）で分割。
//   b240 は相沢、元の jump=b714 を後半へ引き継ぎ。「……」の後（7字）で分割。
//   b254 は美咲、元の jump=b616 を後半へ引き継ぎ。face=sad を後半へ継承。「ー」の後（7字）で分割。
//   b262 は美咲、元の jump=b811 を後半へ引き継ぎ。face=shy・char=true を後半へ継承。「さ」の後（6字）で分割。
//   b270 は美咲、元の jump=b471 を後半へ引き継ぎ。face=love・char=true・r18=true を後半へ継承。「は」の後（6字）で分割。
//   b275 は悠太、元の jump=b518 を後半へ引き継ぎ。r18=true を後半へ継承。「も」の後（7字）で分割。
//   b281 は悠太、元の jump=b618 を後半へ引き継ぎ。「い」の後（7字）で分割。
// 方式は qa/edit_misaki13_b102_b114_b117_b139_b144_b147_b160_b188.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b1064〜b1071（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_misaki13_b229_b232_b240_b254_b262_b270_b275_b281.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b229', 'b1064', 6, '『傘を貸せる', '人間であれ』。'],
  ['misaki', 'b232', 'b1065', 6, '代わりに、私', 'の傘をどうぞ。'],
  ['misaki', 'b240', 'b1066', 7, '美咲さん。……', 'お父さんに、'],
  ['misaki', 'b254', 'b1067', 7, '傘、バックヤー', 'ドに戻して。'],
  ['misaki', 'b262', 'b1068', 6, '悠太くん。さ', 'っきの、続き。'],
  ['misaki', 'b270', 'b1069', 6, 'ねえ。今夜は', '、帰さないよ。'],
  ['misaki', 'b275', 'b1070', 7, '離しません。も', 'う、ずっと。'],
  ['misaki', 'b281', 'b1071', 7, 'おやすみなさい', '、美咲さん。'],
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
console.log('OK: split b229->b1064, b232->b1065, b240->b1066, b254->b1067, b262->b1068, b270->b1069, b275->b1070, b281->b1071');
