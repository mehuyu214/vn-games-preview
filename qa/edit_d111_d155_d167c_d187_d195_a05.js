// W2 各作品の最長台詞の分割（文面不変・分割のみ）
// 実測（qa/measure_d111_d155_d167c_d187_d195_a05.js）：
// - 優奈 d111／d155／d167c／d187／d195 は43字で優奈の最長行（d225／d243b も
//   43字で同率だが本ランは前ラン次回候補の5行のみ対象）。d111 は白鳥、
//   d155 は白鳥、d167c は優奈（face=smile・char=true）、d187 は白鳥、
//   d195 は悠太（いずれも jump なし・配列上の後続へ進む）。
// - 桜 a05 は36字で桜の最長行（次点 a142:35字）。a05 は悠太。
// 方式は qa/edit_d41_d63_d76_a40_a168.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 新規ノード d357〜d361（優奈）・a311（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d111_d155_d167c_d187_d195_a05.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

const SPLITS = [
  // [作品ID, 対象ID, 新規ID, 前半テキスト, 後半テキスト]
  ['yuna', 'd111', 'd357',
    '悠太さん、よく来てくれました。さあ、座って座って。',
    'お茶は三人分、たっぷり淹れてあります'],
  ['yuna', 'd155', 'd358',
    '梓さんはね、最後まで後悔していましたよ。',
    'あの本のことだけは、ずっと気にかけていました。'],
  ['yuna', 'd167c', 'd359',
    '本は、直せば応えてくれます。人と違って、正直ですから。',
    '壊れたところが、そのまま見えます'],
  ['yuna', 'd187', 'd360',
    'さあ、お茶が冷めます。明日のために、今日は早く休みましょう。',
    '明日は、長い一日になります'],
  ['yuna', 'd195', 'd361',
    '榊さん、落ち着いて。理由があるんです、ちゃんと。',
    '優奈さんの話を、最後まで聞いてください'],
  ['sakura', 'a05', 'a311',
    '（花屋は反対側だ。袋も持ってない）。',
    '（……偶然、にしては時計台の真下だ）'],
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
console.log('OK: split d111->d357, d155->d358, d167c->d359, d187->d360, d195->d361, a05->a311');
