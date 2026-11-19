// W2 優奈の同率最長台詞（d141／d198／d224／d245／d252／d253／d257・33字）＋美咲の同率最長台詞（b200／b204・35字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d141_d198_d224_d245_d252_d253_d257_b200_b204.js）：
// - 優奈 d141／d198／d224／d245／d252／d253／d257 は33字で優奈の同率最長行（d258 も33字で同率だが本ランは前ラン次回候補の7行のみ対象）。
//   d141 は優奈（face=serious・char=true を後半へ継承）、後続は d142。2つ目の「。」の後で分割（文末に「。」なし）。
//   d198 は優奈（face=serious・char=true を後半へ継承）、後続は d199。唯一の「。」の後で分割（文末に「。」なし）。
//   d224 は優奈（face=cry・char=true を後半へ継承）、後続は d225。唯一の「。」の後で分割（文末に「。」なし）。
//   d245 は悠太、後続は d246。唯一の「。」の後で分割（文末に「。」なし）。
//   d252 は悠太、後続は d253（本ランで同時に分割するが、d511→d253→d512 と連鎖するため問題なし）。2つ目の「。」の後で分割（文末に「。」なし）。
//   d253 は優奈（face=love・char=true を後半へ継承）、後続は d253b。2つ目の「。」の後で分割（文末に「。」あり、後半は「……」始まり）。
//   d257 は悠太、後続は d258。2つ目の「。」の後で分割（文末に「。」なし）。
// - 美咲 b200／b204 は35字で美咲の同率最長行（b212／b227／b230／b238／b239／b240 も35字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   b200 は美咲（face=sad を後半へ継承）、後続は b201。2つ目の「。」の後で分割（文末に「。」なし）。
//   b204 は藤井、後続は b205。2つ目の「。」の後で分割（文末に「。」なし）。
// 方式は qa/edit_d120_b179_b186_b187_b190_b195_b197.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d507〜d513（優奈）・b428／b429（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d141_d198_d224_d245_d252_d253_d257_b200_b204.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd141', 'd507', 19, '全部、話します。悠太さんにだけ、全部。', 'もう、隠すのは終わりにします'],
  ['yuna', 'd198', 'd508', 17, '榊さんは、本をどうしたいんですか。', '本当のところを、聞かせてください'],
  ['yuna', 'd224', 'd509', 19, '二人は、ずっとすれ違っていたんですね。', 'こんなに近い場所で、半世紀も'],
  ['yuna', 'd245', 'd510', 18, 'え、帰れってことですか、今の流れで。', 'それは、さすがに酷くないですか'],
  ['yuna', 'd252', 'd511', 22, '俺は何もしてないよ。届けたのは優奈さんです。', '俺は隣で、見ていただけ'],
  ['yuna', 'd253', 'd512', 23, 'ねえ、悠太さん。もう少し、近くに来てください。', '……もっと、近くに。'],
  ['yuna', 'd257', 'd513', 21, 'うん。優奈さんのペースでいこう、ゆっくり。', '急ぐ理由は、どこにもない'],
  ['misaki', 'b200', 'b428', 24, '言えるかな。……五年、言えなかったのに、わたし。', '本番に弱いんです、実は'],
  ['misaki', 'b204', 'b429', 25, '帰りはあたしが送る。任せな、紳士の専属だよ今夜は。', '空港まで、一直線でね'],
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
console.log('OK: split d141->d507, d198->d508, d224->d509, d245->d510, d252->d511, d253->d512, d257->d513, b200->b428, b204->b429');
