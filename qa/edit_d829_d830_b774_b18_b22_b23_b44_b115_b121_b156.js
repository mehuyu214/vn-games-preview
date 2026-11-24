// W2 優奈の15字最長行（d829／d830）＋美咲の16字最長行（b774）＋美咲の次点15字行（b18／b22／b23／b44／b115／b121／b156）の分割（文面不変・分割のみ）
// 実測（qa/measure_d829_d830_b774_b18_b22_b23_b44_b115_b121_b156.js）：
// - 優奈 d829／d830 は15字で優奈の同率最長行（2件同率）。
//   d829 は優奈、元の jump=d240b を後半へ引き継ぎ。「じゃ」の後（6字）で分割。face=serious・char=true を後半へ継承。
//   d830 は悠太、元の jump=d99 を後半へ引き継ぎ。「人を」の後（7字）で分割。
// - 美咲 b774 は16字で美咲の最長行（単独）。
//   b774 は美咲、元の jump=b517 を後半へ引き継ぎ。「、」の後（7字）で分割。face=shy・r18=true を後半へ継承。
// - 美咲 b18／b22／b23／b44／b115／b121／b156 は15字で美咲の次点最長行（7件同率）。
//   b18 は相沢、元の jump=b654 を後半へ引き継ぎ。「……」の後（4字）で分割。
//   b22 は悠太、元の jump=b327 を後半へ引き継ぎ。「？　」の後（6字）で分割。
//   b23 は美咲、元の jump=b393 を後半へ引き継ぎ。「。」の後（7字）で分割。face=serious を後半へ継承（charなし）。
//   b44 は相沢、元の jump=b477 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   b115 は悠太、元の jump=b303 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b121 は美咲、元の jump=b487 を後半へ引き継ぎ。「……」の後（6字）で分割。face=confused を後半へ継承（charなし）。
//   b156 は店長、元の jump=b559 を後半へ引き継ぎ。「。」の後（11字）で分割。
// 方式は qa/edit_d718_..._b755.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d995〜d996（優奈）・b922〜b929（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d829_d830_b774_b18_b22_b23_b44_b115_b121_b156.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd829', 'd995', 6, '直すだけじゃ', '終われませんから。'],
  ['yuna', 'd830', 'd996', 7, 'この緩さが人を', '救うこともある）'],
  ['misaki', 'b774', 'b922', 7, 'わたしの全部、', '悠太くんにあげる。'],
  ['misaki', 'b18', 'b923', 4, 'あの……', '『あの雨の日の傘』は、'],
  ['misaki', 'b22', 'b924', 6, '美咲さん？　', '顔、真っ白ですよ。'],
  ['misaki', 'b23', 'b925', 7, '……悠太くん。', 'レジ、代わって。'],
  ['misaki', 'b44', 'b926', 8, '……そうですか。', '五年、ですか。'],
  ['misaki', 'b115', 'b927', 5, '大島って、', '店長の名前ですよね。'],
  ['misaki', 'b121', 'b928', 6, '大島って……', '店長の名前だよね。'],
  ['misaki', 'b156', 'b929', 11, '連絡先は、知らないよ。', '本当に。'],
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
console.log('OK: split d829->d995, d830->d996, b774->b922, b18->b923, b22->b924, b23->b925, b44->b926, b115->b927, b121->b928, b156->b929');
