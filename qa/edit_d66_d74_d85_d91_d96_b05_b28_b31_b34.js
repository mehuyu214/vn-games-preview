// W2 優奈の同率最長台詞（d66／d74／d85／d91／d96・37字）＋美咲の次点最長台詞（b05／b28／b31／b34・36字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d66_d74_d85_d91_d96_b05_b28_b31_b34.js）：
// - 優奈 d66／d74／d85／d91／d96 は37字で優奈の同率最長行（d98／d103／d106 も37字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   d66 は優奈（face=serious・char=true、jump=d67）、後続は d67。「。」の後で分割。
//   d74 は悠太（地の文）、後続は d75。「。」の後で分割。（は前半に、）は後半へ。
//   d85 は榊、後続は d86。「。」の後で分割。d91 は悠太（地の文）、後続は d92。「。」の後で分割。
//   d96 は悠太（地の文）、後続は d97。「梓。」の後で分割。（は前半に、）は後半へ。
// - 美咲 b05／b28／b31／b34 は36字で美咲の同率最長行（b55／b74／b85／b97 も36字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b05 は悠太（地の文）、後続は b06。「。」の後で分割。（は前半に、）は後半へ。
//   b28 は藤井、後続は b29。「！」の後で分割（後半は全角スペース始まり）。
//   b31 は相沢、後続は b32。1つ目の「。」の後で分割。b34 は藤井、後続は b35。「。」の後で分割。
//   d66／d85／d91／d96／b31 の省略記号「……」は U+2026×2 を文字インデックスで確認済み。
// 方式は qa/edit_d06_d57_d65_b248_b252_b265_b281.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d446〜d450（優奈）・b360〜b363（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d66_d74_d85_d91_d96_b05_b28_b31_b34.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd66', 'd446', 15, '……少しだけ、時間をください。', '考える時間を。心の、製本が終わるまでの時間を'],
  ['yuna', 'd74', 'd447', 24, '（この席に座り続けて、もう何十年になるんだろう。', '席にも、きっと物語がある）'],
  ['yuna', 'd85', 'd448', 18, 'あの、閉館って……もう、ダメですか。', '少しだけでも、話を聞いてもらえませんか'],
  ['yuna', 'd91', 'd449', 21, '（存在しない本。まさに、あの詩集のことだ。', '……優奈さんの顔色が、変わった）'],
  ['yuna', 'd96', 'd450', 26, '（優奈さんの手が、カウンターの上で止まった。……梓。', 'その名前は、やっぱり）'],
  ['misaki', 'b05', 'b360', 25, '（供養って言いながら、もう箸が進んでるんですけど。', '黙祷は三秒で終わった）'],
  ['misaki', 'b28', 'b361', 24, 'よっ、深夜組！　ごめん、傘、忘れてきちゃったー！', '　車に置いてきちゃったよ'],
  ['misaki', 'b31', 'b362', 14, '……私は、待っていますので。', '急がなくて結構ですよ。彼女のペースで、どうぞ'],
  ['misaki', 'b34', 'b363', 25, 'まあいいや。お兄ちゃん、ホットコーヒーちょうだい。', 'ブラックで、熱々のやつ'],
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
console.log('OK: split d66->d446, d74->d447, d85->d448, d91->d449, d96->d450, b05->b360, b28->b361, b31->b362, b34->b363');
