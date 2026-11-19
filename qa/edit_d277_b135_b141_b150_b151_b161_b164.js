// W2 優奈の同率最長台詞（d277・34字）＋美咲の同率最長台詞（b135／b141／b150／b151／b161／b164・35字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d277_b135_b141_b150_b151_b161_b164.js）：
// - 優奈 d277 は34字で優奈の同率最長行（次点 d24／d43／d52／d54／d92／d115／d116:33字）。
//   d277 は悠太、後続は d278。2つ目の「。」の後で分割（文末に「。」なし）。
// - 美咲 b135／b141／b150／b151／b161／b164 は35字で美咲の同率最長行（b165／b175 も35字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   b135 は美咲（face=surprise を後半へ継承）、後続は b136。2つ目の「。」の後で分割（文末に「。」なし）。
//   b141 は店長、後続は b142。3つ目の「。」の後で分割（文末に「。」なし）。
//   b150 は悠太、後続は b151。文中に「。」なしのため「店長が言い続けてたのは、」の後（読点）で分割。
//   b151 は店長、後続は b152。唯一の「。」の後で分割（文末に「。」なし）。
//   b161 は悠太、後続は b162。1つ目の「。」の後で分割（文末に「。」なし）。
//   b164 は藤井、後続は b165。2つ目の「。」の後で分割（文末に「。」なし）。
// 方式は qa/edit_d174_d230_d269_b128_b132.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d498（優奈）・b414〜b419（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d277_b135_b141_b150_b151_b161_b164.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd277', 'd498', 22, '届けたじゃないですか。園田さんに、ちゃんと。', 'あれは、立派な配達でした'],
  ['misaki', 'b135', 'b414', 16, '……え。閉店……来月末、ですか。', '本当に、ですか。冗談じゃ、ないですよね'],
  ['misaki', 'b141', 'b415', 21, '……ああ。知ってるよ。知ってて、黙ってた。', 'ごめんね、美咲ちゃん。本当に'],
  ['misaki', 'b150', 'b416', 23, '前の店主の……じゃあ、店長が言い続けてたのは、', '先代の真似だったんですか'],
  ['misaki', 'b151', 'b417', 23, 'あの傘を預かった時、あの人は笑って言ったんだ。', '心配するおれに、笑ってね'],
  ['misaki', 'b161', 'b418', 11, '藤井さん、いつの間に。', 'ドアのチャイム鳴りました？　忍者ですか、この人は'],
  ['misaki', 'b164', 'b419', 26, 'あの人、来月、海外に行くんだって。長くだよ、たぶん。', '帰りは未定だってさ'],
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
console.log('OK: split d277->d498, b135->b414, b141->b415, b150->b416, b151->b417, b161->b418, b164->b419');
