// W2 凛の22字行先頭8件（c10・c11・c123・c292・c305・c348・c349・c353）の分割（文面不変・分割のみ）
// 実測（qa/measure_rin22_c10_c11_c123_c292_c305_c348_c349_c353.js、台詞＝name ありのみ）：
// - 凛の台詞の最長は22字（21件：c10・c11・c123・c292・c305・c348・c349・c353・c354・c355・
//   c357・c360・c362・c370・c373・c377・c426・c441・c453・c457・c468）。
//   桜の台詞最長は21字（a111・a185・a227・a307・a309）、美咲12字、優奈12字、
//   セレナの最長は21字（e09・e12・e17・e22・e23・e24・e25・e26・e27・e35・e37・e44・
//   e51・e53・e57・e59・e66・e85・e87・e92・e102・e103・e106・e109・e136・e147・e172・
//   e174・e178・e192・e199・e208・e218・e219・e238・e267・e283）。
//   c10 は凛、jump=c389。「悠太、その図3、生データ」（12字）で分割。
//   c11 は悠太、jump=c390。「はい。……あれ、3列目」（11字）で分割。
//   c123 は悠太、jump=c402。「結論は変わらない。研究」（11字）で分割。
//   c292 は凛、jump=c285。「……お元気で、教授、」（10字）で分割。
//   c305 は高峰、jump=c67。「人がデータを裏切るだけ」（11字）で分割。
//   c348 は凛、jump=c28。「誰に口をきいているか分かって」（14字）で分割。
//   c349 は凛、jump=c32。「椅子に座って、悠太。」（10字）で分割。
//   c353 は悠太、jump=c49。「凛さん、俺に決めさせて」（11字）で分割。
// 方式は qa/edit_serena22_e41_e52_e73_e84_e101_e116_e186_e241.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c555〜c562（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin22_c10_c11_c123_c292_c305_c348_c349_c353.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c10', 'c555', 12, '悠太、その図3、生データ', 'と一列ずつ照合して。'],
  ['rin', 'c11', 'c556', 11, 'はい。……あれ、3列目', 'から値が合わないです、'],
  ['rin', 'c123', 'c557', 11, '結論は変わらない。研究', 'は正しかったんですね、'],
  ['rin', 'c292', 'c558', 10, '……お元気で、教授、', 'ありがとうございました。'],
  ['rin', 'c305', 'c559', 11, '人がデータを裏切るだけ', 'だ、覚えておきなさい。'],
  ['rin', 'c348', 'c560', 14, '誰に口をきいているか分かって', 'いるの、あなた。'],
  ['rin', 'c349', 'c561', 10, '椅子に座って、悠太。', '長くなるわよ、覚悟して。'],
  ['rin', 'c353', 'c562', 11, '凛さん、俺に決めさせて', 'ください、今夜のこと。'],
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
  const origEnd = !!node.end;
  const succ = origJump ? g.scenes.find(n => n.id === origJump) : g.scenes[idx + 1];
  if (!origEnd && !succ) throw new Error(`no successor: ${id}`);
  node.text = first;
  node.jump = newId;
  if (origEnd) delete node.end;
  const secondNode = { id: newId, name: node.name, text: second };
  if (node.face) secondNode.face = node.face;
  if (node.char) secondNode.char = node.char;
  if (node.r18) secondNode.r18 = node.r18;
  if (origEnd) secondNode.end = true;
  else secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${origEnd ? '(end)' : succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split c10->c555, c11->c556, c123->c557, c292->c558, c305->c559, c348->c560, c349->c561, c353->c562');
