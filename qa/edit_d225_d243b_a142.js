// W2 各作品の最長台詞の分割（文面不変・分割のみ）
// 実測（qa/measure_d225_d243b_a142.js）：
// - 優奈 d225／d243b は43字で優奈の最長行（次点 d13／d22／d25／d42／d44／d95:42字）。
//   d225 は園田、d243b は悠太（いずれも face・char・jump なし、配列上の後続へ進む）。
// - 桜 a142 は35字で桜の最長行（a298 も35字だが a246 分割の後半ノードのため対象外）。
//   a142 は悠太（face・char・jump なし）。
// 方式は qa/edit_d111_d155_d167c_d187_d195_a05.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 新規ノード d362・d363（優奈）・a312（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d225_d243b_a142.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

const SPLITS = [
  // [作品ID, 対象ID, 新規ID, 前半テキスト, 後半テキスト]
  ['yuna', 'd225', 'd362',
    'いや。届いたよ、今。半世紀かけて、ちゃんと届いた。',
    '手紙ってのは、届けば負けないんだな。'],
  ['yuna', 'd243b', 'd363',
    '考える時間は、もう十分にありましたから。',
    '修理を手伝う日々の中で、答えは決まっていました'],
  ['sakura', 'a142', 'a312',
    '（……今夜は、知らないふりをしよう）。',
    '（問い詰めるのは、昼の顔でやる）'],
];

for (const [gid, id, newId, first, second] of SPLITS) {
  const g = GAMES.find(x => x.id === gid);
  const idx = g.scenes.findIndex(n => n.id === id);
  if (idx < 0) throw new Error(`not found: ${id}`);
  const node = g.scenes[idx];
  if (node.text !== first + second) throw new Error(`text mismatch: ${id}`);
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
console.log('OK: split d225->d362, d243b->d363, a142->a312');
