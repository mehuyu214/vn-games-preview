// W2 セレナの21字行の次8件（e66・e85・e87・e92・e102・e103・e106・e109）の分割（文面不変・分割のみ）
// 実測（qa/measure_serena21_e66_e85_e87_e92_e102_e103_e106_e109.js、台詞＝name ありのみ）：
// - セレナの台詞の最長は21字（21件：e66・e85・e87・e92・e102・e103・e106・e109・e136・
//   e147・e172・e174・e178・e192・e199・e208・e218・e219・e238・e267・e283）。
//   ※前ラン記載の「27件→残り19件」は数え間違い。20:56ランの列挙は29件あり、本ラン着手前
//   再計測で21件残存を確認（8件分割済み）。実測を正とする。
//   桜の台詞最長は20字、美咲12字、優奈12字、凛の最長は20字。
//   e66 は悠太、jump なし（次ノードへ）。「最終確認って、いった」（10字）で分割。
//   e85 はベルタ、jump なし（次ノードへ）。「私の判定に誤差はありません。」（14字）で分割。
//   e87 はセレナ、jump なし（次ノードへ）。「恩師の書斎ですわ。」（9字）で分割。
//   e92 はセレナ、jump なし（次ノードへ）。「先生の授業、毎日楽しいですわ。」（15字）で分割。
//   e102 はアラン、jump なし（次ノードへ）。「セレナは僕の婚約者になる人だ。」（15字）で分割。
//   e103 はセレナ、jump なし（次ノードへ）。「まだ候補、ですわ。」（9字）で分割。
//   e106 はアラン、jump なし（次ノードへ）。「使用人に判定された！　」（11字、全角空白付き）で分割。
//   e109 はセレナ、jump なし（次ノードへ）。「お願いがありますの。」（10字）で分割。
// 方式は qa/edit_serena21_e27_e35_e37_e44_e51_e53_e57_e59.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード e328〜e335（セレナ）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_serena21_e66_e85_e87_e92_e102_e103_e106_e109.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['serena', 'e66', 'e328', 10, '最終確認って、いった', 'い何を確認するんです？'],
  ['serena', 'e85', 'e329', 14, '私の判定に誤差はありません。', 'お茶をどうぞ。'],
  ['serena', 'e87', 'e330', 9, '恩師の書斎ですわ。', '開かずの間、と呼ばれて。'],
  ['serena', 'e92', 'e331', 15, '先生の授業、毎日楽しいですわ。', '本当ですよ。'],
  ['serena', 'e102', 'e332', 15, 'セレナは僕の婚約者になる人だ。', 'よろしくね。'],
  ['serena', 'e103', 'e333', 9, 'まだ候補、ですわ。', 'アラン。決めつけないで。'],
  ['serena', 'e106', 'e334', 11, '使用人に判定された！　', '面白い館だ、ここは。'],
  ['serena', 'e109', 'e335', 10, 'お願いがありますの。', '聞いてください、先生。'],
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
  const origEnd = !!node.end;
  const succ = origJump ? g.scenes.find(n => n.id === origJump) : g.scenes[idx + 1];
  if (!origEnd && !succ) throw new Error(`no successor: ${id}`);
  node.text = first;
  node.jump = newId;
  if (origEnd) delete node.end;
  const secondNode = { id: newId, name: node.name, text: second };
  if (node.face) secondNode.face = node.face;
  if (node.char) secondNode.char = node.char;
  if (node.r18) secondNode.r18 = node.r18;
  if (origEnd) secondNode.end = true;
  else secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${origEnd ? '(end)' : succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split e66->e328, e85->e329, e87->e330, e92->e331, e102->e332, e103->e333, e106->e334, e109->e335');
