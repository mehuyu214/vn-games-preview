// W2 優奈の同率最長台詞（d146／d182b・35字）＋美咲の同率最長台詞（b48／b56／b75／b76／b78／b81・35字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d146_d182b_b48_b56_b75_b76_b78_b81.js）：
// - 優奈 d146／d182b は35字で優奈の同率最長行（d221／d226／d227 も35字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   d146 は悠太（地の文）、後続は d147。「。」の後で分割。
//   d182b は白鳥、後続は d183。「。」の後で分割。
// - 美咲 b48／b56／b75／b76／b78／b81 は35字で美咲の同率最長行（b87／b93 も35字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   b48 は美咲（face=serious・char=true を後半へ継承）、後続は b49。「。」の後で分割。
//   b56 は美咲、後続は b57。「。」の後で分割。
//   b75 は美咲（face=serious を後半へ継承）、後続は b76。「。」の後で分割。
//   b76 は悠太、後続は b77。「。」の後で分割。
//   b78 は悠太、後続は b79。「。」の後で分割。
//   b81 は美咲（face=sad を後半へ継承）、後続は b82。「。」の後で分割。
// 方式は qa/edit_d31_d62_d90b_d102_d113b_d142_b32_b40.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d485〜d486（優奈）・b398〜b403（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d146_d182b_b48_b56_b75_b76_b78_b81.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd146', 'd485', 17, '何十年も、本の中で眠っていたのか。', 'ずっと。誰にも読まれず、誰にも届かず'],
  ['yuna', 'd182b', 'd486', 23, 'ええ。お茶と本の話になると、目が輝く人でした。', '園田さんの前では、特にね'],
  ['misaki', 'b48', 'b398', 20, '……お待たせ、しました。これ、ですよね。', '間違いないですか。木の柄の、傘'],
  ['misaki', 'b56', 'b399', 27, '待ってください。傘、持って……せめて、お名前だけでも。', '名乗ってください'],
  ['misaki', 'b75', 'b400', 26, 'うん。供養仲間。食べるのが一番の供養だからね、ほら。', '温かいうちに食べよ'],
  ['misaki', 'b76', 'b401', 16, '先週の人、結局来ませんでしたね。', '雨、降ってるのに。相沢さん、でしたっけ'],
  ['misaki', 'b78', 'b402', 26, 'あの傘、なんですか。聞いてもいいですか、先輩として。', 'ずっと気になってて'],
  ['misaki', 'b81', 'b403', 26, '高校の帰り道。傘、持ってなくて、駅前で立ち往生して。', '制服、びしょ濡れで'],
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
console.log('OK: split d146->d485, d182b->d486, b48->b398, b56->b399, b75->b400, b76->b401, b78->b402, b81->b403');
