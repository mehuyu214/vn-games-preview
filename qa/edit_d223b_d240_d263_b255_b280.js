// W2 優奈の同率最長台詞（d223b／d240／d263・40字）＋美咲の最長台詞（b255／b280・38字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d223b_d240_d263_b255_b280.js）：
// - 優奈 d223b／d240／d263 は40字で優奈の最長行（d275／d275c も40字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d240 は優奈（face=serious・char=true、後続は d240b）、d263 は優奈（face=smile・char=true）。
// - 美咲 b255／b280 は38字で美咲の最長行（次点 b09／b17／b18／b22／b26／b37:37字）。
//   b255 は店長、b280 は美咲（face=sleepy・char=true）。
// 方式は qa/edit_d117_d169_d182_d193c_d215_c71_a298.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d409〜d411（優奈）・b322／b323（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d223b_d240_d263_b255_b280.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd223b', 'd409', 23, 'ここに座って待てば、いつか会えるから、ってね。', '半世紀、待ち続けた席なんだ、ここは'],
  ['yuna', 'd240', 'd410', 22, '悠太さん、話があります。今日中に、言います。', 'もう、直すだけじゃ終われませんから。'],
  ['yuna', 'd263', 'd411', 26, 'ふふ、それは規則違反ですよ。……特別に、許可します。', '館長の判子より、効く許可です'],
  ['misaki', 'b255', 'b322', 24, '……まあ、なんとかなる、かな。……なるといいね。', 'おれには、それしか言えなくて'],
  ['misaki', 'b280', 'b323', 25, '……悠太くんの腕の中、あったかい。眠くなってきた。', '……幸せって、こういうこと'],
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
console.log('OK: split d223b->d409, d240->d410, d263->d411, b255->b322, b280->b323');
