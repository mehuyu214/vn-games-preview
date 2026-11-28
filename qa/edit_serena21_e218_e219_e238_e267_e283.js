// W2 セレナの21字行の残り5件（e218・e219・e238・e267・e283）の分割（文面不変・分割のみ）
// 実測（qa/measure_serena21_e218_e219_e238_e267_e283.js、台詞＝name ありのみ）：
// - セレナの台詞の最長は21字（5件：e218・e219・e238・e267・e283）。桜の台詞最長は20字、
//   美咲12字、優奈12字、凛の最長は20字。これでセレナの21字行は0件になる。
//   e218 は悠太、jump なし（次ノードへ）。「分かりました。」（7字）で分割。
//   e219 はセレナ、jump なし（次ノードへ）。「先生、起きてますの？　」（11字、全角空白付き）で分割。
//   e238 はアラン、jump なし（次ノードへ）。「妥当だ。おめでとう、婚約者くん。」（16字）で分割。
//   e267 はセレナ、jump なし（次ノードへ）。「先生、今度は本当の先生ですわね。」（16字）で分割。
//   e283 はベルタ、jump なし（次ノードへ）。「……判定、先生は悪くない。」（13字）で分割。
// 方式は qa/edit_serena21_e136_e147_e172_e174_e178_e192_e199_e208.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード e344〜e348（セレナ）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_serena21_e218_e219_e238_e267_e283.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['serena', 'e218', 'e344', 7, '分かりました。', '逃げません、グレゴリーさん。'],
  ['serena', 'e219', 'e345', 11, '先生、起きてますの？　', 'わたしも眠れなくて。'],
  ['serena', 'e238', 'e346', 16, '妥当だ。おめでとう、婚約者くん。', '本物だね。'],
  ['serena', 'e267', 'e347', 16, '先生、今度は本当の先生ですわね。', '子どもの。'],
  ['serena', 'e283', 'e348', 13, '……判定、先生は悪くない。', 'タイミングです。'],
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
console.log('OK: split e218->e344, e219->e345, e238->e346, e267->e347, e283->e348');
