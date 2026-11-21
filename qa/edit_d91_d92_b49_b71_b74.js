// W2 優奈の次点最長台詞（d91／d92・21字）＋美咲の次点最長台詞（b49／b71／b74・24字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d91_d92_b49_b71_b74.js）：
// - 優奈 d91／d92 は21字で優奈の同率最長行（次点は21字の d144／d149／d151／d157／d204／d227）。
//   d91 は悠太、元の jump=d449 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   d92 は優奈（face=serious・char=true を後半へ継承）、元の jump=d503 を後半へ引き継ぎ。「、」の後（7字）で分割。
// - 美咲 b49／b71／b74 は24字で美咲の同率最長行（次点は24字の b88／b107／b122／b142／b144）。
//   b49 は悠太、元の jump=b333 を後半へ引き継ぎ。「……」の後（14字）で分割。
//   b71 は美咲（face=smile を後半へ継承）、元の jump=b72 を後半へ引き継ぎ。「。」の後（17字）で分割。
//   b74 は悠太、元の jump=b365 を後半へ引き継ぎ。「。」の後（7字）で分割。
// 方式は qa/edit_d05_d21_d33_d41_d50_d56_b11_b14_b28_b29_b33.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d701・d702（優奈）・b627〜b629（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d91_d92_b49_b71_b74.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd91', 'd701', 8, '（存在しない本。', 'まさに、あの詩集のことだ。'],
  ['yuna', 'd92', 'd702', 7, '当館の蔵書は、', '全て目録に登録されています。'],
  ['misaki', 'b49', 'b627', 14, '美咲さん、それをどこから……', 'バックヤードの奥に？'],
  ['misaki', 'b71', 'b628', 17, '悠太くん。……コーヒー、入れるね。', '熱いの、二人分'],
  ['misaki', 'b74', 'b629', 7, '供養、ですか。', '……俺も共犯にする気ですね、先輩。'],
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
console.log('OK: split d91->d701, d92->d702, b49->b627, b71->b628, b74->b629');
