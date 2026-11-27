// W2 凛の29字行 c201／c202／c206／c210／c225／c227／c245／c247 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin29_c201_c202_c206_c210_c225_c227_c245_c247.js）：
// - 凛の最長は29字（12件）、桜の最長は27字（4件：a71・a188・a223・a243）、美咲12字、優奈12字、セレナ25字（e14）。
//   c201 は高峰、元の後続は c202。「うん。いい研究室だよ、本当にね、」（16字）で分割。
//   c202 は凛、元の jump は c207。「……ありがとう、悠太。隣にいてくれて、」（19字）で分割。
//   c206 は悠太、元の後続は c207。「（正しくやったはずなのに、」（13字）で分割。
//   c210 は悠太、元の後続は c211。「はい。……あの、凛さん。明日、」（15字）で分割。
//   c225 は悠太、元の後続は c226。「（守れた。俺たちの再実験は、」（14字）で分割。
//   c227 は悠太、元の後続は c228。「はい。俺もです。……凛さん、」（14字）で分割。
//   c245 は凛、元の後続は c246。「あっ……そこ、だめ……んんっ、」（15字）で分割。
//   c247 は凛、元の後続は c248。「ば、ばか……近所に聞こえ……」（14字）で分割。
// 方式は qa/edit_rin29_c94_c112_c129_c149_c164_c166_c180_c193.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c497〜c504（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin29_c201_c202_c206_c210_c225_c227_c245_c247.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c201', 'c497', 16, 'うん。いい研究室だよ、本当にね、', '私は誇らしいよ、君たちが。'],
  ['rin', 'c202', 'c498', 19, '……ありがとう、悠太。隣にいてくれて、', '心強かった、本当に。'],
  ['rin', 'c206', 'c499', 13, '（正しくやったはずなのに、', 'なぜこんなに胸が痛いんだ、俺は）'],
  ['rin', 'c210', 'c500', 15, 'はい。……あの、凛さん。明日、', '全部終わったら、話があって。'],
  ['rin', 'c225', 'c501', 14, '（守れた。俺たちの再実験は、', '無駄じゃなかったんだ、本当に）'],
  ['rin', 'c227', 'c502', 14, 'はい。俺もです。……凛さん、', '俺も話があります、今夜、必ず。'],
  ['rin', 'c245', 'c503', 15, 'あっ……そこ、だめ……んんっ、', '悠太ぁ、待って、そこは……。'],
  ['rin', 'c247', 'c504', 14, 'ば、ばか……近所に聞こえ……', 'ああっ、だめ、悠太、もう……！'],
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
console.log('OK: split c201->c497, c202->c498, c206->c499, c210->c500, c225->c501, c227->c502, c245->c503, c247->c504');
