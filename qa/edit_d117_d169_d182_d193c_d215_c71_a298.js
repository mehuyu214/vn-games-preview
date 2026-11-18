// W2 優奈の同率最長台詞（d117／d169／d182／d193c／d215・40字）＋凛の最長台詞（c71・37字）＋桜の最長台詞（a298・35字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d117_d169_d182_d193c_d215_c71_a298.js）：
// - 優奈 d117／d169／d182／d193c／d215 は40字で優奈の最長行（d223b／d240／d263 も40字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   d193c は優奈（face=serious・char=true）、d215 は優奈（face=sad・char=true）、d182 の後続は d182b。
// - 凛 c71 は37字で凛の最長行（次点 c73／c90／c92／c101／c186／c188／c194:35字）。小野寺。
// - 桜 a298 は35字で桜の最長行（a246 分割の後半ノードの後続にあたる既存ノード、元の jump=a247 を後半へ引き継ぐ）。
//   a298 はさくら（face=serious・char=true）。
// 方式は qa/edit_d72_d86_d93_b95_b103_b131_b160_b168_b180_b233_b249.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d404〜d408（優奈）・c293（凛）・a313（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d117_d169_d182_d193c_d215_c71_a298.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd117', 'd404', 27, '知っていました。ずっと、見ていましたよ、貴方の修理を。', '腕を上げましたね、優奈さん'],
  ['yuna', 'd169', 'd405', 19, '直すたびに、渡す覚悟が要りますからね。', 'きっと。直った本は、もう言い訳に使えません'],
  ['yuna', 'd182', 'd406', 22, 'これが梓さん、そして窓際が若い園田さんです。', '二人とも、まだ二十代の頃の写真です。'],
  ['yuna', 'd193c', 'd407', 17, '祖母の本は、確かにここにあります。', '本当です。昨日は、嘘をつきました。ごめんなさい'],
  ['yuna', 'd215', 'd408', 16, '半世紀前、未返却になった本です。', '覚えていますか。園田さんが借りた、最後の詩集です'],
  ['rin', 'c71', 'c293', 19, '悠太さん……私、やらかしてないですか、', '何か大きな、取り返しのつかない……。'],
  ['sakura', 'a298', 'a313', 10, '夏の日から、ずっと。', 'フィルムみたいに。時間を置くほど、像が濃くなったの'],
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
console.log('OK: split d117->d404, d169->d405, d182->d406, d193c->d407, d215->d408, c71->c293, a298->a313');
