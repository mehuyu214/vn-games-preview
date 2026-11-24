// W2 優奈の15字最長行（d204／d266／d269／d275c／d330／d336）＋美咲の16字最長行（b09／b11／b26／b60／b61／b76）の分割（文面不変・分割のみ）
// 実測（qa/measure_d204_d266_d269_d275c_d330_d336_b09_b11_b26_b60_b61_b76.js）：
// - 優奈 d204／d266／d269／d275c／d330／d336 は15字で優奈の同率最長行（次点も15字の d344／d350）。
//   d204 は優奈、元の jump=d707 を後半へ引き継ぎ。「、」の後（7字）で分割。face=serious・char=true を後半へ継承。
//   d266 は優奈、元の jump=d550 を後半へ引き継ぎ。「、」の後（5字）で分割。face=smile・char=true を後半へ継承。
//   d269 は悠太、元の jump=d715 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d275c は優奈、元の jump=d640 を後半へ引き継ぎ。「、」の後（8字）で分割。face=smile・char=true を後半へ継承。
//   d330 は白鳥、元の jump=d680 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d336 は榊、元の jump=d681 を後半へ引き継ぎ。「、」の後（4字）で分割。
// - 美咲 b09／b11／b26／b60／b61／b76 は16字で美咲の同率最長行（次点も16字の b81／b96）。
//   b09 は悠太、元の jump=b593 を後半へ引き継ぎ。「、」の後（3字）で分割。
//   b11 は悠太、元の jump=b622 を後半へ引き継ぎ。2つ目の「、」の後（7字）で分割。
//   b26 は相沢、元の jump=b328 を後半へ引き継ぎ。「……」の後（2字）で分割。
//   b60 は店長、元の jump=b335 を後半へ引き継ぎ。「……」の後（5字）で分割。
//   b61 は悠太、元の jump=b311 を後半へ引き継ぎ。2つ目の「、」の後（7字）で分割。
//   b76 は悠太、元の jump=b401 を後半へ引き継ぎ。「、」の後（5字）で分割。
// 方式は qa/edit_d199b_d202_b653_b667.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d949〜d954（優奈）・b876〜b881（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d204_d266_d269_d275c_d330_d336_b09_b11_b26_b60_b61_b76.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd204', 'd949', 7, '明日……はい、', '明日、渡します。'],
  ['yuna', 'd266', 'd950', 5, '『物語は、', '誰かの心に住むの』。'],
  ['yuna', 'd269', 'd951', 5, 'はいはい、', '家族は例外でしょう、'],
  ['yuna', 'd275c', 'd952', 8, '隣にいてくれて、', '助かりました。'],
  ['yuna', 'd330', 'd953', 7, '残りの半分は、', '誰かが持ってくれ'],
  ['yuna', 'd336', 'd954', 4, '日記に、', 'どうしても気になる一文'],
  ['misaki', 'b09', 'b876', 3, '店長、', '今ごろ帰ってきたんですか。'],
  ['misaki', 'b11', 'b877', 7, '（何が、どう、', 'なんとかなったのか'],
  ['misaki', 'b26', 'b878', 2, '……', '驚かせてしまったようですね。'],
  ['misaki', 'b60', 'b879', 5, 'おや。……', '来たんだねえ、ついに。'],
  ['misaki', 'b61', 'b880', 7, '店長、今の人、', '知ってるんですか。'],
  ['misaki', 'b76', 'b881', 5, '先週の人、', '結局来ませんでしたね。'],
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
console.log('OK: split d204->d949, d266->d950, d269->d951, d275c->d952, d330->d953, d336->d954, b09->b876, b11->b877, b26->b878, b60->b879, b61->b880, b76->b881');
