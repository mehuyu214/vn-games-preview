// W2 優奈の残る最長台詞の分割（文面不変・分割のみ）
// 実測（qa/measure_d143_d145b_d147_d156_d184_d194_d199b_d213.js）：
// - 優奈 d143／d145b／d147／d156／d184／d194／d199b／d213 は42字で優奈の最長行（前ランで d13／d22／d25／d42／d44／d95 を分割済み）。
//   d143 は優奈（face=serious・char=true）、d145b は優奈（face=sad・char=true）、d147 は優奈（face=cry・char=true）、
//   d194 は優奈（face=serious・char=true）、d213 は優奈（face=serious・char=true）。
//   d156 は白鳥、d184 は榊、d199b は榊（いずれも face・char・jump なし、配列上の後続へ進む）。
// 方式は qa/edit_d13_d22_d25_d42_d44_d95_b52.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 新規ノード d370〜d377（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d143_d145b_d147_d156_d184_d194_d199b_d213.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

const SPLITS = [
  // [作品ID, 対象ID, 新規ID, 前半テキスト, 後半テキスト]
  ['yuna', 'd143', 'd370',
    'この本は、祖母が除籍しなかった本です。',
    '除籍の印も、廃棄の記録も、どこにもありません。'],
  ['yuna', 'd145b', 'd371',
    '園田さんに渡せなかった、告白の手紙です。',
    '書いたのに、渡せなかった。何十年も、そのまま'],
  ['yuna', 'd147', 'd372',
    '祖母は言えなかったんです、最後まで。',
    '渡せなかった。勇気が、半分だけ足りなかったんです'],
  ['yuna', 'd156', 'd373',
    '残りの半分は、貴方が持っていますよ、優奈さん。',
    '直し続けた、その手が持っているんです。'],
  ['yuna', 'd184', 'd374',
    '祖母の日記にも、同じことが書いてありました。',
    '壊れるのが怖い、と。何度も、同じ言葉で。'],
  ['yuna', 'd194', 'd375',
    'ですが、お渡しはできません。',
    'それだけは、どうか分かってください。理由を、話しますから'],
  ['yuna', 'd199b', 'd376',
    '祖母の想いを、届けたいんです。それだけです。',
    '本は、そのあとなら図書館に寄贈してもいい'],
  ['yuna', 'd213', 'd377',
    '園田さん、お時間をいただけますか。',
    '大事なお話です。半世紀越しの、お届け物があります。'],
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
console.log('OK: split d143->d370, d145b->d371, d147->d372, d156->d373, d184->d374, d194->d375, d199b->d376, d213->d377');
