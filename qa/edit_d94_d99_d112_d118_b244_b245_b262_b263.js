// W2 優奈の同率最長台詞（d94／d99／d112／d118・36字）＋美咲の同率最長台詞（b244／b245／b262／b263・36字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d94_d99_d112_d118_b244_b245_b262_b263.js）：
// - 優奈 d94／d99／d112／d118 は36字で優奈の同率最長行（d144／d151／d204c／d247 も36字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   d94 は優奈（face=sad・char=true、後半へ継承）、後続は d95。「。」の後で分割。
//   d99 は白鳥、後続は d100。「。」の後で分割。
//   d112 は優奈（face=confused・char=true、後半へ継承）、後続は d113。「。」の後で分割。
//   d118 は優奈（face=angry・char=true、後半へ継承）、後続は d119。「。」の後で分割。
// - 美咲 b244／b245／b262／b263 は36字で美咲の同率最長行（b266／b291 も36字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b244 は美咲（face=shy、後半へ継承）、元の jump=b261 を後半へ引き継ぎ。省略記号「……」は U+2026×2 を文字インデックスで確認済み。
//   b245 は美咲（face=sad・char=true、後半へ継承）、後続は b246。「……」の後で分割。
//   b262 は美咲（face=shy・char=true、後半へ継承）、後続は b263。「。」の後で分割。
//   b263 は悠太、後続は b264。「。」の後で分割。
// 方式は qa/edit_d73_d89_b208_b220_b228_b237.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d469〜d472（優奈）・b384〜b387（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d94_d99_d112_d118_b244_b245_b262_b263.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd94', 'd469', 22, '……お力には、なれません。申し訳ありません。', '当館には、そのような本は……'],
  ['yuna', 'd99', 'd470', 25, '梓さんの、お孫さんですか。……大きくなりましたね。', '目元が、よく似ています'],
  ['yuna', 'd112', 'd471', 23, '館長、わたしまで呼ばれた理由は、何でしょうか。', 'お茶だけ、ではないですよね'],
  ['yuna', 'd118', 'd472', 22, 'なぜ、止めなかったんですか。規則違反なのに。', '館長なら、止める立場でしょう'],
  ['misaki', 'b244', 'b384', 20, 'うん。聞かせて。……閉店したら、うちで。', 'ゆっくりね。二人きりで、ちゃんと'],
  ['misaki', 'b245', 'b385', 29, '相沢さん。あの、その……言わなきゃいけないことがあって……', 'ずっと、五年間'],
  ['misaki', 'b262', 'b386', 27, '悠太くん。さっきの、続き。聞かせて。ここなら静かだよ。', '誰にも邪魔されない'],
  ['misaki', 'b263', 'b387', 26, '好きです。美咲さんが。ずっと前から、本当に好きです。', '夜勤のたびに、ずっと'],
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
console.log('OK: split d94->d469, d99->d470, d112->d471, d118->d472, b244->b384, b245->b385, b262->b386, b263->b387');
