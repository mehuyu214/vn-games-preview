// W2 優奈の同率最長台詞（d258・33字）＋美咲の同率最長台詞（b212／b227／b230／b238／b239／b240・35字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d258_b212_b227_b230_b238_b239_b240.js）：
// - 優奈 d258 は33字で優奈の同率最長行（d260／d329 も33字で同率だが本ランは前ラン次回候補の1行のみ対象）。
//   d258 は優奈（face=ecstasy・char=true を後半へ継承）、後続は d258b。唯一の「。」の後で分割（文末に「。」あり）。
// - 美咲 b212／b227／b230／b238／b239／b240 は35字で美咲の同率最長行（b253／b254 も35字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   b212 は相沢、後続は b213。2つ目の「。」の後で分割（文末に「。」なし）。
//   b227 は美咲（face=cry を後半へ継承）、後続は b228。2つ目の「。」の後で分割（文末に「。」なし）。
//   b230 は相沢、後続は b231。唯一の「。」の後で分割（文末に「。」なし）。
//   b238 は悠太（地の文・括弧内）、後続は b239（本ランで同時に分割するが、b430→b239→b431 と連鎖するため問題なし）。唯一の「。」の後で分割（文末に「）」）。
//   b239 は藤井、後続は b240（本ランで同時に分割するが、b431→b240→b432 と連鎖するため問題なし）。1つ目の「。」の後で分割（文末に「。」なし）。
//   b240 は相沢、後続は b241。2つ目の「。」の後で分割（文末に「。」なし）。
// 方式は qa/edit_d141_d198_d224_d245_d252_d253_d257_b200_b204.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d514（優奈）・b430〜b435（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d258_b212_b227_b230_b238_b239_b240.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd258', 'd514', 22, 'あっ……はぁ、悠太さん、好き……大好きです。', 'こんな気持ち、初めて。'],
  ['misaki', 'b212', 'b430', 16, '……ええ。受け取りに、来ました。', '……ありがとう。来てくれて、ありがとう'],
  ['misaki', 'b227', 'b431', 25, 'それでも、返してくれた。それが、あなたの答えです。', 'わたしはそう思います'],
  ['misaki', 'b230', 'b432', 17, '……この傘、確かに受け取りました。', 'ありがとう、美咲さん。……ありがとう'],
  ['misaki', 'b238', 'b433', 22, '（店長、その台詞、今日だけは文句なしに許す。', 'むしろ拍手したいくらいだ）'],
  ['misaki', 'b239', 'b434', 11, '紳士、空港まで送るよ。', '泣くのは車の中でね、たっぷりと。ティッシュあるよ'],
  ['misaki', 'b240', 'b435', 21, '美咲さん。……お父さんに、よく似ています。', '目元が。……どうか、お元気で'],
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
console.log('OK: split d258->d514, b212->b430, b227->b431, b230->b432, b238->b433, b239->b434, b240->b435');
