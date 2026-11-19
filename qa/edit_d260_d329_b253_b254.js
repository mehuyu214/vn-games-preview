// W2 優奈の同率最長台詞（d260／d329・33字）＋美咲の同率最長台詞（b253／b254・35字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d260_d329_b253_b254.js）：
// - 優奈 d260／d329 は33字で優奈の同率最長行（次点 d14／d196b／d197／d218／d246／d276:32字）。
//   d260 は優奈（face=pleasure・char=true を後半へ継承）、後続は d261。1つ目の「。」の後で分割（文末に「。」なし）。
//   d329 は悠太、元の jump=d52 を後半へ引き継ぎ。2つ目の「。」の後で分割（文末に「。」なし）。
// - 美咲 b253／b254 は35字で美咲の同率最長行（b259／b277／b285／b287 も35字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   b253 は悠太、後続は b254（本ランで同時に分割するが、b436→b254→b437 と連鎖するため問題なし）。2つ目の「。」の後で分割（文末に「。」なし）。
//   b254 は美咲（face=sad を後半へ継承）、後続は b255。2つ目の「。」の後で分割（文末に「。」なし）。
// 方式は qa/edit_d258_b212_b227_b230_b238_b239_b240.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d515／d516（優奈）・b436／b437（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d260_d329_b253_b254.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd260', 'd515', 18, '見ないで……いえ、見ていてください。', 'わたしを。全部、悠太さんにだけ'],
  ['yuna', 'd329', 'd516', 19, '封は開けてません。封は開けてませんよ。', '司書見習いの礼儀です、そこは'],
  ['misaki', 'b253', 'b436', 18, '美咲さん……。言葉、見つかりません。', 'ごめんなさい。俺も、隣で固まってて'],
  ['misaki', 'b254', 'b437', 25, '傘、バックヤードに戻して。いつもの場所に、お願い。', '……また、預かるから'],
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
console.log('OK: split d260->d515, d329->d516, b253->b436, b254->b437');
