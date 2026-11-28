// W2 凛の20字行8件（c153・c170・c175・c269・c280・c307・c308・c311）の分割（文面不変・分割のみ）
// 実測（qa/measure_rin20_c153_c170_c175_c269_c280_c307_c308_c311.js、台詞＝name ありのみ）：
// - 凛の台詞の最長は20字（21件：c153・c170・c175・c269・c280・c307・c308・c311・
//   c319・c333・c335・c343・c350・c352・c368・c371・c372・c384・c385・c433・c471）。
//   桜の台詞最長は19字、美咲12字、優奈12字、セレナの最長は20字（47件）。
//   c153 は凛、jump=c455。「再実験の記録なら、」（9字）で分割。
//   c170 は凛、jump=c412。「送信、完了。……終わったわ、」（14字）で分割。
//   c175 は小野寺、jump=c312。「せ、先輩、すごい……」（10字）で分割。
//   c269 は悠太、jump=c479。「（俺たちの再実験は、」（10字）で分割。
//   c280 は小野寺、jump=c341。「せ、先輩！　本当に」（9字）で分割。
//   c307 は凛、jump=c78。「今日も遅くなるわよ、」（10字）で分割。
//   c308 は真壁、jump=c87。「完璧主義の凛さんが」（9字）で分割。
//   c311 は悠太、jump=c117。「手を貸しに来ました、」（10字）で分割。
// 方式は qa/edit_sakura20_a48_a270_a275_a293_rin20_c68_c106_c129_c133.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c599〜c606（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin20_c153_c170_c175_c269_c280_c307_c308_c311.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c153', 'c599', 9, '再実験の記録なら、', '時刻つきで全部あるわ。'],
  ['rin', 'c170', 'c600', 14, '送信、完了。……終わったわ、', '第一関門は、'],
  ['rin', 'c175', 'c601', 10, 'せ、先輩、すごい……', '本当に、すごいです、'],
  ['rin', 'c269', 'c602', 10, '（俺たちの再実験は、', '一生続いていくんだ、'],
  ['rin', 'c280', 'c603', 9, 'せ、先輩！　本当に', '行っちゃうんですかぁ、'],
  ['rin', 'c307', 'c604', 10, '今日も遅くなるわよ、', '二人とも、覚悟して。'],
  ['rin', 'c308', 'c605', 9, '完璧主義の凛さんが', 'いるんだから、安心だ。'],
  ['rin', 'c311', 'c606', 10, '手を貸しに来ました、', '本当のことを言うと。'],
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
console.log('OK: split c153->c599, c170->c600, c175->c601, c269->c602, c280->c603, c307->c604, c308->c605, c311->c606');
