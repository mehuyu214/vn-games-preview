// W2 優奈の17字最長行（d152／d155c）＋美咲の19字最長行（b497／b510／b518）の分割（文面不変・分割のみ）
// 実測（qa/measure_d152_d155c_b497_b510_b518.js）：
// - 優奈 d152／d155c は17字で優奈の同率最長行（次点も17字の d162／d176c／d188／d193c／d198／d213）。
//   d152 は優奈、face=surprise・char=true を後半へ継承、jumpなし（後続 d153 へ）。「。」の後（10字）で分割。
//   d155c は白鳥、元の jump=d541 を後半へ引き継ぎ。「、」の後（8字）で分割。
// - 美咲 b497／b510／b518 は19字で美咲の同率最長行（次点も19字の b524／b545／b547／b554／b596）。
//   b497 は美咲、face=cry・char=true を後半へ継承、元の jump=b237 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   b510 は悠太、元の jump=b93 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   b518 は悠太、元の jump=b276 を後半へ引き継ぎ。「。」の後（11字）で分割。
// 方式は qa/edit_d75_d76_d90_d106_d113_d146_b409_b414_b430_b481_b495.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d859〜d860（優奈）・b787〜b789（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d152_d155c_b497_b510_b518.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd152', 'd859', 10, '館長、閉館後ですよ。', 'もう、とっくに'],
  ['yuna', 'd155c', 'd860', 8, '『届ける勇気が、', '半分足りなかった』'],
  ['misaki', 'b497', 'b787', 10, '……大事に、します。', '一生、大事にします'],
  ['misaki', 'b510', 'b788', 10, 'あの男の友人だって。', 'じゃあ本人は今……'],
  ['misaki', 'b518', 'b789', 11, '約束します、美咲さん。', '一生、離しません'],
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
console.log('OK: split d152->d859, d155c->d860, b497->b787, b510->b788, b518->b789');
