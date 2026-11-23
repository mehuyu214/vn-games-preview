// W2 優奈の17字最長行（d162／d176c／d188／d193c／d198／d213）＋美咲の19字最長行（b524／b545／b547／b554／b596）の分割（文面不変・分割のみ）
// 実測（qa/measure_d162_d176c_d188_d193c_d198_d213_b524_b545_b547_b554_b596.js）：
// - 優奈 d162／d176c／d188／d193c／d198／d213 は17字で優奈の同率最長行（次点も17字の d352／d368）。
//   d162 は悠太、元の jump=d163 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   d176c は優奈、face=serious・char=true を後半へ継承、元の jump=d608 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   d188 は悠太、元の jump=d529 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   d193c は優奈、face=serious・char=true を後半へ継承、元の jump=d407 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d198 は優奈、face=serious・char=true を後半へ継承、元の jump=d508 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d213 は優奈、face=serious・char=true を後半へ継承、元の jump=d377 を後半へ引き継ぎ。「、」の後（5字）で分割。
// - 美咲 b524／b545／b547／b554／b596 は19字で美咲の同率最長行（次点も19字の b605）。
//   b524 は悠太、元の jump=b128 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   b545 は美咲、face=sad を後半へ継承、元の jump=b366 を後半へ引き継ぎ。「、」の後（14字）で分割。
//   b547 は悠太、元の jump=b410 を後半へ引き継ぎ。「、」の後（11字）で分割。
//   b554 は美咲、元の jump=b399 を後半へ引き継ぎ。「、」の後（11字）で分割。
//   b596 は藤井、元の jump=b363 を後半へ引き継ぎ。「、」の後（6字）で分割。
// 方式は qa/edit_d152_d155c_b497_b510_b518.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d861〜d866（優奈）・b790〜b794（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d162_d176c_d188_d193c_d198_d213_b524_b545_b547_b554_b596.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd162', 'd861', 10, '三人で届けましょう。', '半世紀の手紙を'],
  ['yuna', 'd176c', 'd862', 5, '悠太さん。', '明日、隣にいてください。'],
  ['yuna', 'd188', 'd863', 4, '（明日、', '半世紀の物語に決着がつく。'],
  ['yuna', 'd193c', 'd864', 6, '祖母の本は、', '確かにここにあります。'],
  ['yuna', 'd198', 'd865', 5, '榊さんは、', '本をどうしたいんですか。'],
  ['yuna', 'd213', 'd866', 5, '園田さん、', 'お時間をいただけますか。'],
  ['misaki', 'b524', 'b790', 9, '今夜も雨ですけど、', '今からでも聞けますよ'],
  ['misaki', 'b545', 'b791', 14, '温かい缶コーヒーとカイロと、', '飴が三つ。'],
  ['misaki', 'b547', 'b792', 11, '店長、起きてますかね、', 'もう深夜ですよ。'],
  ['misaki', 'b554', 'b793', 11, '傘、持って……せめて、', 'お名前だけでも。'],
  ['misaki', 'b596', 'b794', 6, 'お兄ちゃん、', 'ホットコーヒーちょうだい。'],
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
console.log('OK: split d162->d861, d176c->d862, d188->d863, d193c->d864, d198->d865, d213->d866, b524->b790, b545->b791, b547->b792, b554->b793, b596->b794');
