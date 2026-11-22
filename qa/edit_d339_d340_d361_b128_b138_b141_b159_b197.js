// W2 優奈の同率最長台詞（d339／d340／d361・19字）＋美咲の同率最長台詞（b128／b138／b141／b159／b197・21字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d339_d340_d361_b128_b138_b141_b159_b197.js）：
// - 優奈 d339／d340／d361 は19字で優奈の同率最長行（次点も19字の d365／d373／d378／d384／d387）。
//   d339 は悠太、元の jump=d05 を後半へ引き継ぎ。「、」の後（13字）で分割。
//   d340 は白鳥、元の jump=d121b を後半へ引き継ぎ。「、」の後（9字）で分割。
//   d361 は悠太、元の jump=d196 を後半へ引き継ぎ。「、」の後（8字）で分割。
// - 美咲 b128／b138／b141／b159／b197 は21字で美咲の同率最長行（次点も21字の b240／b250／b252）。
//   b128 は美咲（face=smile を後半へ継承）、元の jump=b412 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   b138 は美咲（face=serious を後半へ継承）、元の jump=b490 を後半へ引き継ぎ。「、」の後（14字）で分割。
//   b141 は店長、元の jump=b415 を後半へ引き継ぎ。「。」の後（11字）で分割。
//   b159 は店長、元の jump=b160 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   b197 は悠太、元の jump=b427 を後半へ引き継ぎ。「、」の後（11字）で分割。
// 方式は qa/edit_d229_d241_d268_d276_d329_b55_b80_b91.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d783〜d785（優奈）・b709〜b713（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d339_d340_d361_b128_b138_b141_b159_b197.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd339', 'd783', 13, '張り切って来たんですけど、', '違いましたか'],
  ['yuna', 'd340', 'd784', 9, '本は届けるものだ、', 'と何度も聞きました。'],
  ['yuna', 'd361', 'd785', 8, '優奈さんの話を、', '最後まで聞いてください'],
  ['misaki', 'b128', 'b709', 8, 'この店の秘密は、', '雨の日にしか動かないから。'],
  ['misaki', 'b138', 'b710', 14, '閉店したら、落とし物は全部、', '処分される……'],
  ['misaki', 'b141', 'b711', 11, '……ああ。知ってるよ。', '知ってて、黙ってた。'],
  ['misaki', 'b159', 'b712', 9, 'ああ。それでいい。', 'それが、あんたの強さだよ'],
  ['misaki', 'b197', 'b713', 11, '（五年分の埃と一緒に、', '後悔も落ちればいい。'],
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
  if (node.r18) secondNode.r18 = node.r18;
  secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split d339->d783, d340->d784, d361->d785, b128->b709, b138->b710, b141->b711, b159->b712, b197->b713');
