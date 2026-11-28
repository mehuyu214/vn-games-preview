// W2 凛の21字行残り11件の先頭8件（c339・c344・c351・c387・c392・c434・c438・c449）の分割（文面不変・分割のみ）
// 実測（qa/measure_rin21_c339_c344_c351_c387_c392_c434_c438_c449.js、台詞＝name ありのみ）：
// - 凛の台詞の最長は21字（11件：c339・c344・c351・c387・c392・c434・c438・c449・c464・c465・c478）。
//   桜の台詞最長は21字（a111・a185・a227・a307・a309）、美咲12字、優奈12字、
//   セレナの最長は21字（e09・e12・e17・e22・e23・e24・e25・e26・e27・e35・e37・e44・
//   e51・e53・e57・e59・e66・e85・e87・e92・e102・e103・e106・e109・e136・e147・e172・
//   e174・e178・e192・e199・e208・e218・e219・e238・e267・e283）。
//   c339 は凛、jump=c275。「研究室は続く。それで」（10字）で分割。
//   c344 は凛、jump=c09。「n数と同じだけ、静か」（10字）で分割。
//   c351 は凛、jump=c40。「バレれば助成金は打ち切り」（12字）で分割。
//   c387 は凛、jump=c289。「……今日の3分は、」（9字）で分割。
//   c392 は凛、jump=c30。「サンプルみたいに頑固」（10字）で分割。
//   c434 は悠太、jump=c290。「誤差ゼロでいてください」（11字）で分割。
//   c438 は悠太、jump=c27。「アクセスログも、証拠」（10字）で分割。
//   c449 は悠太、jump=c128。「肩、貸しますから、」（9字）で分割。
// 方式は qa/edit_rin21_c110_c132_c136_c314_c317_c328_c332_c334.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c584〜c591（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin21_c339_c344_c351_c387_c392_c434_c438_c449.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c339', 'c584', 10, '研究室は続く。それで', 'いいのよ、皆のために。'],
  ['rin', 'c344', 'c585', 10, 'n数と同じだけ、静か', 'にしてくれると助かる。'],
  ['rin', 'c351', 'c586', 12, 'バレれば助成金は打ち切り', '、研究室は解散よ。'],
  ['rin', 'c387', 'c587', 9, '……今日の3分は、', '短いわね、悠太、本当に。'],
  ['rin', 'c392', 'c588', 10, 'サンプルみたいに頑固', 'なんだから、あなたは。'],
  ['rin', 'c434', 'c589', 11, '誤差ゼロでいてください', '、ずっと、約束です。'],
  ['rin', 'c438', 'c590', 10, 'アクセスログも、証拠', 'として残しておきます。'],
  ['rin', 'c449', 'c591', 9, '肩、貸しますから、', '凛さん、遠慮なくどうぞ。'],
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
console.log('OK: split c339->c584, c344->c585, c351->c586, c387->c587, c392->c588, c434->c589, c438->c590, c449->c591');
