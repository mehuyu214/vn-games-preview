// W2 優奈の同率最長台詞（d32／d53／d55／d58／d71b・40字）＋凛の最長台詞（c284・38字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d32_d53_d55_d58_d71b_c284.js）：
// - 優奈 d32／d53／d55／d58／d71b は40字で優奈の最長行（d72／d86／d93 も40字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   d32 は優奈（face=sad・char=true、元の jump=d36 を後半へ引き継ぎ）、d58 は優奈（face=shy・char=true）。
// - 凛 c284 は38字で凛の最長行。凛（face=cry・char=true）。
// 方式は qa/edit_d08_d15_d17_b07_b12_b24_b27_b43_b61_b64_b73.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d396〜d400（優奈）・c292（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d32_d53_d55_d58_d71b_c284.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd32', 'd396', 19, 'この本のことは、どうか忘れてください。', '……お願い。わたしからの、一生のお願いです'],
  ['yuna', 'd53', 'd397', 17, '窓際の席の、あのおじいさんですね。', '知ってます。俺にもよく、声をかけてくれる人です'],
  ['yuna', 'd55', 'd398', 24, '届ければいいじゃないですか、今からでも遅くない。', '手紙は、届いて初めて手紙なんです'],
  ['yuna', 'd58', 'd399', 17, '……わたしは、直していただけです。', '本当に、それだけ。守るだなんて、大それたことは'],
  ['yuna', 'd71b', 'd400', 18, 'いつもは一人で、本と話してるのにね。', 'ああ、ここが落ち着くんだ。日当たりが良くてね'],
  ['rin', 'c284', 'c292', 16, 'はい。教授の字、持っていきます。', '……お元気で、教授、ありがとうございました。'],
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
console.log('OK: split d32->d396, d53->d397, d55->d398, d58->d399, d71b->d400, c284->c292');
