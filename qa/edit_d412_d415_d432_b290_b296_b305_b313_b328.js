// W2 優奈の同率最長台詞（d412／d415／d432・19字）＋美咲の同率最長台詞（b290／b296／b305／b313／b328・21字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d412_d415_d432_b290_b296_b305_b313_b328.js）：
// - 優奈 d412／d415／d432 は19字で優奈の同率最長行（次点も19字の d442／d443／d448／d490／d519）。
//   d412 は優奈（face=smile・char=true を後半へ継承）、元の jump=d275b を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d415 は白鳥、元の jump=d08 を後半へ引き継ぎ。「。」の後（6字）で分割。
//   d432 は悠太、元の jump=d151 を後半へ引き継ぎ。「、」の後（8字）で分割。
// - 美咲 b290／b296／b305／b313／b328 は21字で美咲の同率最長行（次点も21字の b335／b468／b471）。
//   b290 は美咲（face=smile を後半へ継承）、元の jump=b566 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   b296 は相沢、元の jump=b17 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b305 は相沢、元の jump=b226 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   b313 は美咲（face=smile・char=true を後半へ継承）、元の jump=b74 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   b328 は相沢、元の jump=b27 を後半へ引き継ぎ。「。」の後（12字）で分割。
// 方式は qa/edit_d365_d373_d378_d384_d387_b240_b250_b252.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d791〜d793（優奈）・b717〜b721（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d412_d415_d432_b290_b296_b305_b313_b328.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd412', 'd791', 5, '一人では、', 'きっと届けられませんでした。'],
  ['yuna', 'd415', 'd792', 6, 'ほら、ここ。', '日付も、ばっちり入ってます'],
  ['yuna', 'd432', 'd793', 8, '直している間は、', '決断しなくて済むから）'],
  ['misaki', 'b290', 'b717', 6, '『雨の日は、', '傘を貸せる人間であれ』だって。'],
  ['misaki', 'b296', 'b718', 5, 'レジの方、', '少々お時間をいただきたいのですが'],
  ['misaki', 'b305', 'b719', 8, '運転席に、私が。', '……彼を、助けられなかった'],
  ['misaki', 'b313', 'b720', 10, '一つは悠太くんの分。', '今日はおにぎりも余った'],
  ['misaki', 'b328', 'b721', 12, '申し訳ない、急に訪ねて。', '無理もないことです'],
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
console.log('OK: split d412->d791, d415->d792, d432->d793, b290->b717, b296->b718, b305->b719, b313->b720, b328->b721');
