// W2 凛の22字行残り5件（c426・c441・c453・c457・c468）の分割（文面不変・分割のみ）
// 実測（qa/measure_rin22_c426_c441_c453_c457_c468.js、台詞＝name ありのみ）：
// - 凛の台詞の最長は22字（5件：c426・c441・c453・c457・c468）。
//   桜の台詞最長は21字（a111・a185・a227・a307・a309）、美咲12字、優奈12字、
//   セレナの最長は21字（e09・e12・e17・e22・e23・e24・e25・e26・e27・e35・e37・e44・
//   e51・e53・e57・e59・e66・e85・e87・e92・e102・e103・e106・e109・e136・e147・e172・
//   e174・e178・e192・e199・e208・e218・e219・e238・e267・e283）。
//   c426 は凛、jump=c237。「誤差ゼロで言われたわ」（10字）で分割。
//   c441 は凛、jump=c48。「私の12分、正確だった」（11字）で分割。
//   c453 は凛、jump=c148。「……あなた、怖い子ね」（10字）で分割。
//   c457 は高峰、jump=c158。「データは逃げないからね」（11字）で分割。
//   c468 は悠太、jump=c234。「何でも言ってください」（10字）で分割。
// 方式は qa/edit_rin22_c354_c355_c357_c360_c362_c370_c373_c377.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c571〜c575（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin22_c426_c441_c453_c457_c468.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c426', 'c571', 10, '誤差ゼロで言われたわ', '、悠太に、完璧な精度で。'],
  ['rin', 'c441', 'c572', 11, '私の12分、正確だった', 'でしょう、悠太、ふふ。'],
  ['rin', 'c453', 'c573', 10, '……あなた、怖い子ね', '、悠太、本当に、時々ね。'],
  ['rin', 'c457', 'c574', 11, 'データは逃げないからね', '、いつだって、昔から。'],
  ['rin', 'c468', 'c575', 10, '何でも言ってください', '、凛さん、全部聞きます。'],
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
console.log('OK: split c426->c571, c441->c572, c453->c573, c457->c574, c468->c575');
