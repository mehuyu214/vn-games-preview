// W2 凛の23字行 c40・c73・c301・c329・c336・c363・c374・c393 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin23_c40_c73_c301_c329_c336_c363_c374_c393.js、台詞＝name ありのみ）：
// - 凛の台詞の最長は23字（14件：c40・c73・c301・c329・c336・c363・c374・c393・c395・c411・c419・c425・c439・c454）。
//   桜の台詞最長は22字（a168・a247）、美咲12字、優奈12字、セレナの最長は22字（14件）。
//   c40 は悠太、jump=c394。「高峰先生の、現役最後の研」（12字）で分割。
//   c73 は小野寺、jump=c294。「先輩、最近ずっと夜遅くて。」（13字）で分割。
//   c301 は凛、jump=c210。「今日こそ、二人で乗るわよ」（12字）で分割。
//   c329 は小野寺、jump=c80。「余分に買ってきました、」（11字）で分割。
//   c336 は凛、jump=c183。「今は、その時じゃ——」（10字）で分割。
//   c363 は小野寺、jump=c110。「夜食のおにぎり、置いていきますね、」（17字）で分割。
//   c374 は真壁、jump=c178。「訂正の理由は、何だったのかな、」（15字）で分割。
//   c393 は凛、jump=c35。「原因は小野寺の貼り間違いよ」（13字）で分割。
// 方式は qa/edit_sakura23_a154_serena23_e04_e11_e13_e60_e67_e158_e176_e251.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c541〜c548（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin23_c40_c73_c301_c329_c336_c363_c374_c393.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c40', 'c541', 12, '高峰先生の、現役最後の研', '究も終わってしまう……'],
  ['rin', 'c73', 'c542', 13, '先輩、最近ずっと夜遅くて。', '私のせいな気がして、'],
  ['rin', 'c301', 'c543', 12, '今日こそ、二人で乗るわよ', '、悠太、帰りましょう。'],
  ['rin', 'c329', 'c544', 11, '余分に買ってきました、', 'どうぞ、食べてください！'],
  ['rin', 'c336', 'c545', 10, '今は、その時じゃ——', 'お願い、やめて、頼むから。'],
  ['rin', 'c363', 'c546', 17, '夜食のおにぎり、置いていきますね、', '熱いお茶も！'],
  ['rin', 'c374', 'c547', 15, '訂正の理由は、何だったのかな、', '凛さん、正直に。'],
  ['rin', 'c393', 'c548', 13, '原因は小野寺の貼り間違いよ', '、先週の締切前のね。'],
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
console.log('OK: split c40->c541, c73->c542, c301->c543, c329->c544, c336->c545, c363->c546, c374->c547, c393->c548');
