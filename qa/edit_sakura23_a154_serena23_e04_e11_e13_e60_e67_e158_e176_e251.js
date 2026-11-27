// W2 桜の23字行 a154／セレナの23字行 e04・e11・e13・e60・e67・e158・e176・e251 の分割（文面不変・分割のみ）
// 実測（qa/measure_sakura23_a154_serena23_e04_e11_e13_e60_e67_e158_e176_e251.js、台詞＝name ありのみ）：
// - 桜の台詞の最長は23字（1件：a154）。セレナの最長は23字（8件：e04・e11・e13・e60・e67・e158・e176・e251）。
//   美咲12字、優奈12字、凛の最長は23字（14件：c40・c73・c301・c329・c336・c363・c374・c393・c395・c411・c419・c425・c439・c454）。
//   a154 はさくら、jump=a307。「フィルムの一枚目に写ってる人。」（15字）で分割。
//   e04 はベルタ、後続 e05。「判定、到着が三分遅れです。」（13字）で分割。
//   e11 はセレナ、後続 e12。「お待ちしておりましたわ。」（12字）で分割。
//   e13 はセレナ、後続 e14。「いいえ、まだまだですわ。」（12字）で分割。
//   e60 は悠太、後続 e61。「嘘じゃなくて、配慮です。」（12字）で分割。
//   e67 はグレゴリー、後続 e68。「守秘義務がございますので、」（13字）で分割。
//   e158 はグレゴリー、後続 e159。「これが遺言の条件です。」（11字）で分割。
//   e176 は悠太、後続 e177。「試すなら、最後まで試してください。」（17字）で分割。
//   e251 は悠太、後続 e252。「セレナ。改めて言います。」（12字）で分割。
// 方式は qa/edit_rin24_c195_c316_c320_c338_c364_c409_c414_c424.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード a380（桜）・e290〜e297（セレナ）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_sakura23_a154_serena23_e04_e11_e13_e60_e67_e158_e176_e251.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['sakura', 'a154', 'a380', 15, 'フィルムの一枚目に写ってる人。', 'その人が来たら、'],
  ['serena', 'e04', 'e290', 13, '判定、到着が三分遅れです。', '初日から減点ですね。'],
  ['serena', 'e11', 'e291', 12, 'お待ちしておりましたわ。', '長旅でお疲れでしょう？'],
  ['serena', 'e13', 'e292', 12, 'いいえ、まだまだですわ。', '勉強はこれからですの。'],
  ['serena', 'e60', 'e293', 12, '嘘じゃなくて、配慮です。', '事情があるんでしょう。'],
  ['serena', 'e67', 'e294', 13, '守秘義務がございますので、', '申し上げられません。'],
  ['serena', 'e158', 'e295', 11, 'これが遺言の条件です。', 'ご理解いただけましたか。'],
  ['serena', 'e176', 'e296', 17, '試すなら、最後まで試してください。', '逃げません。'],
  ['serena', 'e251', 'e297', 12, 'セレナ。改めて言います。', '好きです、愛してます。'],
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
  const origEnd = !!node.end;
  const succ = origJump ? g.scenes.find(n => n.id === origJump) : g.scenes[idx + 1];
  if (!origEnd && !succ) throw new Error(`no successor: ${id}`);
  node.text = first;
  node.jump = newId;
  if (origEnd) delete node.end;
  const secondNode = { id: newId, name: node.name, text: second };
  if (node.face) secondNode.face = node.face;
  if (node.char) secondNode.char = node.char;
  if (node.r18) secondNode.r18 = node.r18;
  if (origEnd) secondNode.end = true;
  else secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${origEnd ? '(end)' : succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split a154->a380, e04->e290, e11->e291, e13->e292, e60->e293, e67->e294, e158->e295, e176->e296, e251->e297');
