// W2 優奈の同率最長台詞（d228／d278／d327・24字）＋美咲の次点最長台詞（b02／b03／b07／b62／b68／b70／b85・28字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d228_d278_d327_b02_b03_b07_b62_b68_b70_b85.js）：
// - 優奈 d228／d278／d327 は24字で優奈の同率最長行（d337／d372／d408 も24字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d228 は白鳥、元の jump=d439 を後半へ引き継ぎ。1つ目の「。」の後（12字）で分割。
//   d278 は優奈（face=sad・char=true を後半へ継承）、元の jump=d392 を後半へ引き継ぎ。1つ目の「。」の後（12字）で分割。
//   d327 は優奈（face=smile・char=true を後半へ継承）、元の jump=d11 を後半へ引き継ぎ。文中に「。」がないため「棚卸しのついでに、」の読点で分割（9字）。
// - 美咲 b02／b03／b07／b62／b68／b70／b85 は28字で美咲の次点最長行（b123 も28字で同率だが本ランは前ラン次回候補の7行のみ対象）。
//   b02 は美咲（face=smile・char=true を後半へ継承）、1つ目の「。」の後（5字）で分割。
//   b03 は悠太、元の jump=b295 を後半へ引き継ぎ。1つ目の「。」の後（8字）で分割。
//   b07 は悠太、元の jump=b306 を後半へ引き継ぎ。「理屈は立派なんですけど、」の読点で分割（12字）。
//   b62 は店長、1つ目の「。」の後（13字）で分割。
//   b68 は美咲（face=sad・char=true を後半へ継承）、1つ目の「。」の後（6字）で分割。
//   b70 は悠太、1つ目の「。」の後（7字）で分割。
//   b85 は美咲（face=sad を後半へ継承）、「そう。紙袋の中は、」の読点で分割（9字）。
// 方式は qa/edit_d186_d195_d199_d206_d213c_b245.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d615〜d617（優奈）・b539〜b545（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d228_d278_d327_b02_b03_b07_b62_b68_b70_b85.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd228', 'd615', 12, '園田さん、お茶をどうぞ。', '今日は特別な日ですから。'],
  ['yuna', 'd278', 'd616', 12, 'あれは、祖母の言葉です。', 'わたしの言葉じゃ、ない。'],
  ['yuna', 'd327', 'd617', 9, '棚卸しのついでに、', '背の状態も見ておいてくださいね'],
  ['misaki', 'b02', 'b539', 5, '悠太くん。', '廃棄のお弁当、出たよ。今日は唐揚げが余ってるの'],
  ['misaki', 'b03', 'b540', 8, 'お、いいですね。', 'いただきます。今日はなんのお弁当ですか。'],
  ['misaki', 'b07', 'b541', 12, '理屈は立派なんですけど、', '目が完全に笑ってますよ美咲さん。'],
  ['misaki', 'b62', 'b542', 13, 'まあ、なんとかなるっしょ。', '本人の口から聞きな、それが筋さ'],
  ['misaki', 'b68', 'b543', 6, '……ごめん。', '今は、まだ話せない。心の整理が、ついてなくて'],
  ['misaki', 'b70', 'b544', 7, '（聞くな、俺。', '今夜はそれでいい。先輩の沈黙を、守る夜だ）'],
  ['misaki', 'b85', 'b545', 9, 'そう。紙袋の中は、', '温かい缶コーヒーとカイロと、飴が三つ。'],
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
console.log('OK: split d228->d615, d278->d616, d327->d617, b02->b539, b03->b540, b07->b541, b62->b542, b68->b543, b70->b544, b85->b545');
