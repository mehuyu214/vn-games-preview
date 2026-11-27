// W2 凛の30字行 c251／c255／c266／c268／c269／c285 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin30_c251_c255_c266_c268_c269_c285.js）：
// - 凛の最長は30字（6件）、桜の最長は28字、美咲12字、優奈12字、セレナ25字（e14）。
//   c251 は凛、元の後続は c252。「全部、あなたの好きにしていい。」（15字）で分割。
//   c255 は凛、元の後続は c256。「はぁ……はぁ……誤差、ゼロ……」（15字）で分割。
//   c266 は凛、元の後続は c267。「悠太、この子の名前を考えたの。」（15字）で分割。
//   c268 は凛、元の後続は c269。「ふふ。結論は幸せ。」（9字）で分割。
//   c269 は悠太、end=true（終端ノード）。「（俺たちの再実験は、一生続いていくんだ、」（20字）で分割。
//        ※ end は後半ノードへ移行（前半に end を残すと後半へ到達しないため）。
//        ※ 後半ノードには jump を付けない（end ノードは終端）。
//   c285 は悠太、元の後続は c286。「（言いたいことは山ほどあるのに、」（16字）で分割。
// 方式は qa/edit_rin30_c217_c233_c234_c235_c242_c246_c249_c250.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c475〜c480（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin30_c251_c255_c266_c268_c269_c285.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c251', 'c475', 15, '全部、あなたの好きにしていい。', '……全部、あげるから、悠太に。'],
  ['rin', 'c255', 'c476', 15, 'はぁ……はぁ……誤差、ゼロ……', '二人の距離が、ゼロ、なの……。'],
  ['rin', 'c266', 'c477', 15, '悠太、この子の名前を考えたの。', 'まっすぐ育つ、いい名前を、ね。'],
  ['rin', 'c268', 'c478', 9, 'ふふ。結論は幸せ。', 'それで異論は、認めないわよ、誰にも、絶対。'],
  ['rin', 'c269', 'c479', 20, '（俺たちの再実験は、一生続いていくんだ、', 'これからも、ずっと）'],
  ['rin', 'c285', 'c480', 16, '（言いたいことは山ほどあるのに、', '一つも出てこない、情けない）'],
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
console.log('OK: split c251->c475, c255->c476, c266->c477, c268->c478, c269->c479, c285->c480');
