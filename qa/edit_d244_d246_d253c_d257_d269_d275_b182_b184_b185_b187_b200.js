// W2 優奈の同率最長台詞（d244／d246／d253c／d257／d269／d275・21字）＋美咲の同率最長台詞（b182／b184／b185／b187／b200・24字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d244_d246_d253c_d257_d269_d275_b182_b184_b185_b187_b200.js）：
// - 優奈 d244／d246／d253c／d257／d269／d275 は21字で優奈の同率最長行（次点は21字の d328／d391）。
//   d244 は優奈（face=shy・char=true を後半へ継承）、元の jump=d332 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   d246 は優奈（face=love・char=true を後半へ継承）、元の jump=d521 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   d253c は優奈（face=love・char=true を後半へ継承）、元の jump=d477 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   d257 は悠太、元の jump=d513 を後半へ引き継ぎ。「。」の後（3字）で分割。
//   d269 は悠太、元の jump=d497 を後半へ引き継ぎ。「、」の後（15字）で分割。
//   d275 は優奈（face=smile・char=true を後半へ継承）、元の jump=d412 を後半へ引き継ぎ。「。」の後（14字）で分割。
// - 美咲 b182／b184／b185／b187／b200 は24字で美咲の同率最長行（次点は24字の b249／b255／b259）。
//   b182 は悠太、元の jump=b461 を後半へ引き継ぎ。「、」の後（18字）で分割。
//   b184 は悠太、元の jump=b492 を後半へ引き継ぎ。「、」の後（14字）で分割。
//   b185 は美咲（face=sad を後半へ継承）、元の jump=b378 を後半へ引き継ぎ。「、」の後（12字）で分割。
//   b187 は美咲（face=sad を後半へ継承）、元の jump=b424 を後半へ引き継ぎ。「、」の後（11字）で分割。
//   b200 は美咲（face=sad を後半へ継承）、元の jump=b428 を後半へ引き継ぎ。「。」の後（6字）で分割。
// 方式は qa/edit_d230_d240b_b146_b154_b163.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d711〜d716（優奈）・b638〜b642（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d244_d246_d253c_d257_d269_d275_b182_b184_b185_b187_b200.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd244', 'd711', 5, '……ふふ。', '悠太さんは、本当に優しいですね。'],
  ['yuna', 'd246', 'd712', 5, '違います。', '今のは『帰さないで』の意味です。'],
  ['yuna', 'd253c', 'd713', 8, '規則は守ります。', '自分の気持ちにも、正直に。'],
  ['yuna', 'd257', 'd714', 3, 'うん。', '優奈さんのペースでいこう、ゆっくり。'],
  ['yuna', 'd269', 'd715', 15, 'はいはい、家族は例外でしょう、', '館長公認で。'],
  ['yuna', 'd275', 'd716', 14, '悠太さん、今日はありがとう。', '助かりました。'],
  ['misaki', 'b182', 'b638', 18, '（この傘は、美咲の父親のものだった、', 'ってことか。'],
  ['misaki', 'b184', 'b639', 14, 'あの雨の日は……四十九日の、', '帰りだったんですか。'],
  ['misaki', 'b185', 'b640', 12, 'うん。お父さんの友達が、', 'わたしに気づいてくれて。'],
  ['misaki', 'b187', 'b641', 11, '相沢さんは、事故の時、', '一緒にいた人なんだと思う。'],
  ['misaki', 'b200', 'b642', 6, '言えるかな。', '……五年、言えなかったのに、わたし。'],
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
console.log('OK: split d244->d711, d246->d712, d253c->d713, d257->d714, d269->d715, d275->d716, b182->b638, b184->b639, b185->b640, b187->b641, b200->b642');
