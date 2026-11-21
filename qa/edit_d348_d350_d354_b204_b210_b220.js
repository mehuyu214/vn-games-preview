// W2 優奈の同率最長台詞（d348／d350／d354・22字）＋美咲の同率最長台詞（b204／b210／b220・25字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d348_d350_d354_b204_b210_b220.js）：
// - 優奈 d348／d350／d354 は22字で優奈の同率最長行（d371／d400／d414／d417／d427 も22字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d348 は悠太、元の jump=d46 を後半へ引き継ぎ。「、」の後（14字）で分割。
//   d350 は白鳥、元の jump=d157 を後半へ引き継ぎ。「。」の後（15字）で分割。
//   d354 は悠太、元の jump=d42 を後半へ引き継ぎ。「、」の後（10字）で分割。
// - 美咲 b204／b210／b220 は25字で美咲の同率最長行（b223／b224／b226／b227／b237 も25字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   b204 は藤井、元の jump=b429 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   b210 は相沢、元の jump=b351 を後半へ引き継ぎ。「。」の後（17字）で分割。
//   b220 は美咲（face=shy を後半へ継承）、元の jump=b381 を後半へ引き継ぎ。「。」の後（15字）で分割。
// 方式は qa/edit_d252_d258_d277_d330_d336_b137_b152_b168_b178_b196.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d682〜d684（優奈）・b608〜b610（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d348_d350_d354_b204_b210_b220.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd348', 'd682', 14, '規則より大事な何かがあった、', 'ってことですよね'],
  ['yuna', 'd350', 'd683', 15, '届ける許可は、館長が出します。', 'あとは貴方次第'],
  ['yuna', 'd354', 'd684', 10, 'この人の『閉館』は、', 'いつも少しだけ嘘くさい）'],
  ['misaki', 'b204', 'b608', 10, '帰りはあたしが送る。', '任せな、紳士の専属だよ今夜は。'],
  ['misaki', 'b210', 'b609', 17, '……今夜が、最後の雨だそうですね。', '来て、よかった。'],
  ['misaki', 'b220', 'b610', 15, '五年間、言えなかったお礼です。', 'やっと、書けました。'],
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
console.log('OK: split d348->d682, d350->d683, d354->d684, b204->b608, b210->b609, b220->b610');
