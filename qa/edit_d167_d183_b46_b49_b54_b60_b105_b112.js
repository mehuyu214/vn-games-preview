// W2 優奈の同率最長台詞（d167／d183・39字）＋美咲の同率最長台詞（b46／b49／b54／b60／b105／b112・37字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d167_d183_b46_b49_b54_b60_b105_b112.js）：
// - 優奈 d167／d183 は39字で優奈の最長行（d186／d196／d199／d216／d225b も39字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   d167 は優奈（face=smile・char=true）、後続は d167b。d183 は優奈（face=sad・char=true）。
// - 美咲 b46／b49／b54／b60／b105／b112 は37字で美咲の同率最長行（b113／b114 も37字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   b46 の「……」は U+2026 が2個（文字インデックスで確認済み）。b49 の「？」直後の全角スペースは b160 と同じく後半へ。
// 方式は qa/edit_d07_d07b_d27_d113_d134c_d145_b42_b45.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d420／d421（優奈）・b332〜b337（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d167_d183_b46_b49_b54_b60_b105_b112.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd167', 'd420', 27, '最後の糸を、通します。……これで、この本はもう大丈夫。', '半世紀ぶりに、完成です。'],
  ['yuna', 'd183', 'd421', 26, 'なぜ、言えなかったんでしょう。あんなに近かったのに。', '毎日会えて、話も弾んだのに'],
  ['misaki', 'b46', 'b332', 14, '……ええ。雨の日だけ、です。', 'それ以外では、来られなくて。……事情が、あって'],
  ['misaki', 'b49', 'b333', 24, '美咲さん、それをどこから……バックヤードの奥に？', '　ずっと保管してたんですか'],
  ['misaki', 'b54', 'b334', 22, 'じゃあ、あの人は……今、どこにいるんですか。', '元気なんですか、教えてください'],
  ['misaki', 'b60', 'b335', 16, 'おや。……来たんだねえ、ついに。', '長かったねえ、五年か。おれも年を取るはずだ'],
  ['misaki', 'b105', 'b336', 19, 'あとね、メモの住所。車に置いてったよ。', '忘れ物だね。ホテルのメモ用紙に、住所'],
  ['misaki', 'b112', 'b337', 19, '……あった。『木製柄の傘、紙袋同封』。', 'これだ、間違いない。五年前の、あの日'],
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
console.log('OK: split d167->d420, d183->d421, b46->b332, b49->b333, b54->b334, b60->b335, b105->b336, b112->b337');
