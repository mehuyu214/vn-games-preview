// W2 優奈の同率最長台詞（d59／d72／d74・24字）＋美咲の同率最長台詞（b274／b288・31字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d59_d72_d74_b274_b288.js）：
// - 優奈 d59／d72／d74 は24字で優奈の同率最長行（d86／d87／d115／d129／d143b も24字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d59 は悠太、元の jump=d383 を後半へ引き継ぎ。1つ目の「。」の後（8字）で分割。
//   d72 は優奈（face=serious・char=true を後半へ継承）、元の jump=d401 を後半へ引き継ぎ。2つ目の読点の後（15字）で分割。
//   d74 は悠太、元の jump=d447 を後半へ引き継ぎ。読点の後（11字）で分割。
// - 美咲 b274／b288 は31字で美咲の同率最長行（次点は30字多数）。
//   b274 は美咲（face=pleasure を後半へ継承）、後続は b275。2つ目の「……」の後（15字）で分割。
//   b288 は美咲（face=surprise を後半へ継承）、後続は b289。2つ目の「。」の後（23字）で分割（1つ目だと前半10字と短いため。文末に句点なし）。
// 方式は qa/edit_d13_d15_d24_d49_d55_b127_b169_b221_b224.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d599〜d601（優奈）・b528〜b529（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d59_d72_d74_b274_b288.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd59', 'd599', 8, '（直す、と守る。', '彼女の中では、きっと同じことだ。'],
  ['yuna', 'd72', 'd600', 15, '園田さん、その席は指定席では、', 'ありませんけれど。'],
  ['yuna', 'd74', 'd601', 11, '（この席に座り続けて、', 'もう何十年になるんだろう。'],
  ['misaki', 'b274', 'b528', 15, 'あっ……だめ、声、出ちゃう……', 'もっと、近くに来て……離れないで'],
  ['misaki', 'b288', 'b529', 23, 'これ……相沢さんから。エアメール、届いてるよ。', '海外の消印、見て'],
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
console.log('OK: split d59->d599, d72->d600, d74->d601, b274->b528, b288->b529');
