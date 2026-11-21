// W2 優奈の次点最長台詞（d05／d21／d33／d41／d50／d56・21字）＋美咲の次点最長台詞（b11／b14／b28／b29／b33・24字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d05_d21_d33_d41_d50_d56_b11_b14_b28_b29_b33.js）：
// - 優奈 d05／d21／d33／d41／d50／d56 は21字で優奈の同率最長行（次点は21字の d91／d92）。
//   d05 は優奈（face=smile・char=true を後半へ継承）、元の jump=d461 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   d21 は悠太、元の jump=d544 を後半へ引き継ぎ。「？」の後（7字）で分割。後半は原文通り全角スペースから始まる。
//   d33 は優奈（face=sad・char=true を後半へ継承）、元の jump=d463 を後半へ引き継ぎ。「。」の後（14字）で分割。
//   d41 は悠太、元の jump=d354 を後半へ引き継ぎ。「、」の後（12字）で分割。
//   d50 は優奈（face=serious・char=true を後半へ継承）、元の jump=d381 を後半へ引き継ぎ。「。」の後（14字）で分割。
//   d56 は優奈（face=serious・char=true を後半へ継承）、元の jump=d382 を後半へ引き継ぎ。「は」の後（12字）で分割。
// - 美咲 b11／b14／b28／b29／b33 は24字で美咲の同率最長行（次点は24字の b49／b71／b74）。
//   b11 は悠太、元の jump=b508 を後半へ引き継ぎ。「か」の後（16字）で分割。
//   b14 は悠太、元の jump=b474 を後半へ引き継ぎ。「は」の後（12字）で分割。
//   b28 は藤井、元の jump=b361 を後半へ引き継ぎ。「！」の後（7字）で分割。後半は原文通り全角スペースから始まる。
//   b29 は悠太、元の jump=b394 を後半へ引き継ぎ。「て」の後（12字）で分割。
//   b33 は悠太、元の jump=b443 を後半へ引き継ぎ。「に」の後（12字）で分割。
// 方式は qa/edit_d487_d554_b285_b287_b491.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d695〜d700（優奈）・b622〜b626（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d05_d21_d33_d41_d50_d56_b11_b14_b28_b29_b33.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd05', 'd695', 8, 'ええ、簡単です。', '……三万冊までは、ですが。'],
  ['yuna', 'd21', 'd696', 7, 'え、優奈さん？', '　どうしたんです、いきなり。'],
  ['yuna', 'd33', 'd697', 14, '理由は……今は、言えません。', 'ごめんなさい。'],
  ['yuna', 'd41', 'd698', 12, '（出て行けと言いながら、', 'どこか寂しそうだ。'],
  ['yuna', 'd50', 'd699', 14, 'この本は、誰にも渡せません。', '誰にも、です。'],
  ['yuna', 'd56', 'd700', 12, '規則では、未登録の資料は', '廃棄処分なんです。'],
  ['misaki', 'b11', 'b622', 16, '（何が、どう、なんとかなったのか', '全然わからない。'],
  ['misaki', 'b14', 'b623', 12, '（二回言えば大抵のことは', '解決すると思ってる人だ。'],
  ['misaki', 'b28', 'b624', 7, 'よっ、深夜組！', '　ごめん、傘、忘れてきちゃったー！'],
  ['misaki', 'b29', 'b625', 12, '藤井さん、タクシー置いて', '入ってこないでください。'],
  ['misaki', 'b33', 'b626', 12, '（藤井さん、初対面の客に', 'それを言うのはどうかと。'],
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
console.log('OK: split d05->d695, d21->d696, d33->d697, d41->d698, d50->d699, d56->d700, b11->b622, b14->b623, b28->b624, b29->b625, b33->b626');
