// W2 美咲の残る最長行（b836／b876、13字・2件全部）＋優奈の13字行先頭6件（d08／d73／d94／d99／d147／d148）の分割（文面不変・分割のみ）
// 実測（qa/measure_misaki13_b836_b876_yuna13_first6.js）：
// - 美咲 13字行=2件（b836／b876）。14字行は0件。13字を超える件は全て地の文のため分割対象外（前ランと同様）。
//   b836 は藤井、元の jump=b331 を後半へ引き継ぎ。「しか」の後（6字）で分割。
//   b876 は悠太、元の jump=b593 を後半へ引き継ぎ。「帰ってきた」の後（9字）で分割。
// - 優奈 13字行=90件。14字行は0件。
//   d08 は悠太、元の jump=d754 を後半へ引き継ぎ。「判子が」の後（7字）で分割。
//   d73 は園田、元の jump=d563 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d94 は優奈、元の jump=d653 を後半へ引き継ぎ。face=sad・char=true を後半へ継承。「、」の後（7字）で分割。
//   d99 は白鳥、元の jump=d584 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d147 は優奈、元の jump=d811 を後半へ引き継ぎ。face=cry・char=true を後半へ継承。「言えな」の後（6字）で分割。
//   d148 は悠太、元の jump=d569 を後半へ引き継ぎ。「直して」の後（8字）で分割。
// 方式は qa/edit_misaki13_b766_b768_b773_b775_b794_b800_b803_b831.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b1128〜b1129（美咲）、d1073〜d1078（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_misaki13_b836_b876_yuna13_first6.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b836', 'b1128', 6, '雨の日にしか', '来ない客かい。'],
  ['misaki', 'b876', 'b1129', 8, '今ごろ帰ってきた', 'んですか。'],
  ['yuna', 'd08', 'd1073', 7, '（開始に判子が', '要る図書館、'],
  ['yuna', 'd73', 'd1074', 6, '分かってる、', '規則は守るよ。'],
  ['yuna', 'd94', 'd1075', 7, '……お力には、', 'なれません。'],
  ['yuna', 'd99', 'd1076', 5, '梓さんの、', 'お孫さんですか。'],
  ['yuna', 'd147', 'd1077', 6, '祖母は言えな', 'かったんです、'],
  ['yuna', 'd148', 'd1078', 8, '優奈さんが直して', 'きたのは、'],
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
console.log('OK: split b836->b1128, b876->b1129, d08->d1073, d73->d1074, d94->d1075, d99->d1076, d147->d1077, d148->d1078');
