// W2 優奈の18字最長行（d641／d714）＋美咲の19字最長行（b206／b218／b266）の分割（文面不変・分割のみ）
// 実測（qa/measure_d641_d714_b206_b218_b266.js）：
// - 優奈 d641／d714 は18字で優奈の同率最長行（次点は17字の d07／d25／d35／d42／d52／d53）。
//   d641 は園田、元の jump=d76 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   d714 は悠太、元の jump=d513 を後半へ引き継ぎ。「、」の後（13字）で分割。
// - 美咲 b206／b218／b266 は19字で美咲の同率最長行（次点も19字の b272／b284／b307／b325／b338）。
//   b206 は悠太、元の jump=b515 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   b218 は美咲、元の jump=b466 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   b266 は美咲、元の jump=b388 を後半へ引き継ぎ。「、」の後（6字）で分割。
// 方式は qa/edit_d630_b148_b158_b181_b183_b205.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d843／d844（優奈）・b771〜b773（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d641_d714_b206_b218_b266.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd641', 'd843', 9, '勧められるままに、', '詩集なんか読んでね'],
  ['yuna', 'd714', 'd844', 13, '優奈さんのペースでいこう、', 'ゆっくり。'],
  ['misaki', 'b206', 'b771', 5, '来ますよ。', '雨の日だけ、来る人ですから。'],
  ['misaki', 'b218', 'b772', 5, '相沢さん。', 'まず、これを読んでください。'],
  ['misaki', 'b266', 'b773', 6, 'これからは、', '隣を歩く人を、自分で選ぶ。'],
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
console.log('OK: split d641->d843, d714->d844, b206->b771, b218->b772, b266->b773');
