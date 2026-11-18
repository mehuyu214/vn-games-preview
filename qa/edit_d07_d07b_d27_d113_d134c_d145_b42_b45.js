// W2 優奈の次点最長台詞（d07／d07b／d27／d113／d134c／d145・39字）＋美咲の同率最長台詞（b42／b45・37字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d07_d07b_d27_d113_d134c_d145_b42_b45.js）：
// - 優奈 d07／d07b／d27／d113／d134c／d145 は39字で優奈の最長行（d167／d183 も39字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   d145 は優奈（face=sad・char=true）。d07 の後続は d07b（同ランで分割するため d07→d414→d07b→d415→d08 の連鎖になる）。
// - 美咲 b42／b45 は37字で美咲の同率最長行（b46／b49／b54／b60／b105／b112 も37字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   b42 の「……」は U+2026 が2個（文字インデックスで確認済み）。
// 方式は qa/edit_d275_d275c_b09_b17_b18_b22_b26_b37.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d414〜d419（優奈）・b330／b331（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d07_d07b_d27_d113_d134c_d145_b42_b45.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd07', 'd414', 17, '二人とも、始める前にお茶をどうぞ。', '熱いうちにね。仕事は、お茶のあとで十分です。'],
  ['yuna', 'd07b', 'd415', 20, '棚卸し開始の判子、押しておきましたから。', 'ほら、ここ。日付も、ばっちり入ってます'],
  ['yuna', 'd27', 'd416', 25, '規則の話じゃなくて、優奈さんの話を聞きたいんです。', '優奈さんが、なぜ慌てたのかを'],
  ['yuna', 'd113', 'd417', 17, '判子を、押してほしくて呼びました。', '『極秘』の判子を、二人分。押しました、ほら。'],
  ['yuna', 'd134c', 'd418', 23, '詩集だよ。若い娘さんが勧めてくれた、詩集一冊。', 'わしの人生を変えた、一冊の詩集さ'],
  ['yuna', 'd145', 'd419', 19, '手紙は、祖母が本の中に残したものです。', '最後の頁の裏に、そっと挟んでありました。'],
  ['misaki', 'b42', 'b330', 17, '彼女は……この店に、長いのですか。', '若い方なのに、夜勤で。五年と聞きましたが'],
  ['misaki', 'b45', 'b331', 17, 'あんた、雨の日にしか来ない客かい。', '変わってるねえ。晴れの日はどこにいるのさ'],
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
console.log('OK: split d07->d414, d07b->d415, d27->d416, d113->d417, d134c->d418, d145->d419, b42->b330, b45->b331');
