// W2 美咲の次点最長行（b21／b24／b30／b31／b38／b46／b49／b79、14字・79件同率の先頭8件）＋優奈の最長行（d426／d436／d439／d445／d466／d468／d469／d472、14字・38件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_d426_d436_d439_d445_d466_d468_d469_d472_misaki14.js）：
// - 美咲 b21／b24／b30／b31／b38／b46／b49／b79 は14字で美咲の次点最長行（79件同率の先頭8件）。
//   b21 は相沢、元の jump=b520 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b24 は悠太、元の jump=b308 を後半へ引き継ぎ。「、」の後（7字）で分割。末尾に全角スペースあり（後半へ引き継ぎ）。
//   b30 は藤井、元の jump=b757 を後半へ引き継ぎ。「いない」の後（8字）で分割。
//   b31 は相沢、元の jump=b362 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b38 は悠太、元の jump=b444 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   b46 は相沢、元の jump=b332 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   b49 は悠太、元の jump=b627 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b79 は美咲、元の jump=b481 を後半へ引き継ぎ。「。」の後（8字）で分割。face=serious を後半へ継承。
// - 優奈 d426／d436／d439／d445／d466／d468／d469／d472 は14字で優奈の最長行（38件同率の先頭8件）。
//   d426 は園田、元の jump=d226 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d436 は優奈、元の jump=d177 を後半へ引き継ぎ。「、」の後（5字）で分割。face=serious・char=true を後半へ継承。
//   d439 は白鳥、元の jump=d229 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   d445 は悠太、元の jump=d66 を後半へ引き継ぎ。「、」の後（3字）で分割。
//   d466 は優奈、元の jump=d65 を後半へ引き継ぎ。「、」の後（4字）で分割。face=sad・char=true を後半へ継承。
//   d468 は優奈、元の jump=d90 を後半へ引き継ぎ。「、」の後（4字）で分割。face=smile・char=true を後半へ継承。
//   d469 は優奈、元の jump=d95 を後半へ引き継ぎ。「、」の後（5字）で分割。face=sad・char=true を後半へ継承。
//   d472 は優奈、元の jump=d119 を後半へ引き継ぎ。「、」の後（5字）で分割。face=angry・char=true を後半へ継承。
// 方式は qa/edit_b646_..._d416.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b969〜b976（美咲）・d1035〜d1042（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_b21_b24_b30_b31_b38_b46_b49_b79_d426_d436_d439_d445_d466_d468_d469_d472.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b21', 'b969', 5, '五年前の、', '土砂降りの夜です。'],
  ['misaki', 'b24', 'b970', 7, 'え、ちょっと、', '美咲さん！？　'],
  ['misaki', 'b30', 'b971', 8, '客が一人もいない', 'と思ったら、'],
  ['misaki', 'b31', 'b972', 5, '……私は、', '待っていますので。'],
  ['misaki', 'b38', 'b973', 10, 'それ……ビニール傘、', 'ですか。'],
  ['misaki', 'b46', 'b974', 5, '……ええ。', '雨の日だけ、です。'],
  ['misaki', 'b49', 'b975', 5, '美咲さん、', 'それをどこから……'],
  ['misaki', 'b79', 'b976', 8, '……五年前の話。', 'してもいい？'],
  ['yuna', 'd426', 'd1035', 5, 'あんたは、', '梓さんの自慢の孫だ'],
  ['yuna', 'd436', 'd1036', 5, '一人では、', 'きっと足が震えます'],
  ['yuna', 'd439', 'd1037', 9, 'とびきりの一杯を、', '淹れました'],
  ['yuna', 'd445', 'd1038', 3, '俺は、', 'その決断に付き合います'],
  ['yuna', 'd466', 'd1039', 4, '決断を、', 'わたしに委ねるなんて'],
  ['yuna', 'd468', 'd1040', 4, '司書は、', '探し物の味方ですから'],
  ['yuna', 'd469', 'd1041', 5, '当館には、', 'そのような本は……'],
  ['yuna', 'd472', 'd1042', 5, '館長なら、', '止める立場でしょう'],
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
console.log('OK: split b21->b969, b24->b970, b30->b971, b31->b972, b38->b973, b46->b974, b49->b975, b79->b976, d426->d1035, d436->d1036, d439->d1037, d445->d1038, d466->d1039, d468->d1040, d469->d1041, d472->d1042');
