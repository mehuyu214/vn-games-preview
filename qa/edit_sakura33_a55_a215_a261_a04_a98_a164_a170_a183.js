// W2 桜の最長台詞 a55／a215／a261（33字）／a04／a98／a164／a170／a183（32字）の分割（文面不変・分割のみ）
// 実測（qa/measure_sakura33_a55_a215_a261.js）：
// - 桜の台詞の最長は33字（a55・a215・a261 の3件）、次が32字（7件）。34字超えは0件。
//   a55 は悠太、元の後続は a56。「（今聞いても、答えない顔だ）。」（15字）で分割。
//   a215 は桜、face=cry・char=true を後半へ継承。元の後続は a216。「これ……おじいちゃん、守ってたんだ。」（18字）で分割。
//   a261 は桜、face=ecstasy・char=true・r18=true を後半へ継承。元の後続は a262。「わたしも、すき……あぁ、とけちゃう。」（18字）で分割。
//   a04 は桜、face=smile・char=true を後半へ継承。元の後続は a05。「えっとね、ちょうど通りかかったの。」（17字）で分割。
//   a98 は桜、face=smile・char=true を後半へ継承。元の後続は a99。「……ねえ悠太。この公園、覚えてる？」（17字）で分割。
//   a164 は藤堂、元の後続は a165。「支配人には、私から話を通しました。」（17字）で分割。
//   a170 は藤堂、元の jump=a305 を後半へ引き継ぎ。「店主。先代の件、ご存じでしょう。」（16字）で分割。
//   a183 は桜、face=shy・char=true を後半へ継承。元の後続は a184。「……悠太は、そういうこと言うよね。」（17字）で分割。
// 方式は qa/edit_sakura34_a152_a259_a09_a150_a159_a172_a179_a194.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード a322〜a329（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_sakura33_a55_a215_a261_a04_a98_a164_a170_a183.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['sakura', 'a55', 'a322', 15, '（今聞いても、答えない顔だ）。', '（待つ。写真も、現像には時間がいる）'],
  ['sakura', 'a215', 'a323', 18, 'これ……おじいちゃん、守ってたんだ。', '藤堂さんの家族を、守ってたんだ'],
  ['sakura', 'a261', 'a324', 18, 'わたしも、すき……あぁ、とけちゃう。', '悠太の全部、わたしにちょうだい'],
  ['sakura', 'a04', 'a325', 17, 'えっとね、ちょうど通りかかったの。', '駅前の花屋さんに、用事があって'],
  ['sakura', 'a98', 'a326', 17, '……ねえ悠太。この公園、覚えてる？', '夏休み、毎日ここで撮ってたよね'],
  ['sakura', 'a164', 'a327', 17, '支配人には、私から話を通しました。', '個展の件は、申し訳なく思います'],
  ['sakura', 'a170', 'a328', 16, '店主。先代の件、ご存じでしょう。', 'あのフィルムは、私の家の恥です。'],
  ['sakura', 'a183', 'a329', 17, '……悠太は、そういうこと言うよね。', '昔から。さらっと、言うんだよね'],
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
console.log('OK: split a55->a322, a215->a323, a261->a324, a04->a325, a98->a326, a164->a327, a170->a328, a183->a329');
