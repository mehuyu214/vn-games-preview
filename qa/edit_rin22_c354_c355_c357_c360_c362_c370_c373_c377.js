// W2 凛の22字行次8件（c354・c355・c357・c360・c362・c370・c373・c377）の分割（文面不変・分割のみ）
// 実測（qa/measure_rin22_c354_c355_c357_c360_c362_c370_c373_c377.js、台詞＝name ありのみ）：
// - 凛の台詞の最長は22字（13件：c354・c355・c357・c360・c362・c370・c373・c377・
//   c426・c441・c453・c457・c468）。
//   桜の台詞最長は21字（a111・a185・a227・a307・a309）、美咲12字、優奈12字、
//   セレナの最長は21字（e09・e12・e17・e22・e23・e24・e25・e26・e27・e35・e37・e44・
//   e51・e53・e57・e59・e66・e85・e87・e92・e102・e103・e106・e109・e136・e147・e172・
//   e174・e178・e192・e199・e208・e218・e219・e238・e267・e283）。
//   c354 は凛、jump=c52。「巻き込まれるわよ、」（9字）で分割。
//   c355 は凛、jump=c65。「発表資料は順調に進んで」（11字）で分割。
//   c357 は真壁、jump=c83。「発表資料は順調そうだ」（10字）で分割。
//   c360 は真壁、jump=c88。「……じゃあ、本番で会おう」（12字）で分割。
//   c362 は凛、jump=c106。「誤差は許さないわよ、悠太」（12字）で分割。
//   c370 は凛、jump=c152。「巻き込むわけにはいかない」（12字）で分割。
//   c373 は凛、jump=c169。「今日の最終は、これよ」（10字）で分割。
//   c377 は凛、jump=c192。「最初から知っていたんですか」（13字）で分割。
// 方式は qa/edit_rin22_c10_c11_c123_c292_c305_c348_c349_c353.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c563〜c570（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin22_c354_c355_c357_c360_c362_c370_c373_c377.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c354', 'c563', 9, '巻き込まれるわよ、', '本当にいいの、後悔しない。'],
  ['rin', 'c355', 'c564', 11, '発表資料は順調に進んで', 'いますから、ご安心を。'],
  ['rin', 'c357', 'c565', 10, '発表資料は順調そうだ', 'ね、凛さん、見たところ。'],
  ['rin', 'c360', 'c566', 12, '……じゃあ、本番で会おう', '、凛さん、助手くん。'],
  ['rin', 'c362', 'c567', 12, '誤差は許さないわよ、悠太', '、頼むわね、本気で。'],
  ['rin', 'c370', 'c568', 12, '巻き込むわけにはいかない', 'の、悠太、悪いけど。'],
  ['rin', 'c373', 'c569', 10, '今日の最終は、これよ', '、悠太、分かるでしょう。'],
  ['rin', 'c377', 'c570', 13, '最初から知っていたんですか', '、全部を、ずっと。'],
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
console.log('OK: split c354->c563, c355->c564, c357->c565, c360->c566, c362->c567, c370->c568, c373->c569, c377->c570');
