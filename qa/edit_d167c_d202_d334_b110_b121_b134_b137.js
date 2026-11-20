// W2 優奈の同率最長台詞（d167c／d202／d334・27字）＋美咲の同率最長台詞（b110／b121／b134／b137・33字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d167c_d202_d334_b110_b121_b134_b137.js）：
// - 優奈 d167c／d202／d334 は27字で優奈の同率最長行（d338 も27字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d167c は優奈（face=smile・char=true を後半へ継承）、元の jump=d359 を後半へ引き継ぎ。1つ目の「。」の後で分割。
//   d202 は優奈（face=smile・char=true を後半へ継承）、元の jump=d389 を後半へ引き継ぎ。1つ目の「。」の後で分割。
//   d334 は悠太、元の jump=d48 を後半へ引き継ぎ。1つ目の「。」の後で分割。文末に句点なし（後続 d335 へ続く）
// - 美咲 b110／b121／b134／b137 は33字で美咲の同率最長行（b138／b166／b184／b199 も33字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b110 は美咲（face=serious・char=true を後半へ継承）、後続は b111。1つ目の「。」の後で分割。
//   b121 は美咲（face=confused を後半へ継承）、後続は b122。1つ目の「。」の後で分割。
//   b134 は店長、後続は b135。1つ目の「。」の後で分割。
//   b137 は悠太、後続は b138。1つ目の「。」の後で分割。
// 方式は qa/edit_d11_d57_d93_d117_d167_b82_b86_b88_b96.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d559〜d561（優奈）・b486〜b489（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d167c_d202_d334_b110_b121_b134_b137.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd167c', 'd559', 14, '本は、直せば応えてくれます。', '人と違って、正直ですから。'],
  ['yuna', 'd202', 'd560', 15, 'はい。毎週、ここに来る方です。', '窓際の席の、あの方です。'],
  ['yuna', 'd334', 'd561', 7, '修理の跡です。', '新しい糸と、古い糊。何度も手入れされてる'],
  ['misaki', 'b110', 'b486', 18, '五年分……どこから見ればいいのかな。', '量がすごいよ。台帳、三冊もある'],
  ['misaki', 'b121', 'b487', 15, '大島って……店長の名前だよね。', 'なんで店長の名前が、五年も前の台帳に'],
  ['misaki', 'b134', 'b488', 16, 'この店、来月末で閉店が決まった。', '再開発だってさ。ビルの建て替えでね'],
  ['misaki', 'b137', 'b489', 25, 'じゃあ、傘は……落とし物の傘は、どうなるんですか。', '閉店したら、全部'],
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
console.log('OK: split d167c->d559, d202->d560, d334->d561, b110->b486, b121->b487, b134->b488, b137->b489');
