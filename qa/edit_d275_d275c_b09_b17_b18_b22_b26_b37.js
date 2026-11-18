// W2 優奈の同率最長台詞（d275／d275c・40字）＋美咲の次点最長台詞（b09／b17／b18／b22／b26／b37・37字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d275_d275c_b09_b17_b18_b22_b26_b37.js）：
// - 優奈 d275／d275c は40字で優奈の最長行（次点 d07／d07b／d27／d113／d134c／d145:39字）。
//   d275・d275c ともに優奈（face=smile・char=true、後続は d275b／d276）。
// - 美咲 b09／b17／b18／b22／b26／b37 は37字で美咲の最長行（b42／b45 も37字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   b17 は美咲（face=smile・char=true）、b37 は美咲（face=sad・char=true）。b09 の後半は全角スペース始まり（b160 と同じ扱い）。
// 方式は qa/edit_d223b_d240_d263_b255_b280.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d412／d413（優奈）・b324〜b329（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d275_d275c_b09_b17_b18_b22_b26_b37.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd275', 'd412', 21, '悠太さん、今日はありがとう。助かりました。', '一人では、きっと届けられませんでした。'],
  ['yuna', 'd275c', 'd413', 23, '隣にいてくれて、助かりました。それは本当です。', '隣にいる、というのは大きなことです'],
  ['misaki', 'b09', 'b324', 25, '店長、今ごろ帰ってきたんですか。傘、持ってました？', '　ずぶ濡れじゃないですか'],
  ['misaki', 'b17', 'b325', 18, 'いらっしゃいませ。どうぞ、こちらへ。', 'お買い物ですか。それとも、何かお探しで'],
  ['misaki', 'b18', 'b326', 23, 'あの……『あの雨の日の傘』は、まだありますか。', 'この店に、預けたままの傘です'],
  ['misaki', 'b22', 'b327', 15, '美咲さん？　顔、真っ白ですよ。', '大丈夫ですか、座りますか。水、持ってきますか'],
  ['misaki', 'b26', 'b328', 16, '……驚かせてしまったようですね。', '申し訳ない、急に訪ねて。無理もないことです'],
  ['misaki', 'b37', 'b329', 13, '……あった。まだ、あった。', '……よかった、本当によかった。捨てられてなかった'],
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
console.log('OK: split d275->d412, d275c->d413, b09->b324, b17->b325, b18->b326, b22->b327, b26->b328, b37->b329');
