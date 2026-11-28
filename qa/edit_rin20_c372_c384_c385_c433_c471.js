// W2 凛の20字行5件（c372・c384・c385・c433・c471）の分割（文面不変・分割のみ）
// 実測（qa/measure_rin20_c372_c384_c385_c433_c471.js、台詞＝name ありのみ）：
// - 凛の台詞の最長は20字（5件：c372・c384・c385・c433・c471）。
//   桜の台詞最長は19字、美咲12字、優奈12字、セレナの最長は20字（47件）。
//   c372 は真壁、jump=c163。「……いいよ、その正直さ、」（12字）で分割。
//   c384 は凛、jump=c279。「でも私たち、全部は話」（10字）で分割。
//   c385 は小野寺、jump=c283。「先輩の分まで、絶対に、」（11字）で分割。
//   c433 は悠太、jump=c278。「過去形になってる、俺たちは、」（14字）で分割。
//   c471 は悠太、jump=c243。「痛くないですか、凛さん、」（12字）で分割。
// 方式は qa/edit_rin20_c319_c333_c335_c343_c350_c352_c368_c371.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c615〜c619（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin20_c372_c384_c385_c433_c471.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c372', 'c615', 12, '……いいよ、その正直さ、', '嫌いじゃないよ。'],
  ['rin', 'c384', 'c616', 10, 'でも私たち、全部は話', 'せなかったわ、結局。'],
  ['rin', 'c385', 'c617', 11, '先輩の分まで、絶対に、', '研究室を守ります！'],
  ['rin', 'c433', 'c618', 14, '過去形になってる、俺たちは、', '終わってる）'],
  ['rin', 'c471', 'c619', 12, '痛くないですか、凛さん、', '本当に、大丈夫。'],
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
console.log('OK: split c372->c615, c384->c616, c385->c617, c433->c618, c471->c619');
