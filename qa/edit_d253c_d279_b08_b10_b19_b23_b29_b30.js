// W2 優奈の同率最長台詞（d253c／d279・36字）＋美咲の次点最長台詞（b08／b10／b19／b23／b29／b30・35字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d253c_d279_b08_b10_b19_b23_b29_b30.js）：
// - 優奈 d253c／d279 は36字で優奈の同率最長行（次点 d31／d62／d90b／d102／d113b／d142:35字）。
//   d253c は優奈（face=love・char=true、後半へ継承）、後続は d254。「。」の後で分割。
//   d279 は悠太（地の文）、後続は d280。「。」の後で分割。
// - 美咲 b08／b10／b19／b23／b29／b30 は35字で美咲の次点最長行（b32／b40 も35字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   b08 は店長、後続は b09。「。」の後で分割。
//   b10 は店長、後続は b11。「。」の後で分割。
//   b19 は悠太（地の文）、後続は b20。「。」の後で分割。
//   b23 は美咲（face=serious、後半へ継承）、後続は b24。「。」の後で分割。
//   b29 は悠太、後続は b30。「。」の後で分割。
//   b30 は藤井、後続は b31。「。」の後で分割。
// 方式は qa/edit_d144_d151_d204c_d247_b266_b291.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d477〜d478（優奈）・b390〜b395（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d253c_d279_b08_b10_b19_b23_b29_b30.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd253c', 'd477', 21, '規則は守ります。自分の気持ちにも、正直に。', 'それが、わたしの新しい規則です'],
  ['yuna', 'd279', 'd478', 20, '（言いかけた何かを、彼女はそっと閉じた。', '本の頁を閉じるみたいに、静かに）'],
  ['misaki', 'b08', 'b390', 17, 'おーい、二人とも。生きてるかーい。', '雨、すごいねえ。店の前、川みたいだよ'],
  ['misaki', 'b10', 'b391', 13, 'まあ、なんとかなるっしょ。', '傘は途中で裏返ったけどね。骨が一本、逝ったよ'],
  ['misaki', 'b19', 'b392', 26, '（あの雨の日の傘……？　そんな商品、うちにあったか。', '落とし物の話かな）'],
  ['misaki', 'b23', 'b393', 15, '……悠太くん。レジ、代わって。', 'お願い、すぐ戻るから。……お願い、聞いて'],
  ['misaki', 'b29', 'b394', 24, '藤井さん、タクシー置いて入ってこないでください。', '路駐、バレますよ本当に'],
  ['misaki', 'b30', 'b395', 19, '客が一人もいないと思ったら、一人いた。', 'しかも紳士だね。雨なのに品がある'],
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
console.log('OK: split d253c->d477, d279->d478, b08->b390, b10->b391, b19->b392, b23->b393, b29->b394, b30->b395');
