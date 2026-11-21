// W2 優奈の同率最長台詞（d07b／d17／d31／d145b・20字）＋美咲の同率最長台詞（b418／b434・24字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d07b_d17_d31_d145b_b418_b434.js）：
// - 優奈 d07b／d17／d31／d145b は20字で優奈の同率最長行（次点は20字の d155／d161／d185b／d193b）。
//   d07b は白鳥、元の jump=d415 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   d17 は悠太、元の jump=d395 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   d31 は悠太、元の jump=d479 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   d145b は優奈（face=sad・char=true を後半へ継承）、元の jump=d371 を後半へ引き継ぎ。「、」の後（12字）で分割。
// - 美咲 b418／b434 は24字で美咲の同率最長行（次点は23字の b04／b18／b40／b51／b53／b89）。
//   b418 は悠太、元の jump=b162 を後半へ引き継ぎ。「？」＋全角スペースの後（14字）で分割。
//   b434 は藤井、元の jump=b240 を後半へ引き継ぎ。「。」の後（16字）で分割。
// 方式は qa/edit_d393_d396_d405_d552_b269_b289_b303_b308_b329.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d723〜d726（優奈）・b651・b652（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d07b_d17_d31_d145b_b418_b434.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd07b', 'd723', 9, '棚卸し開始の判子、', '押しておきましたから。'],
  ['yuna', 'd17', 'd724', 9, 'カードの代わりに、', 'これが挟まってました。'],
  ['yuna', 'd31', 'd725', 5, '（渡した。', 'でも、目は離さないことにした。'],
  ['yuna', 'd145b', 'd726', 12, '園田さんに渡せなかった、', '告白の手紙です。'],
  ['misaki', 'b418', 'b651', 14, 'ドアのチャイム鳴りました？　', '忍者ですか、この人は'],
  ['misaki', 'b434', 'b652', 16, '泣くのは車の中でね、たっぷりと。', 'ティッシュあるよ'],
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
console.log('OK: split d07b->d723, d17->d724, d31->d725, d145b->d726, b418->b651, b434->b652');
