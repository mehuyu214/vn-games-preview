// W2 凛の23字行 c395・c411・c419・c425・c439・c454 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin23_c395_c411_c419_c425_c439_c454.js、台詞＝name ありのみ）：
// - 凛の台詞の最長は23字（6件：c395・c411・c419・c425・c439・c454）。
//   桜の台詞最長は22字（a168・a247）、美咲12字、優奈12字、セレナの最長は22字（14件）。
//   c395 は悠太、jump=c51。「再実験、二人で終わらせま」（12字）で分割。
//   c411 は凛、jump=c159。「ありがとうございます、」（11字）で分割。
//   c419 は真壁、jump=c188。「一晩で、ここまで直したのか、」（14字）で分割。
//   c425 は凛、jump=c233。「データの話じゃないの、」（11字）で分割。
//   c439 は悠太、jump=c39。「発表までに、間に合うんですか」（14字）で分割。
//   c454 は悠太、jump=c153。「関係、大アリなんですよ、」（12字）で分割。
// 方式は qa/edit_rin23_c40_c73_c301_c329_c336_c363_c374_c393.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c549〜c554（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin23_c395_c411_c419_c425_c439_c454.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c395', 'c549', 12, '再実験、二人で終わらせま', 'しょう、凛さん、必ず。'],
  ['rin', 'c411', 'c550', 11, 'ありがとうございます、', 'その言葉、胸に刻みます。'],
  ['rin', 'c419', 'c551', 14, '一晩で、ここまで直したのか、', '君たちは、本気で。'],
  ['rin', 'c425', 'c552', 11, 'データの話じゃないの、', '本当に違うの、今日はね。'],
  ['rin', 'c439', 'c553', 14, '発表までに、間に合うんですか', '、その量で本当に。'],
  ['rin', 'c454', 'c554', 12, '関係、大アリなんですよ、', '俺には、立派な関係が。'],
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
console.log('OK: split c395->c549, c411->c550, c419->c551, c425->c552, c439->c553, c454->c554');
