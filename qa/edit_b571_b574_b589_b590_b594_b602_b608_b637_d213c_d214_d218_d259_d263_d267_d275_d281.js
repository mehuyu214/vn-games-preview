// W2 美咲の最長行（b571／b574／b589／b590／b594／b602／b608／b637、15字）＋優奈の最長行（d213c／d214／d218／d259／d263／d267／d275／d281、14字）の分割（文面不変・分割のみ）
// 実測（qa/measure_b571_b574_b589_b590_b594_b602_b608_b637_d213c_d214_d218_d259_d263_d267_d275_d281.js）：
// - 美咲 b571／b574／b589／b590／b594／b602／b608／b637 は15字で美咲の最長行（15件同率の先頭8件）。
//   b571 は美咲、元の jump=b830 を後半へ引き継ぎ。「一番の」の後（8字）で分割。face=serious を後半へ継承。
//   b574 は美咲、元の jump=b404 を後半へ引き継ぎ。「、」の後（6字）で分割。face=sad を後半へ継承。
//   b589 は相沢、元の jump=b356 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   b590 は悠太、元の jump=b387 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b594 は店長、元の jump=b442 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b602 は店長、元の jump=b455 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   b608 は藤井、元の jump=b429 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   b637 は悠太、元の jump=b873 を後半へ引き継ぎ。「は」の後（8字）で分割（句読点なしのため語の区切り）。
// - 優奈 d213c／d214／d218／d259／d263／d267／d275／d281 は14字で優奈の最長行（54件同率の先頭8件）。
//   d213c は優奈、元の jump=d614 を後半へ引き継ぎ。「、」の後（7字）で分割。face=serious・char=true を後半へ継承。
//   d214 は園田、jump なし（後続は配列次ノード d215）で分割。「。」の後（7字）で分割。
//   d218 は園田、元の jump=d520 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   d259 は悠太、元の jump=d537 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   d263 は優奈、元の jump=d574 を後半へ引き継ぎ。「、」の後（3字）で分割。face=smile・char=true を後半へ継承。
//   d267 は悠太、jump なし（後続は配列次ノード d268）で分割。「。」の後（8字）で分割。
//   d275 は優奈、元の jump=d716 を後半へ引き継ぎ。「、」の後（5字）で分割。face=smile・char=true を後半へ継承。
//   d281 は悠太、元の jump=d523 を後半へ引き継ぎ。「。」の後（5字）で分割。
// 方式は qa/edit_b465_..._d194.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b954〜b961（美咲）・d1019〜d1026（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_b571_b574_b589_b590_b594_b602_b608_b637_d213c_d214_d218_d259_d263_d267_d275_d281.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b571', 'b954', 8, '食べるのが一番の', '供養だからね、'],
  ['misaki', 'b574', 'b955', 6, '気づいたら、', 'もう雨の中だった。'],
  ['misaki', 'b589', 'b956', 6, '……きっと、', 'また会いましょう。'],
  ['misaki', 'b590', 'b957', 7, 'ずっと前から、', '本当に好きです。'],
  ['misaki', 'b594', 'b958', 5, '……まあ、', 'なんとかなるっしょ。'],
  ['misaki', 'b602', 'b959', 4, 'おれも、', '先週聞いたばかりだよ。'],
  ['misaki', 'b608', 'b960', 4, '任せな、', '紳士の専属だよ今夜は。'],
  ['misaki', 'b637', 'b961', 8, '藤井さんの情報は', 'いつも半分噂で'],
  ['yuna', 'd213c', 'd1019', 7, 'お渡ししたい、', '本があります。'],
  ['yuna', 'd214', 'd1020', 7, '本を、わしに。', '……何の本だね'],
  ['yuna', 'd218', 'd1021', 10, '手紙……？　宛名は、', 'わしか。'],
  ['yuna', 'd259', 'd1022', 10, '優奈さん、綺麗だよ。', '本当に。'],
  ['yuna', 'd263', 'd1023', 3, 'ふふ、', 'それは規則違反ですよ。'],
  ['yuna', 'd267', 'd1024', 8, '栞、聞いてるか。', 'ママの声だよ'],
  ['yuna', 'd275', 'd1025', 5, '悠太さん、', '今日はありがとう。'],
  ['yuna', 'd281', 'd1026', 5, '……うん。', 'また明日、来ます。'],
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
console.log('OK: split b571->b954, b574->b955, b589->b956, b590->b957, b594->b958, b602->b959, b608->b960, b637->b961, d213c->d1019, d214->d1020, d218->d1021, d259->d1022, d263->d1023, d267->d1024, d275->d1025, d281->d1026');
