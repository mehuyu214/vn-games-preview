// W2 優奈の15字最長行（d452／d454／d455／d456／d458／d461／d463／d473）＋美咲の16字最長行（b146／b149／b162／b174／b193／b196／b212／b219）の分割（文面不変・分割のみ）
// 実測（qa/measure_d452_d454_b146_b149.js＋追加ダンプ）：
// - 優奈 d452／d454／d455／d456／d458／d461／d463／d473 は15字で優奈の同率最長行（8件同率）。
//   d452 は悠太、元の jump=d104 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d454 は優奈、元の jump=d128 を後半へ引き継ぎ。「、」の後（6字）で分割。face=smile・char=true を後半へ継承。
//   d455 は悠太、元の jump=d137 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d456 は悠太、元の jump=d172 を後半へ引き継ぎ。「、」の後（3字）で分割。
//   d458 は園田、元の jump=d186 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   d461 は優奈、元の jump=d06 を後半へ引き継ぎ。「、」の後（4字）で分割。face=smile・char=true を後半へ継承。
//   d463 は優奈、元の jump=d34 を後半へ引き継ぎ。「、」の後（9字）で分割。face=sad・char=true を後半へ継承。
//   d473 は悠太、元の jump=d145 を後半へ引き継ぎ。「、」の後（4字）で分割。
// - 美咲 b146／b149／b162／b174／b193／b196／b212／b219 は16字で美咲の同率最長行（8件同率）。
//   b146 は美咲、元の jump=b635 を後半へ引き継ぎ。「、」の後（7字）で分割。face=sad を後半へ継承。
//   b149 は店長、元の jump=b582 を後半へ引き継ぎ。引用句の後（14字）で分割。
//   b162 は藤井、元の jump=b374 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   b174 は悠太、元の jump=b548 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   b193 は悠太、元の jump=b533 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   b196 は美咲、元の jump=b607 を後半へ引き継ぎ。「、」の後（6字）で分割。face=smile を後半へ継承。
//   b212 は相沢、元の jump=b430 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   b219 は相沢、元の jump=b494 を後半へ引き継ぎ。「。」の後（9字）で分割。
// 方式は qa/edit_d366_d386_d390_d422_d424_d435_b98_b101_b111_b134_b135_b137.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d963〜d970（優奈）・b890〜b897（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d452_d454_d455_d456_d458_d461_d463_d473_b146_b149_b162_b174_b193_b196_b212_b219.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd452', 'd963', 5, 'あの反応、', 'ただごとじゃなかった'],
  ['yuna', 'd454', 'd964', 6, '見るたびに、', '背筋が伸びるんです'],
  ['yuna', 'd455', 'd965', 8, '半世紀の物語が、', '繋がっていく）'],
  ['yuna', 'd456', 'd966', 3, 'でも、', '待ったは今日で終わりです'],
  ['yuna', 'd458', 'd967', 10, '若い人の決意の顔は、', 'よく分かる'],
  ['yuna', 'd461', 'd968', 4, '残りは、', '根気との勝負になります'],
  ['yuna', 'd463', 'd969', 9, '言える日が来たら、', '必ず話します'],
  ['yuna', 'd473', 'd970', 4, '館長の、', 'たった一度の規則破りで'],
  ['misaki', 'b146', 'b890', 7, '……どうして、', '黙ってたんですか。'],
  ['misaki', 'b149', 'b891', 14, '『まあ、なんとかなるっしょ』', 'は、'],
  ['misaki', 'b162', 'b892', 9, 'それより紳士の話。', '聞いて驚きな。'],
  ['misaki', 'b174', 'b893', 4, '柄の先、', 'キャップになってますね。'],
  ['misaki', 'b193', 'b894', 4, '五年間、', '毎雨考えてた言葉ですよ。'],
  ['misaki', 'b196', 'b895', 6, '供養の次は、', '傘磨きが得意なんだ。'],
  ['misaki', 'b212', 'b896', 5, '……ええ。', '受け取りに、来ました。'],
  ['misaki', 'b219', 'b897', 9, '……手紙、ですか。', '私に、ですか。'],
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
  if (node.r18) secondNode.r18 = node.r18;
  secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split d452->d963, d454->d964, d455->d965, d456->d966, d458->d967, d461->d968, d463->d969, d473->d970, b146->b890, b149->b891, b162->b892, b174->b893, b193->b894, b196->b895, b212->b896, b219->b897');
