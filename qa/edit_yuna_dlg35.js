// W2 優奈・台詞平均の目標達成（35.6→35以下）
// 実測（qa/measure_rewrite.js）：優奈は台詞242ノード・合計8,622字・平均35.63字で
// 全面書き直しの目標「台詞平均 ≤35字」を唯一満たしていない（他作品は 18.5／34.3／
// 31.2／19.4）。書き直し時の d-frag 編集パス（長い台詞31行の合いの手分割）と
// 同じ方式で、最長の台詞6行を句点の区切りで2ノードに分割する（文面は不変・
// 分割のみ）。6分割で 8,622字／248ノード＝平均34.77字となり目標達成。
// 新規ノード d327〜d332 は優奈 scenes 配列末尾へ追加し、前半ノードに jump、
// 後半ノードに元の後続ノードへの jump を付ける（a264〜a269 と同じ実績ある方式）。
// ノードID不変（既存IDの変更なし）。全員成人・合意ありは維持。
// 使い方: node qa/edit_yuna_dlg35.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));
const y = GAMES.find(g => g.id === 'yuna');

// [対象ID, 前半テキスト, 後半テキスト]
const SPLITS = [
  ['d10', '悠太さんは修理の続きをお願いします。直す本は、わたしが選んでおきました。', '棚卸しのついでに、背の状態も見ておいてくださいね'],
  ['d03', 'おはようございます、悠太さん。今日は棚卸し、よろしくお願いしますね。', '一年に二度の大仕事ですから、気合いを入れて'],
  ['d51', '園田さんって人に宛てた手紙でしたよね。', '封は開けてません。封は開けてませんよ。司書見習いの礼儀です、そこは'],
  ['d155c', '『届ける勇気が、半分足りなかった』と、よく言っていました。', '残りの半分は、誰かが持ってくれればいい、とも'],
  ['d168', '祖母は、この本を何度も直そうとしたと思います。', 'でも、できなかった。直すことは、渡す決意と表裏でしたから'],
  ['d244', '……ふふ。悠太さんは、本当に優しいですね。', 'わたしの勇気を、いつも受け止めてくれる。閉館ですよ、悠太さん'],
];

let nextNum = 327;
for (const [id, first, second] of SPLITS) {
  const idx = y.scenes.findIndex(n => n.id === id);
  if (idx < 0) throw new Error(`not found: ${id}`);
  const node = y.scenes[idx];
  if (node.text !== first + second) throw new Error(`text mismatch: ${id}`);
  if (node.choices || node.branch || node.jump) throw new Error(`not a plain node: ${id}`);
  const succ = y.scenes[idx + 1];
  if (!succ) throw new Error(`no successor: ${id}`);
  const newId = 'd' + (nextNum++);
  if (y.scenes.some(n => n.id === newId)) throw new Error(`id collision: ${newId}`);
  node.text = first;
  node.jump = newId;
  const secondNode = { id: newId, name: node.name, text: second };
  if (node.face) secondNode.face = node.face;
  if (node.char) secondNode.char = node.char;
  secondNode.jump = succ.id;
  y.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split 6 yuna lines (d327-d332 appended)');
