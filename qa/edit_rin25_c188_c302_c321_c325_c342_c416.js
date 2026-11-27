// W2 凛の25字行 c188／c302／c321／c325／c342／c416 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin25_c188_c302_c321_c325_c342_c416.js、台詞＝name ありのみ）：
// - 凛の台詞の最長は25字（6件：c188・c302・c321・c325・c342・c416）。
//   桜の台詞最長は24字（4件：a37・a79・a138・a255）、美咲12字、優奈12字、セレナ24字（e10・e111）。
//   c188 は凛、元の jump は c299。「誤差ゼロです。数値が、」（11字）で分割。
//   c302 は小野寺、元の jump は c216。「先輩、本当に大丈夫ですか、」（13字）で分割。
//   c321 は凛、元の jump は c26。「……言えるはず、ないでしょう、」（15字）で分割。
//   c325 は悠太、元の jump は c55。「……明日、ちゃんと考えますから、」（16字）で分割。
//   c342 は凛、元の jump は c282。「これは誤差じゃないわ、」（11字）で分割。
//   c416 は小野寺、元の jump は c184。「　貼り間違えたのは、私なんです、」（16字・先頭全角空白あり）で分割。
// 方式は qa/edit_rin26_c304_c318_c365_c366_c418.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c527〜c532（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin25_c188_c302_c321_c325_c342_c416.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c188', 'c527', 11, '誤差ゼロです。数値が、', '私たちの正直さを証明します、'],
  ['rin', 'c302', 'c528', 13, '先輩、本当に大丈夫ですか、', '倒れたりしませんか……。'],
  ['rin', 'c321', 'c529', 15, '……言えるはず、ないでしょう、', 'こんな情けないこと。'],
  ['rin', 'c325', 'c530', 16, '……明日、ちゃんと考えますから、', '凛さん、待ってて。'],
  ['rin', 'c342', 'c531', 11, 'これは誤差じゃないわ、', '決定なのよ、もう決まったの。'],
  ['rin', 'c416', 'c532', 16, '　貼り間違えたのは、私なんです、', '締切の夜に、私が！'],
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
console.log('OK: split c188->c527, c302->c528, c321->c529, c325->c530, c342->c531, c416->c532');
