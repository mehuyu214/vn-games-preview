// W2 優奈の次点最長台詞（d04／d21／d71／d102／d113b／d121／d258b・28字）＋美咲の次点最長台詞（b269／b270／b283／b289・34字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d04_d21_d71_d102_d113b_d121_d258b_b269_b270_b283_b289.js）：
// - 優奈 d04／d21／d71／d102／d113b／d121／d258b は28字で優奈の同率最長行（d266 も28字で同率だが本ランは前ラン次回候補の7行のみ対象）。
//   d04 は悠太、元の jump=d339 を後半へ引き継ぎ。1つ目の「。」の後で分割。
//   d21 は悠太、後続は d22。1つ目の「。」の後で分割（文末に句読点なし）。
//   d71 は園田、後続は d71b。1つ目の「。」の後で分割。
//   d102 は榊、元の jump=d482 を後半へ引き継ぎ。1つ目の「。」の後で分割。
//   d113b は白鳥、元の jump=d483 を後半へ引き継ぎ。1つ目の「。」の後で分割。
//   d121 は白鳥、元の jump=d340 を後半へ引き継ぎ。1つ目の「。」の後で分割。
//   d258b は優奈（face=ecstasy・char=true を後半へ継承）、後続は d259。1つ目の「。」の後で分割（文末に句読点なし）。
// - 美咲 b269／b270／b283／b289 は34字で美咲の同率最長行（次点は33字多数）。
//   b269 は悠太、後続は b270。1つ目の「。」の後で分割。
//   b270 は美咲（face=love・char=true を後半へ継承）、後続は b271。2つ目の「。」の後で分割（文末に句読点なし）。
//   b283 は美咲（face=smile・char=true を後半へ継承）、後続は b284。1つ目の「。」の後で分割（文末に句読点なし）。
//   b289 は悠太、後続は b290。2つ目の「。」の後で分割（文末に句読点なし）。
// 方式は qa/edit_d170_b218_b226_b232_b267.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d543〜d549（優奈）・b470〜b473（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d04_d21_d71_d102_d113b_d121_d258b_b269_b270_b283_b289.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd04', 'd543', 10, 'おはようございます。', '数えるだけの簡単なお仕事、ですよね。'],
  ['yuna', 'd21', 'd544', 21, 'え、優奈さん？　どうしたんです、いきなり。', 'そんなに慌てて'],
  ['yuna', 'd71', 'd545', 12, 'やあ、修理屋の兄ちゃん。', '今日は司書さんと一緒か、珍しい。'],
  ['yuna', 'd102', 'd546', 9, '明日、また来ます。', '諦めませんので、よろしくお願いします。'],
  ['yuna', 'd113b', 'd547', 12, 'これで二人も共犯ですね。', '梓さんは、私の前の前の館長です。'],
  ['yuna', 'd121', 'd548', 19, '『本は、届くべき人の元へ届けること』。', 'それが口癖でした。'],
  ['yuna', 'd258b', 'd549', 18, 'もっと……近くに、感じていたいです。', '離れたくない、今夜は'],
  ['misaki', 'b269', 'b470', 24, '（五年待った人の、初めての『選ぶ』という言葉だ。', '……重くて、嬉しい）'],
  ['misaki', 'b270', 'b471', 13, 'ねえ。今夜は、帰さないよ。', '悠太くんの手、あったかい……ずっと触れてて'],
  ['misaki', 'b283', 'b472', 13, 'お腹、大きくなってきたね。', '看板、届かなくなってきたよ。よいしょ、っと'],
  ['misaki', 'b289', 'b473', 24, '写真ですね。傘と一緒に、海外の雨の街を歩いてる。', '元気そうで、よかった'],
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
console.log('OK: split d04->d543, d21->d544, d71->d545, d102->d546, d113b->d547, d121->d548, d258b->d549, b269->b470, b270->b471, b283->b472, b289->b473');
