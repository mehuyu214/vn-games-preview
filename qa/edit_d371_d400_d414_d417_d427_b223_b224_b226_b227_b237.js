// W2 優奈の同率最長台詞（d371／d400／d414／d417／d427・22字）＋美咲の同率最長台詞（b223／b224／b226／b227／b237・25字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d371_d400_d414_d417_d427_b223_b224_b226_b227_b237.js）：
// - 優奈 d371／d400／d414／d417／d427 は22字で優奈の同率最長行（d431／d434／d446 も22字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   d371 は優奈（face=sad・char=true を後半へ継承）、元の jump=d146 を後半へ引き継ぎ。「。」の後（13字）で分割。
//   d400 は園田、元の jump=d72 を後半へ引き継ぎ。「。」の後（13字）で分割。
//   d414 は白鳥、元の jump=d07b を後半へ引き継ぎ。「。」の後（7字）で分割。
//   d417 は白鳥、元の jump=d113b を後半へ引き継ぎ。「。」の後（13字）で分割。
//   d427 は優奈（face=serious・char=true を後半へ継承）、元の jump=d17 を後半へ引き継ぎ。「。」の後（11字）で分割。
// - 美咲 b223／b224／b226／b227／b237 は25字で美咲の同率最長行（b254／b280／b281 も25字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   b223 は相沢、元の jump=b354 を後半へ引き継ぎ。「。」の後（17字）で分割。
//   b224 は美咲（face=cry を後半へ継承）、元の jump=b527 を後半へ引き継ぎ。「。」の後（5字）で分割。
//   b226 は相沢、元の jump=b467 を後半へ引き継ぎ。「、と」の後（17字）で分割。
//   b227 は美咲（face=cry を後半へ継承）、元の jump=b431 を後半へ引き継ぎ。「。」の後（12字）で分割。
//   b237 は店長、元の jump=b383 を後半へ引き継ぎ。「。」の後（14字）で分割。
// 方式は qa/edit_d348_d350_d354_b204_b210_b220.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d685〜d689（優奈）・b611〜b615（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d371_d400_d414_d417_d427_b223_b224_b226_b227_b237.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd371', 'd685', 13, '書いたのに、渡せなかった。', '何十年も、そのまま'],
  ['yuna', 'd400', 'd686', 13, 'ああ、ここが落ち着くんだ。', '日当たりが良くてね'],
  ['yuna', 'd414', 'd687', 7, '熱いうちにね。', '仕事は、お茶のあとで十分です。'],
  ['yuna', 'd417', 'd688', 13, '『極秘』の判子を、二人分。', '押しました、ほら。'],
  ['yuna', 'd427', 'd689', 11, '　本の奥のポケットに。', '……確認、してください'],
  ['misaki', 'b223', 'b611', 17, '……柄の中身に、気づいたんですね。', '……そうですか。'],
  ['misaki', 'b224', 'b612', 5, '相沢さん。', 'わたし、お父さんのことで、責めてません。'],
  ['misaki', 'b226', 'b613', 17, '顔向けできず、傘だけでも返そう、と', '……卑怯でした。'],
  ['misaki', 'b227', 'b614', 12, 'それでも、返してくれた。', 'それが、あなたの答えです。'],
  ['misaki', 'b237', 'b615', 14, 'ほら、なんとかなったっしょ。', '……よかった、本当に。'],
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
console.log('OK: split d371->d685, d400->d686, d414->d687, d417->d688, d427->d689, b223->b611, b224->b612, b226->b613, b227->b614, b237->b615');
