// W2 桜の20字行4件（a48・a270・a275・a293）と凛の20字行先頭4件（c68・c106・c129・c133）の分割（文面不変・分割のみ）
// 実測（qa/measure_sakura20_rin20.js、台詞＝name ありのみ）：
// - 桜の台詞の最長は20字（4件：a48・a270・a275・a293）。美咲12字、優奈12字、
//   凛の最長は20字（25件）、セレナの最長は20字（47件）。これで桜の20字行は0件になる。
//   a48 は悠太、jump なし（次ノードへ）。「（なんでもない、」（8字）で分割。
//   a270 は店主、jump なし（次ノードへ）。「……めでたい。一杯どうだ。」（13字）で分割。
//   a275 は悠太、jump なし（次ノードへ）。「（ああ。この先の人生も、」（12字）で分割。
//   a293 は悠太、jump なし（次ノードへ）。「（小指は温かい。」（8字）で分割。
//   c68 は高峰、jump=c445。「じゃ、私は昼寝……」（9字）で分割。
//   c106 は悠太、jump=c447。「はい。記録、元データ」（10字）で分割。
//   c129 は悠太、jump=c491。「噂の心配は、起きてから」（11字）で分割。
//   c133 は悠太、jump=c520。「（この笑顔があれば、」（10字）で分割。
// 方式は qa/edit_serena21_e218_e219_e238_e267_e283.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード a388〜a391（桜）、c595〜c598（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_sakura20_a48_a270_a275_a293_rin20_c68_c106_c129_c133.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['sakura', 'a48', 'a388', 8, '（なんでもない、', 'が一番なんでもなくない）'],
  ['sakura', 'a270', 'a389', 13, '……めでたい。一杯どうだ。', '今日のは祝杯だ'],
  ['sakura', 'a275', 'a390', 12, '（ああ。この先の人生も、', '現像が楽しみだ）'],
  ['sakura', 'a293', 'a391', 8, '（小指は温かい。', 'でも届かない距離がある）'],
  ['rin', 'c68', 'c595', 9, 'じゃ、私は昼寝……', 'じゃなくて会議だった、'],
  ['rin', 'c106', 'c596', 10, 'はい。記録、元データ', 'と完全に一致しました'],
  ['rin', 'c129', 'c597', 11, '噂の心配は、起きてから', '二人でしましょう。'],
  ['rin', 'c133', 'c598', 10, '（この笑顔があれば、', 'あと3割でも戦える、'],
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
  console.log(`${id} -> ${newId} -> ${origEnd ? '(end)' : succ.id} (${[...first].length}+${[...second].length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split a48->a388, a270->a389, a275->a390, a293->a391, c68->c595, c106->c596, c129->c597, c133->c598');
