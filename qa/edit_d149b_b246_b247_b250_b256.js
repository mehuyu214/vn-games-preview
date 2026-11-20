// W2 優奈の同率最長台詞（d149b・26字）＋美咲の同率最長台詞（b246／b247／b250／b256・33字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d149b_b246_b247_b250_b256.js）：
// - 優奈 d149b は26字で優奈の同率最長行（d183／d221c／d223／d263／d349／d356 も26字で同率だが本ランは前ラン次回候補の1行のみ対象）。
//   d149b は優奈（face=sad・char=true を後半へ継承）、後続は d150。読点「、」の後（14字）で分割。
// - 美咲 b246／b247／b250／b256 は33字で美咲の同率最長行（b258／b268／b271／b273 も33字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b246 は相沢、後続は b247。1つ目の「。」の後（12字）で分割。
//   b247 は美咲（face=sad を後半へ継承）、後続は b248。1つ目の「。」の後（22字）で分割。
//   b250 は藤井、後続は b251。2つ目の「。」の後（21字）で分割。
//   b256 は悠太、後続は b257。1つ目の「。」の後（23字）で分割。
// 方式は qa/edit_d73_d75_d77_d90_d95_d96_d148_b219_b231_b235_b236.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d570（優奈）・b498〜b501（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d149b_b246_b247_b250_b256.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd149b', 'd570', 14, '言えない気持ちを、直すことで', '誤魔化してしまうところが'],
  ['misaki', 'b246', 'b498', 12, '……無理を、なさらずに。', '今日は、顔を見られただけで。十分です、私は'],
  ['misaki', 'b247', 'b499', 22, '傘は……まだ、預かってても、いいですか……。', '今日は、まだ、その……'],
  ['misaki', 'b250', 'b500', 21, '紳士、時間だよ。……ごめんね、お嬢ちゃん。', 'またね。雨の日に、きっと'],
  ['misaki', 'b256', 'b501', 23, '（店長の口癖が、初めて慰めに聞こえた夜だった。', '不思議と、救われた）'],
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
  const succ = origJump ? g.scenes.find(n => n.id === origJump) : g.scenes[idx + 1];
  if (!succ) throw new Error(`no successor: ${id}`);
  node.text = first;
  node.jump = newId;
  const secondNode = { id: newId, name: node.name, text: second };
  if (node.face) secondNode.face = node.face;
  if (node.char) secondNode.char = node.char;
  secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split d149b->d570, b246->b498, b247->b499, b250->b500, b256->b501');
