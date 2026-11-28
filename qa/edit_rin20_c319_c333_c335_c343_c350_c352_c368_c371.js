// W2 凛の20字行8件（c319・c333・c335・c343・c350・c352・c368・c371）の分割（文面不変・分割のみ）
// 実測（qa/measure_rin20_c319_c333_c335_c343_c350_c352_c368_c371.js、台詞＝name ありのみ）：
// - 凛の台詞の最長は20字（13件：c319・c333・c335・c343・c350・c352・c368・c371・
//   c372・c384・c385・c433・c471）。
//   桜の台詞最長は19字、美咲12字、優奈12字、セレナの最長は20字（47件）。
//   c319 は凛、jump=c07。「誤差ゼロで終わらせて、」（11字）で分割。
//   c333 は小野寺、jump=c140。「提出……ですか、」（8字）で分割。
//   c335 は真壁、jump=c166。「本番で会おう、助手くん、」（12字）で分割。
//   c343 は悠太、jump=c06。「凛さんの指示が正確なんで、」（13字）で分割。
//   c350 は凛、jump=c38。「それから毎晩、一人で」（10字）で分割。
//   c352 は凛、jump=c42。「守る方法が、それしか」（10字）で分割。
//   c368 は凛、jump=c145。「それが研究者の矜持でしょう、」（14字）で分割。
//   c371 は悠太、jump=c162。「うちは訂正版を提出します、」（13字）で分割。
// 方式は qa/edit_rin20_c153_c170_c175_c269_c280_c307_c308_c311.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c607〜c614（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin20_c319_c333_c335_c343_c350_c352_c368_c371.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c319', 'c607', 11, '誤差ゼロで終わらせて、', '頼んだわよ、悠太。'],
  ['rin', 'c333', 'c608', 8, '提出……ですか、', '本当に、そんな急に……。'],
  ['rin', 'c335', 'c609', 12, '本番で会おう、助手くん、', '楽しみにしてる。'],
  ['rin', 'c343', 'c610', 13, '凛さんの指示が正確なんで、', '助かってます。'],
  ['rin', 'c350', 'c611', 10, 'それから毎晩、一人で', '再実験を続けてるの。'],
  ['rin', 'c352', 'c612', 10, '守る方法が、それしか', '思いつかなかったの。'],
  ['rin', 'c368', 'c613', 14, 'それが研究者の矜持でしょう、', '違うかしら。'],
  ['rin', 'c371', 'c614', 13, 'うちは訂正版を提出します、', '正直に、全部。'],
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
  console.log(`${id} -> ${newId} -> ${origEnd ? '(end)' : succ.id} (${[...first].length}+${[...second].length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split c319->c607, c333->c608, c335->c609, c343->c610, c350->c611, c352->c612, c368->c613, c371->c614');
