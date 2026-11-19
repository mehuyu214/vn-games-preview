// W2 優奈の次点最長台詞（d31／d62／d90b／d102／d113b／d142・35字）＋美咲の次点最長台詞（b32／b40・35字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d31_d62_d90b_d102_d113b_d142_b32_b40.js）：
// - 優奈 d31／d62／d90b／d102／d113b／d142 は35字で優奈の同率最長行（d146／d182b も35字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   d31 は悠太（地の文）、後続は d32。「。」の後で分割。
//   d62 は悠太、後続は d63。「。」の後で分割。
//   d90b は榊、後続は d91。「。」の後で分割。
//   d102 は榊、後続は d103。「。」の後で分割。
//   d113b は白鳥、後続は d114。「。」の後で分割。
//   d142 は悠太、後続は d143。「。」の後で分割。
// - 美咲 b32／b40 は35字で美咲の次点最長行（b48／b56／b75／b76／b78／b81 も35字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   b32 は藤井、後続は b33。「。」の後で分割。
//   b40 は悠太（地の文）、後続は b41。「。」の後で分割。
// 方式は qa/edit_d253c_d279_b08_b10_b19_b23_b29_b30.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d479〜d484（優奈）・b396〜b397（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d31_d62_d90b_d102_d113b_d142_b32_b40.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd31', 'd479', 20, '（渡した。でも、目は離さないことにした。', 'あの慌て方、ただごとじゃない）'],
  ['yuna', 'd62', 'd480', 25, '一人で抱えるから重いんです。荷物は分けるものです。', '本だって、人生だって'],
  ['yuna', 'd90b', 'd481', 18, '祖母の遺品整理で日記が出てきまして。', '『あの本だけは、図書館に残した』と'],
  ['yuna', 'd102', 'd482', 28, '明日、また来ます。諦めませんので、よろしくお願いします。', '祖母のためにも'],
  ['yuna', 'd113b', 'd483', 28, 'これで二人も共犯ですね。梓さんは、私の前の前の館長です。', '立派な方でした'],
  ['yuna', 'd142', 'd484', 22, 'うん、聞きます。最後まで、ちゃんと聞きます。', '途中で驚いても、逃げません'],
  ['misaki', 'b32', 'b396', 26, 'ん？　あんた、どっかで見た顔だねえ。五、六年前かな。', '駅前のほうで、確か'],
  ['misaki', 'b40', 'b397', 23, '（高そうな傘だ。……いったい、誰のものなんだ。', 'なんで先輩が震えるんだ）'],
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
console.log('OK: split d31->d479, d62->d480, d90b->d481, d102->d482, d113b->d483, d142->d484, b32->b396, b40->b397');
