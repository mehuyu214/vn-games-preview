// W2 優奈の同率最長台詞（d256／d279／d332／d353・20字）＋美咲の同率最長台詞（b103／b132／b150／b151／b157／b160・23字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d256_d279_d332_d353_b103_b132_b150_b151_b157_b160.js）：
// - 優奈 d256／d279／d332／d353 は20字で優奈の同率最長行（次点も20字の d355／d374／d376／d381）。
//   d256 は優奈（face=pleasure・char=true・r18=true を後半へ継承）、元の jump=d532 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d279 は悠太、元の jump=d478 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   d332 は優奈（face=shy・char=true を後半へ継承）、元の jump=d538 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d353 は悠太、元の jump=d207 を後半へ引き継ぎ。「、」の後（8字）で分割。
// - 美咲 b103／b132／b150／b151／b157／b160 は23字で美咲の同率最長行（次点も23字の b167／b169）。
//   b103 は藤井、元の jump=b315 を後半へ引き継ぎ。「を」の後（11字）で分割。
//   b132 は美咲（face=confused・char=true を後半へ継承）、元の jump=b413 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   b150 は悠太、元の jump=b416 を後半へ引き継ぎ。「、」の後（11字）で分割。
//   b151 は店長、元の jump=b417 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   b157 は悠太、元の jump=b160 を後半へ引き継ぎ。「。」の後（18字）で分割。
//   b160 は藤井、元の jump=b317 を後半へ引き継ぎ。「が」の後（13字）で分割。
// 方式は qa/edit_d231_d242_d243_d243b_b90_b100.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d735〜d738（優奈）・b661〜b666（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d256_d279_d332_d353_b103_b132_b150_b151_b157_b160.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd256', 'd735', 8, 'ん……悠太さん、', '優しく、してくださいね。'],
  ['yuna', 'd279', 'd736', 10, '（言いかけた何かを、', '彼女はそっと閉じた。'],
  ['yuna', 'd332', 'd737', 8, 'わたしの勇気を、', 'いつも受け止めてくれる。'],
  ['yuna', 'd353', 'd738', 8, '大げさな演出は、', 'この物語には似合いません'],
  ['misaki', 'b103', 'b661', 11, 'さあ。そこは寝たふりを', '決め込まれちゃってねえ。'],
  ['misaki', 'b132', 'b662', 9, '店長が改まる日は、', 'ろくなことがないんですよね。'],
  ['misaki', 'b150', 'b663', 11, '前の店主の……じゃあ、', '店長が言い続けてたのは、'],
  ['misaki', 'b151', 'b664', 10, 'あの傘を預かった時、', 'あの人は笑って言ったんだ。'],
  ['misaki', 'b157', 'b665', 18, 'じゃあ、本当に待つしかないんですね。', '最後の雨を'],
  ['misaki', 'b160', 'b666', 13, '閉店！？　あたしの縄張りが', '消えちゃうじゃない！'],
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
console.log('OK: split d256->d735, d279->d736, d332->d737, d353->d738, b103->b661, b132->b662, b150->b663, b151->b664, b157->b665, b160->b666');
