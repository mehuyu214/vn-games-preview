// W2 優奈の次点最長台詞の分割（文面不変・分割のみ）
// 実測（qa/measure_d11_d50_d56_d59_d128_d134.js）：
// - 優奈 d11／d50／d56／d59／d128／d134 は41字で優奈の最長行（d148／d153 も41字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   d11 は悠太、d50／d56 は優奈（face=serious・char=true）、d59 は悠太（地の文）、d128 は悠太、d134 は園田。
// 方式は qa/edit_d217_d223_b03_b16_b181_b276.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d380〜d385（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d11_d50_d56_d59_d128_d134.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd11', 'd380', 27, '了解です。背表紙の壊れた本たちですね、任せてください。', '修理なら、もう慣れたものです'],
  ['yuna', 'd50', 'd381', 21, 'この本は、誰にも渡せません。誰にも、です。', 'わたしが、守らなければいけない本なんです'],
  ['yuna', 'd56', 'd382', 21, '規則では、未登録の資料は廃棄処分なんです。', '見つかれば、あの本は捨てられてしまいます'],
  ['yuna', 'd59', 'd383', 24, '（直す、と守る。彼女の中では、きっと同じことだ。', '言葉にしない分、行動が正直な人だ）'],
  ['yuna', 'd128', 'd384', 22, '同じ詩集を、何度も何度も借りてますね、これ。', '『未返却』のまま、記録が終わってますね'],
  ['yuna', 'd134', 'd385', 23, 'おお、司書さん。昔話かい、いいよ、座りなさい。', '爺の昔話は長いよ、それでもいいかい。'],
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
console.log('OK: split d11->d380, d50->d381, d56->d382, d59->d383, d128->d384, d134->d385');
