// W2 凛の21字行19件の先頭8件（c110・c132・c136・c314・c317・c328・c332・c334）の分割（文面不変・分割のみ）
// 実測（qa/measure_rin21_c110_c132_c136_c314_c317_c328_c332_c334.js、台詞＝name ありのみ）：
// - 凛の台詞の最長は21字（19件：c110・c132・c136・c314・c317・c328・c332・c334・c339・
//   c344・c351・c387・c392・c434・c438・c449・c464・c465・c478）。
//   桜の台詞最長は21字（a111・a185・a227・a307・a309）、美咲12字、優奈12字、
//   セレナの最長は21字（e09・e12・e17・e22・e23・e24・e25・e26・e27・e35・e37・e44・
//   e51・e53・e57・e59・e66・e85・e87・e92・e102・e103・e106・e109・e136・e147・e172・
//   e174・e178・e192・e199・e208・e218・e219・e238・e267・e283）。
//   c110 は凛、jump=c399。「小野寺。あなた、帰っ」（10字）で分割。
//   c132 は凛、jump=c406。「助かるわ。……ふふ、」（10字）で分割。
//   c136 は悠太、jump=c451。「知ってます。俺も、もう」（11字）で分割。
//   c314 は悠太、jump=c199。「隣に立たせてください」（10字）で分割。
//   c317 は凛、jump=c277。「……本当に、助かったわ」（11字）で分割。
//   c328 は悠太、jump=c79。「そのカウントダウンは」（10字）で分割。
//   c332 は凛、jump=c101。「明日の朝、元気に来なさい」（12字）で分割。
//   c334 は凛、jump=c143。「提出は訂正版でいく、」（10字）で分割。
// 方式は qa/edit_rin22_c426_c441_c453_c457_c468.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c576〜c583（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin21_c110_c132_c136_c314_c317_c328_c332_c334.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c110', 'c576', 10, '小野寺。あなた、帰っ', 'たはずではなかったの、'],
  ['rin', 'c132', 'c577', 10, '助かるわ。……ふふ、', '覚えたわね、助手くん。'],
  ['rin', 'c136', 'c578', 11, '知ってます。俺も、もう', '帰る気はないですよ、'],
  ['rin', 'c314', 'c579', 10, '隣に立たせてください', '、凛さん、お願いです。'],
  ['rin', 'c317', 'c580', 11, '……本当に、助かったわ', '、ありがとう、悠太。'],
  ['rin', 'c328', 'c581', 10, 'そのカウントダウンは', '、凛さん、早すぎます。'],
  ['rin', 'c332', 'c582', 12, '明日の朝、元気に来なさい', '、いいね、約束よ。'],
  ['rin', 'c334', 'c583', 10, '提出は訂正版でいく、', 'それだけよ、決めたの。'],
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
console.log('OK: split c110->c576, c132->c577, c136->c578, c314->c579, c317->c580, c328->c581, c332->c582, c334->c583');
