// W2 優奈の同率最長台詞（d186／d196／d199／d216／d225b・39字）＋美咲の同率最長台詞（b113／b114・37字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d186_d196_d199_d216_d225b_b113_b114.js）：
// - 優奈 d186／d196／d199／d216／d225b は39字で優奈の最長行（次点 d16／d28／d34:38字）。
//   d186 は園田、後続は d187。d196 は優奈（face=sad・char=true）、後続は d196b。
//   d199 は榊、後続は d199b。d216 は園田、後続は d217。d225b は園田、後続は d226。
// - 美咲 b113／b114 は37字で美咲の同率最長行（b139／b140／b145／b152／b153／b163 も37字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   b113 は悠太、後続は b114。b114 は美咲（face=serious）、後続は b115。「？」直後の全角スペースは b49／b160 と同じく後半へ。
// 方式は qa/edit_d167_d183_b46_b49_b54_b60_b105_b112.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d422〜d426（優奈）・b338／b339（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d186_d196_d199_d216_d225b_b113_b114.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd186', 'd422', 24, 'わしはね、後悔はしていないんだ。若い日々にはね。', 'あの日々があったから、今がある'],
  ['yuna', 'd196', 'd423', 19, '祖母が、ある方に宛てて書いた手紙です。', '恋の手紙、と言っていいと思います。はい。'],
  ['yuna', 'd199', 'd424', 24, '暴きたいんじゃないんです。届けたいんです、僕は。', '祖母の想いを、あるべき場所へ。'],
  ['yuna', 'd216', 'd425', 22, 'ああ、すまなかった。返しそびれてしまってね。', 'ずっと気になっていたんだ、この本は'],
  ['yuna', 'd225b', 'd426', 25, 'ありがとう、司書さん。直してくれて、届けてくれて。', 'あんたは、梓さんの自慢の孫だ'],
  ['misaki', 'b113', 'b338', 18, '備考欄、他のページと字が違いますね。', '濃い字で、丁寧な。誰かが後から書いた字'],
  ['misaki', 'b114', 'b339', 26, '『持ち主来店まで永久保管。大島に引き継ぐ』……大島？', '　なんで人名なんですか'],
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
console.log('OK: split d186->d422, d196->d423, d199->d424, d216->d425, d225b->d426, b113->b338, b114->b339');
