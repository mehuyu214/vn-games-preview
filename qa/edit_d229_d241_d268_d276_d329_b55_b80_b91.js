// W2 優奈の同率最長台詞（d229／d241／d268／d276／d329・19字）＋美咲の同率最長台詞（b55／b80／b91・21字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d229_d241_d268_d276_d329_b55_b80_b91.js）：
// - 優奈 d229／d241／d268／d276／d329 は19字で優奈の同率最長行（次点も19字の d339／d340／d361）。
//   d229 は園田、元の jump=d536 を後半へ引き継ぎ。「今日は、」の後（7字）で分割。
//   d241 は悠太、元の jump=d442 を後半へ引き継ぎ。「逃げるな、」の後（9字）で分割。
//   d268 は優奈（face=smile・char=true を後半へ継承）、元の jump=d349 を後半へ引き継ぎ。「読んだ、」の後（12字）で分割。
//   d276 は優奈（face=sad・char=true を後半へ継承）、元の jump=d522 を後半へ引き継ぎ。「わたしは、」の後（7字）で分割。
//   d329 は悠太、元の jump=d516 を後半へ引き継ぎ。「。」の後（9字）で分割。
// - 美咲 b55／b80／b91 は21字で美咲の同率最長行（次点も21字の b128／b138／b141／b159／b197）。
//   b55 は相沢、元の jump=b364 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   b80 は悠太、元の jump=b537 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   b91 は美咲（face=sad を後半へ継承）、元の jump=b509 を後半へ引き継ぎ。「、」の後（11字）で分割。
// 方式は qa/edit_d185_d196_d224_b391_b449_b482_b530_b543.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d778〜d782（優奈）・b706〜b708（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d229_d241_d268_d276_d329_b55_b80_b91.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd229', 'd778', 7, '館長。今日は、', 'とびきりの一杯を頼むよ。'],
  ['yuna', 'd241', 'd779', 9, '（来た。逃げるな、', '俺も絶対に逃げるな。'],
  ['yuna', 'd268', 'd780', 12, 'ママが子供の頃に読んだ、', '大切な本なの。'],
  ['yuna', 'd276', 'd781', 7, '……わたしは、', '直すことしかできません。'],
  ['yuna', 'd329', 'd782', 9, '封は開けてません。', '封は開けてませんよ。'],
  ['misaki', 'b55', 'b706', 6, '……今日は、', 'これを見られただけで十分です。'],
  ['misaki', 'b80', 'b707', 10, '夜勤は長いですから。', 'どうぞ、全部聞きます。'],
  ['misaki', 'b91', 'b708', 11, 'でも先週の相沢さんは、', 'その人じゃなかった。'],
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
console.log('OK: split d229->d778, d241->d779, d268->d780, d276->d781, d329->d782, b55->b706, b80->b707, b91->b708');
