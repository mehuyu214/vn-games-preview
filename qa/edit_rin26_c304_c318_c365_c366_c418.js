// W2 凛の26字行 c304／c318／c365／c366／c418 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin26_c304_c318_c365_c366_c418.js、台詞＝name ありのみ）：
// - 凛の台詞の最長は26字（5件：c304・c318・c365・c366・c418）。
//   桜の台詞最長は24字（4件：a37・a79・a138・a255）、美咲12字、優奈12字、セレナ24字（e10・e111）。
//   c304 は悠太、元の jump は c21。「本当に、いいんですかこれで、」（14字）で分割。
//   c318 は悠太、元の jump は c280。「言えないことが、多すぎました、」（15字）で分割。
//   c365 は悠太、元の jump は c119。「記録係は俺に任せてください、」（14字）で分割。
//   c366 は凛、元の jump は c123。「ここの値、元通り再現したわ。」（14字）で分割。
//   c418 は真壁、元の jump は c186。「これは、予想外の展開だね、」（13字）で分割。
// 方式は qa/edit_rin27_c30_c133_c252_sakura25_a20_a93_a250_a313_serena25_e14.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c522〜c526（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin26_c304_c318_c365_c366_c418.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c304', 'c522', 14, '本当に、いいんですかこれで、', '凛さん、後悔しませんか。'],
  ['rin', 'c318', 'c523', 15, '言えないことが、多すぎました、', '俺たちには、最後まで。'],
  ['rin', 'c365', 'c524', 14, '記録係は俺に任せてください、', '全部、最初から最後まで。'],
  ['rin', 'c366', 'c525', 14, 'ここの値、元通り再現したわ。', 'やっと、ここまで来たの。'],
  ['rin', 'c418', 'c526', 13, 'これは、予想外の展開だね、', '実に、興味深いじゃないか。'],
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
console.log('OK: split c304->c522, c318->c523, c365->c524, c366->c525, c418->c526');
