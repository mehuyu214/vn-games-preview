// W2 優奈の同率最長台詞（d144／d151／d204c／d247・36字）＋美咲の同率最長台詞（b266／b291・36字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d144_d151_d204c_d247_b266_b291.js）：
// - 優奈 d144／d151／d204c／d247 は36字で優奈の同率最長行（d253c／d279 も36字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   d144 は悠太、後続は d145。「。」の後で分割。
//   d151 は白鳥、後続は d152。「。」の後で分割。
//   d204c は優奈（face=serious・char=true、後半へ継承）、元の jump=d209 を後半へ引き継ぎ。「。」の後で分割。
//   d247 は悠太、後続は d248。「……！」の後で分割（後半は全角スペース始まり。b28 と同じ方式）。
// - 美咲 b266／b291 は36字で美咲の同率最長行（次点 b08／b10／b19／b23／b29／b30:35字）。
//   b266 は美咲（face=smile、後半へ継承）、後続は b267。「。」の後で分割。
//   b291 は店長、後続は b292。「。」の後で分割。
// 方式は qa/edit_d94_d99_d112_d118_b244_b245_b262_b263.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d473〜d476（優奈）・b388〜b389（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d144_d151_d204c_d247_b266_b291.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd144', 'd473', 21, '目録に無い本は、こうして生まれたんですね。', '館長の、たった一度の規則破りで'],
  ['yuna', 'd151', 'd474', 21, 'あら、二人とも。ちょうどお茶の時間ですよ。', '重い話のあとは、お茶に限ります'],
  ['yuna', 'd204c', 'd475', 18, 'もう、直すだけじゃ終われないんです。', '祖母の二の舞は、わたしで終わらせます'],
  ['yuna', 'd247', 'd476', 16, '（閉館ですよ、の最終形態だ……！', '　同じ言葉が、告白に変わる日が来るとは）'],
  ['misaki', 'b266', 'b388', 19, 'これからは、隣を歩く人を、自分で選ぶ。', 'もう待たない。自分から、歩いていく'],
  ['misaki', 'b291', 'b389', 13, 'まあ、なんとかなるっしょ。', '……なったねえ、本当に。五年が、朝の店になった'],
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
console.log('OK: split d144->d473, d151->d474, d204c->d475, d247->d476, b266->b388, b291->b389');
