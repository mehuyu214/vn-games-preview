// W2 美咲の最長行（b465／b466／b468／b476／b486／b493／b542／b560、15字）＋優奈の最長行（d149／d149b／d167b／d167c／d171／d173／d182b／d194、14字）の分割（文面不変・分割のみ）
// 実測（qa/measure_b465_b466_b468_b476_b486_b493_b542_b560_d149_d149b_d167b_d167c_d171_d173_d182b_d194.js）：
// - 美咲 b465／b466／b468／b476／b486／b493／b542／b560 は15字で美咲の最長行（31件同率の残り8件）。
//   b465 は美咲、元の jump=b206 を後半へ引き継ぎ。「。」の後（6字）で分割。face=serious・char=true を後半へ継承。
//   b466 は美咲、元の jump=b219 を後半へ引き継ぎ。「。」の後（7字）で分割。face=serious・char=true を後半へ継承。
//   b468 は相沢、元の jump=b723 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b476 は美咲、元の jump=b726 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   b486 は美咲、元の jump=b111 を後半へ引き継ぎ。「。」の後（7字）で分割。face=serious・char=true を後半へ継承。
//   b493 は悠太、元の jump=b200 を後半へ引き継ぎ。「。」の後（7字）で分割。
//   b542 は店長、元の jump=b63 を後半へ引き継ぎ。「聞きな」の後（9字）で分割。
//   b560 は悠太、元の jump=b348 を後半へ引き継ぎ。「みたいな」の後（11字、先頭の全角スペース含む）で分割（句読点なしのため語の区切り）。
// - 優奈 d149／d149b／d167b／d167c／d171／d173／d182b／d194 は14字で優奈の最長行（67件同率の残り8件）。
//   d149 は優奈、元の jump=d704 を後半へ引き継ぎ。「、」の後（7字）で分割。face=sad・char=true を後半へ継承。
//   d149b は優奈、元の jump=d570 を後半へ引き継ぎ。「を」の後（8字）で分割。face=sad・char=true を後半へ継承。
//   d167b は悠太、jump なし（後続は配列次ノード d167c）で分割。「、」の後（8字）で分割。
//   d167c は優奈、元の jump=d559 を後半へ引き継ぎ。「、」の後（3字）で分割。face=smile・char=true を後半へ継承。
//   d171 は悠太、元の jump=d666 を後半へ引き継ぎ。「さんの」の後（9字）で分割。
//   d173 は悠太、元の jump=d607 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d182b は白鳥、元の jump=d635 を後半へ引き継ぎ。「。」の後（3字）で分割。
//   d194 は優奈、元の jump=d375 を後半へ引き継ぎ。「、」の後（4字）で分割。face=serious・char=true を後半へ継承。
// 方式は qa/edit_b317_..._d135b.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b946〜b953（美咲）・d1011〜d1018（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_b465_b466_b468_b476_b486_b493_b542_b560_d149_d149b_d167b_d167c_d171_d173_d182b_d194.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b465', 'b946', 6, '最後の雨に。', '約束はしてないのに'],
  ['misaki', 'b466', 'b947', 7, '私の手紙です。', '昨夜、書きました'],
  ['misaki', 'b468', 'b948', 7, '新しい傘です、', '今日買いました。'],
  ['misaki', 'b476', 'b949', 9, '今は……ごめんね、', '先に行って。'],
  ['misaki', 'b486', 'b950', 7, '量がすごいよ。', '台帳、三冊もある'],
  ['misaki', 'b493', 'b951', 7, 'きっと大丈夫。', '俺も隣にいますし'],
  ['misaki', 'b542', 'b952', 9, '本人の口から聞きな', '、それが筋さ'],
  ['misaki', 'b560', 'b953', 11, '　防水のケースみたいな', 'ものが。'],
  ['yuna', 'd149', 'd1011', 7, '……わたしも、', '同じなんです。'],
  ['yuna', 'd149b', 'd1012', 8, '言えない気持ちを', '、直すことで'],
  ['yuna', 'd167b', 'd1013', 8, '（半世紀ぶりの、', '完成か……）'],
  ['yuna', 'd167c', 'd1014', 3, '本は、', '直せば応えてくれます。'],
  ['yuna', 'd171', 'd1015', 9, '修理は、優奈さんの', '『待った』'],
  ['yuna', 'd173', 'd1016', 7, 'じゃあ最後に、', '俺からも一つ。'],
  ['yuna', 'd182b', 'd1017', 3, 'ええ。', 'お茶と本の話になると、'],
  ['yuna', 'd194', 'd1018', 4, 'ですが、', 'お渡しはできません。'],
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
console.log('OK: split b465->b946, b466->b947, b468->b948, b476->b949, b486->b950, b493->b951, b542->b952, b560->b953, d149->d1011, d149b->d1012, d167b->d1013, d167c->d1014, d171->d1015, d173->d1016, d182b->d1017, d194->d1018');
