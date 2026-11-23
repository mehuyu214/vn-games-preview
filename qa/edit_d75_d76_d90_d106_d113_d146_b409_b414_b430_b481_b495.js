// W2 優奈の17字最長行（d75／d76／d90／d106／d113／d146）＋美咲の19字最長行（b409／b414／b430／b481／b495）の分割（文面不変・分割のみ）
// 実測（qa/measure_d75_d76_d90_d106_d113_d146_b409_b414_b430_b481_b495.js）：
// - 優奈 d75／d76／d90／d106／d113／d146 は17字で優奈の同率最長行（次点も17字の d152／d155c）。
//   d75 は園田、元の jump=d564 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d76 は白鳥、元の jump=d356 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d90 は榊、元の jump=d566 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d106 は優奈、face=sad・char=true を後半へ継承、元の jump=d453 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   d113 は白鳥、元の jump=d417 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   d146 は悠太、元の jump=d485 を後半へ引き継ぎ。「、」の後（5字）で分割。
// - 美咲 b409／b414／b430／b481／b495 は19字で美咲の同率最長行（次点も19字の b497／b510／b518）。
//   b409 は悠太、元の jump=b112 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   b414 は美咲、face=surprise を後半へ継承、元の jump=b136 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   b430 は相沢、元の jump=b213 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   b481 は美咲、face=serious を後半へ継承、元の jump=b80 を後半へ引き継ぎ。「。」の後（11字）で分割。
//   b495 は悠太、元の jump=b232 を後半へ引き継ぎ。「。」の後（13字）で分割。
// 方式は qa/edit_d58_d61_b341_b367_b401.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d853〜d858（優奈）・b782〜b786（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d75_d76_d90_d106_d113_d146_b409_b414_b430_b481_b495.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd75', 'd853', 6, '昔はここで、', 'よく本を読んだもんだ。'],
  ['yuna', 'd76', 'd854', 5, '園田さん、', 'お茶をお持ちしましたよ。'],
  ['yuna', 'd90', 'd855', 8, '存在しない本を、', '探しているんです。'],
  ['yuna', 'd106', 'd856', 9, '手紙を書いたのは、', 'きっと祖母です。'],
  ['yuna', 'd113', 'd857', 4, '判子を、', '押してほしくて呼びました。'],
  ['yuna', 'd146', 'd858', 5, '何十年も、', '本の中で眠っていたのか。'],
  ['misaki', 'b409', 'b782', 10, '日付と天気で追えば、', '傘は一本だけのはず'],
  ['misaki', 'b414', 'b783', 8, '本当に、ですか。', '冗談じゃ、ないですよね'],
  ['misaki', 'b430', 'b784', 8, '……ありがとう。', '来てくれて、ありがとう'],
  ['misaki', 'b481', 'b785', 11, '　長いよ、夜勤だけど。', '途中で寝ないでね'],
  ['misaki', 'b495', 'b786', 13, '海外で、長くなるんですか。', '心配で、つい'],
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
console.log('OK: split d75->d853, d76->d854, d90->d855, d106->d856, d113->d857, d146->d858, b409->b782, b414->b783, b430->b784, b481->b785, b495->b786');
