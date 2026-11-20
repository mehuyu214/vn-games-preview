// W2 優奈の同率最長台詞（d337／d372／d408・24字）＋美咲の次点最長台詞（b123・28字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d337_d372_d408_b123.js）：
// - 優奈 d337／d372／d408 は24字で優奈の同率最長行（次点は23字多数）。
//   d337 は優奈（face=sad・char=true を後半へ継承）、元の jump=d137 を後半へ引き継ぎ。1つ目の「。」の後（16字）で分割。
//   d372 は優奈（face=cry・char=true を後半へ継承）、元の jump=d148 を後半へ引き継ぎ。1つ目の「。」の後（7字）で分割。
//   d408 は優奈（face=sad・char=true を後半へ継承）、元の jump=d216 を後半へ引き継ぎ。1つ目の「。」の後（8字）で分割。
// - 美咲 b123 は悠太、28字で美咲の次点最長行（b125／b174／b181／b201／b222／b243／b279 も28字で同率だが本ランは前ラン次回候補の1行のみ対象）。
//   1つ目の「。」の後（17字）で分割。後続は b124（逐次）。
// 方式は qa/edit_d228_d278_d327_b02_b03_b07_b62_b68_b70_b85.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d618〜d620（優奈）・b546（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d337_d372_d408_b123.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd337', 'd618', 16, '……祖母が、自分で規則を破った。', '初めて知りました'],
  ['yuna', 'd372', 'd619', 7, '渡せなかった。', '勇気が、半分だけ足りなかったんです'],
  ['yuna', 'd408', 'd620', 8, '覚えていますか。', '園田さんが借りた、最後の詩集です'],
  ['misaki', 'b123', 'b546', 17, '（引き継いだのは、傘だけじゃない。', '……この店そのものだ）'],
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
console.log('OK: split d337->d618, d372->d619, d408->d620, b123->b546');
