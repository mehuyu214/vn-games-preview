// W2 優奈の同率最長台詞（d98／d103／d106・37字）＋美咲の同率最長台詞（b55／b74／b85／b97・36字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d98_d103_d106_b55_b74_b85_b97.js）：
// - 優奈 d98／d103／d106 は37字で優奈の同率最長行（d127／d136／d171／d185／d185c も37字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d98 は悠太（地の文）、後続は d99。「。」の後で分割。（は前半に、）は後半へ。
//   d103 は悠太、後続は d104。2つ目の「。」の後で分割。
//   d106 は優奈（face=sad・char=true、後半へ継承）、後続は d107。1つ目の「。」の後で分割。
// - 美咲 b55／b74／b85／b97 は36字で美咲の同率最長行（b100／b104／b116／b119 も36字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b55 は相沢、後続は b56。「。」の後で分割。先頭の省略記号「……」は U+2026×2 を文字インデックスで確認済み。
//   b74 は悠太、後続は b75。2つ目の「。」の後で分割。省略記号「……」は U+2026×2 を文字インデックスで確認済み。
//   b85 は美咲（face=sad、後半へ継承）、後続は b86。2つ目の「。」の後で分割。
//   b97 は藤井、後続は b98。1つ目の「。」の後で分割。
// 方式は qa/edit_d66_d74_d85_d91_d96_b05_b28_b31_b34.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d451〜d453（優奈）・b364〜b367（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d98_d103_d106_b55_b74_b85_b97.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd98', 'd451', 19, '（館長、ルールがお茶基準すぎるだろう。', 'でも、この緩さが人を救うこともある）'],
  ['yuna', 'd103', 'd452', 22, '優奈さん。今の人、梓さんって言いましたよね。', 'あの反応、ただごとじゃなかった'],
  ['yuna', 'd106', 'd453', 17, '手紙を書いたのは、きっと祖母です。', '間違いありません。あの字は、祖母の字です'],
  ['misaki', 'b55', 'b364', 21, '……今日は、これを見られただけで十分です。', 'ありがとう。本当に、ありがとう'],
  ['misaki', 'b74', 'b365', 24, '供養、ですか。……俺も共犯にする気ですね、先輩。', '先週からずっとそうですよ'],
  ['misaki', 'b85', 'b366', 28, 'そう。紙袋の中は、温かい缶コーヒーとカイロと、飴が三つ。', '気が利く人だった'],
  ['misaki', 'b97', 'b367', 17, '先週の紳士、あたしが送ったんだよ。', '駅前のホテルまで。雨の中、ずぶ濡れでね'],
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
console.log('OK: split d98->d451, d103->d452, d106->d453, b55->b364, b74->b365, b85->b366, b97->b367');
