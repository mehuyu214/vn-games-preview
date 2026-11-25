// W2 優奈の最長行（d706／d727／d743／d751／d791／d834、14字・優奈の最長行の残り6件ちょうど）＋美咲の次点最長行（b412／b415／b418／b427／b435／b463／b472／b478、14字・47件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_d706_d727_d743_d751_d791_d834_b412_b415_b418_b427_b435_b463_b472_b478.js）：
// - 優奈 d706／d727／d743／d751／d791／d834 は14字で優奈の最長行（6件同率の残り全部）。
//   d706 は悠太、元の jump=d433 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d727 は白鳥、元の jump=d358 を後半へ引き継ぎ。「まで」の後（4字）で分割。
//   d743 は優奈、元の jump=d57 を後半へ引き継ぎ。「は」の後（4字）で分割。face=serious・char=true を後半へ継承。
//   d751 は優奈、元の jump=d351 を後半へ引き継ぎ。「ない」の後（6字）で分割。face=shy・char=true を後半へ継承。
//   d791 は優奈、元の jump=d275b を後半へ引き継ぎ。「きっと」の後（3字）で分割。face=smile・char=true を後半へ継承。
//   d834 は悠太、元の jump=d147 を後半へ引き継ぎ。「、」の後（8字）で分割。
// - 美咲 b412／b415／b418／b427／b435／b463／b472／b478 は14字で美咲の次点最長行（47件同率の先頭8件）。
//   b412 は美咲、元の jump=b129 を後半へ引き継ぎ。「、」の後（11字）で分割。face=smile を後半へ継承。
//   b415 は店長、元の jump=b142 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b418 は悠太、元の jump=b651 を後半へ引き継ぎ。「チャイム」の後（7字）で分割。末尾の全角スペースは後半に残る。
//   b427 は悠太、元の jump=b202 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   b435 は相沢、元の jump=b241 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   b463 は美咲、元の jump=b195 を後半へ引き継ぎ。「。」の後（7字）で分割。face=shy を後半へ継承。
//   b472 は美咲、元の jump=b725 を後半へ引き継ぎ。「、」の後（3字）で分割。face=smile・char=true を後半へ継承。
//   b478 は相沢、元の jump=b51 を後半へ引き継ぎ。「。」の後（9字）で分割。
// 方式は qa/edit_d648_..._b355.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d1067〜d1072（優奈）・b1001〜b1008（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d706_d727_d743_d751_d791_d834_b412_b415_b418_b427_b435_b463_b472_b478.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd706', 'd1067', 6, '館長なりの、', '背中の押し方だ。'],
  ['yuna', 'd727', 'd1068', 4, '最後まで', '後悔していましたよ。'],
  ['yuna', 'd743', 'd1069', 4, 'あの本は', '捨てられてしまいます'],
  ['yuna', 'd751', 'd1070', 6, '帰りたくない', '気分ですけれど。'],
  ['yuna', 'd791', 'd1071', 3, 'きっと', '届けられませんでした。'],
  ['yuna', 'd834', 'd1072', 8, '誰にも読まれず、', '誰にも届かず'],
  ['misaki', 'b412', 'b1001', 11, '……そんな気がするの、', 'ずっと'],
  ['misaki', 'b415', 'b1002', 5, 'ごめんね、', '美咲ちゃん。本当に'],
  ['misaki', 'b418', 'b1003', 7, 'ドアのチャイム', '鳴りました？　'],
  ['misaki', 'b427', 'b1004', 6, '彼女の分も、', '相沢さんの分も）'],
  ['misaki', 'b435', 'b1005', 10, '目元が。……どうか、', 'お元気で'],
  ['misaki', 'b463', 'b1006', 7, '逃げないでね。', '書き終わるまで'],
  ['misaki', 'b472', 'b1007', 3, '看板、', '届かなくなってきたよ。'],
  ['misaki', 'b478', 'b1008', 9, 'この傘が、ここに。', '……五年も'],
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
console.log('OK: split d706->d1067, d727->d1068, d743->d1069, d751->d1070, d791->d1071, d834->d1072, b412->b1001, b415->b1002, b418->b1003, b427->b1004, b435->b1005, b463->b1006, b472->b1007, b478->b1008');
