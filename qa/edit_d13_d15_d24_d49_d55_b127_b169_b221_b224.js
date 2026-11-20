// W2 優奈の次点最長台詞（d13／d15／d24／d49／d55・24字）＋美咲の同率最長台詞（b127／b169／b221／b224・31字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d13_d15_d24_d49_d55_b127_b169_b221_b224.js）：
// - 優奈 d13／d15／d24／d49／d55 は24字で優奈の同率最長行（d59／d72／d74 も24字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   d13 は悠太、元の jump=d364 を後半へ引き継ぎ。「……」の後（10字）で分割。
//   d15 は悠太、元の jump=d394 を後半へ引き継ぎ。読点の後（11字）で分割。
//   d24 は優奈（face=sad・char=true を後半へ継承）、元の jump=d499 を後半へ引き継ぎ。1つ目の「。」の後（16字）で分割。
//   d49 は悠太、元の jump=d465 を後半へ引き継ぎ。1つ目の「。」の後（19字）で分割。
//   d55 は悠太、元の jump=d398 を後半へ引き継ぎ。読点の後（14字）で分割。
// - 美咲 b127／b169／b221／b224 は31字で美咲の同率最長行（b274／b288 も31字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b127 は悠太、後続は b128。1つ目の「。」の後（12字）で分割（文末に句点なし）。
//   b169 は美咲（face=serious を後半へ継承）、後続は b170。2つ目の「。」の後（23字）で分割（1つ目だと前半7字と短いため。文末に句点なし）。
//   b221 は相沢、後続は b222。句点の後（23字）で分割（文末に句点なし）。
//   b224 は美咲（face=cry を後半へ継承）、後続は b225。2つ目の「。」の後（25字）で分割（1つ目だと前半5字と短いため。文末に句点なし）。
// 方式は qa/edit_d377_b21_b57_b84_b90.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d594〜d598（優奈）・b524〜b527（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d13_d15_d24_d49_d55_b127_b169_b221_b224.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd13', 'd594', 10, '優奈さん、この本……', '目録に載ってないみたいです。'],
  ['yuna', 'd15', 'd595', 11, '台帳にも蔵書目録にも、', 'この本の記録が無いんです。'],
  ['yuna', 'd24', 'd596', 16, '見なかったことに、してください。', 'お願いですから。'],
  ['yuna', 'd49', 'd597', 19, '本を見る目は、優奈さん仕込みですから。', '誇りです。'],
  ['yuna', 'd55', 'd598', 14, '届ければいいじゃないですか、', '今からでも遅くない。'],
  ['misaki', 'b127', 'b524', 12, 'なんで雨の日なんですか。', '今夜も雨ですけど、今からでも聞けますよ'],
  ['misaki', 'b169', 'b525', 23, '……月末まで。あと、雨はあと何回来るんですか。', '店長、天気予報は'],
  ['misaki', 'b221', 'b526', 23, '『あの日、傘と温かい飲み物をありがとう』……。', '……こんな、私に'],
  ['misaki', 'b224', 'b527', 25, '相沢さん。わたし、お父さんのことで、責めてません。', '一度も、誰も'],
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
console.log('OK: split d13->d594, d15->d595, d24->d596, d49->d597, d55->d598, b127->b524, b169->b525, b221->b526, b224->b527');
