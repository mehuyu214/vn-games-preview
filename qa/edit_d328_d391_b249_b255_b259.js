// W2 優奈の同率最長台詞（d328／d391・21字）＋美咲の同率最長台詞（b249／b255／b259・24字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d328_d391_b249_b255_b259.js）：
// - 優奈 d328／d391 は21字で優奈の同率最長行（次点は21字の d393／d396／d405／d552）。
//   d328 は優奈（face=smile・char=true を後半へ継承）、元の jump=d04 を後半へ引き継ぎ。「、」の後（14字）で分割。
//   d391 は悠太、元の jump=d232 を後半へ引き継ぎ。「、」の後（6字）で分割。
// - 美咲 b249／b255／b259 は24字で美咲の同率最長行（次点は24字の b269／b289／b303／b308／b329）。
//   b249 は悠太、元の jump=b321 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   b255 は店長、元の jump=b322 を後半へ引き継ぎ。「。」の後（15字）で分割。
//   b259 は悠太、元の jump=b438 を後半へ引き継ぎ。「。」の後（14字）で分割。
// 方式は qa/edit_d244_d246_d253c_d257_d269_d275_b182_b184_b185_b187_b200.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d717・d718（優奈）・b643〜b645（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d328_d391_b249_b255_b259.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd328', 'd717', 14, '一年に二度の大仕事ですから、', '気合いを入れて'],
  ['yuna', 'd391', 'd718', 6, '書架の影で、', '俺は少しだけ泣きそうになった）'],
  ['misaki', 'b249', 'b643', 8, '（言えなかった。', 'お礼も、父のことも、手紙もない。'],
  ['misaki', 'b255', 'b644', 15, '……まあ、なんとかなる、かな。', '……なるといいね。'],
  ['misaki', 'b259', 'b645', 14, '……はい。供養、しましょう。', '今日は唐揚げですね。'],
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
console.log('OK: split d328->d717, d391->d718, b249->b643, b255->b644, b259->b645');
