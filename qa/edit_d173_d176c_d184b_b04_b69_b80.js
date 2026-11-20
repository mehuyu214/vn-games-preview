// W2 優奈の同率最長台詞（d173／d176c／d184b・24字）＋美咲の次点最長台詞（b04／b69／b80・29字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d173_d176c_d184b_b04_b69_b80.js）：
// - 優奈 d173／d176c／d184b は24字で優奈の同率最長行（d186／d195／d199／d206／d213c も24字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d173 は悠太、後続は d174。1つ目の「。」の後（14字）で分割。
//   d176c は優奈（face=serious・char=true を後半へ継承）、元の jump=d436 を後半へ引き継ぎ。2つ目の「。」の後（17字）で分割（1つ目だと前半5字と短いため）。
//   d184b は榊、後続は d185。1つ目の「。」の後（11字）で分割。
// - 美咲 b04／b69／b80 は29字で美咲の次点最長行（b245 も29字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   b04 は美咲（face=serious を後半へ継承）、後続は b05。2つ目の「。」の後（23字）で分割（1つ目だと前半6字と短いため）。
//   b69 は悠太、元の jump=b72 を後半へ引き継ぎ。2つ目の「。」の後（19字）で分割。
//   b80 は悠太、後続は b81。2つ目の「。」の後（21字）で分割。
// 方式は qa/edit_d86_d87_d115_d129_d143b_b133_b158_b188_b193_b242.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d607〜d609（優奈）・b535〜b537（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d173_d176c_d184b_b04_b69_b80.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd173', 'd607', 14, 'じゃあ最後に、俺からも一つ。', '栞を挟ませてください'],
  ['yuna', 'd176c', 'd608', 17, '悠太さん。明日、隣にいてください。', 'お願いします。'],
  ['yuna', 'd184b', 'd609', 11, '『今日も言えなかった。', 'でも、会えたからいい』って'],
  ['misaki', 'b04', 'b535', 23, '唐揚げ弁当。……いただく前に、まず供養するね。', '手を合わせて'],
  ['misaki', 'b69', 'b536', 19, '分かりました。話せる時で、いいですよ。', '俺、ここにいますから'],
  ['misaki', 'b80', 'b537', 21, '夜勤は長いですから。どうぞ、全部聞きます。', 'コーヒーも入れて'],
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
console.log('OK: split d173->d607, d176c->d608, d184b->d609, b04->b535, b69->b536, b80->b537');
