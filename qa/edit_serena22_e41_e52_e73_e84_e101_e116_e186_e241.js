// W2 セレナの22字行残り8件（e41・e52・e73・e84・e101・e116・e186・e241）の分割（文面不変・分割のみ）
// 実測（qa/measure_serena22_e41_e52_e73_e84_e101_e116_e186_e241.js、台詞＝name ありのみ）：
// - セレナの台詞の最長は22字（8件：e41・e52・e73・e84・e101・e116・e186・e241）。
//   桜の台詞最長は21字（a111・a185・a227・a307・a309）、美咲12字、優奈12字、
//   凛の最長は22字（21件：c10・c11・c123・c292・c305・c348・c349・c353・c354・c355・
//   c357・c360・c362・c370・c373・c377・c426・c441・c453・c457・c468）。
//   e41 は悠太、後続は次ノード。「（敬語まで完璧じゃないか。」（13字）で分割。
//   e52 は悠太、後続は次ノード。「生徒に嘘をつかれたままでは、」（14字）で分割。
//   e73 は悠太、後続は次ノード。「セレナさん、何か大きな」（11字）で分割。
//   e84 はセレナ、後続は次ノード。「ベルタ、そんなに近いですの？」（14字）で分割。
//   e101 は悠太、後続は次ノード。「悠太です。よろしくお願い」（12字）で分割。
//   e116 は悠太、後続は次ノード。「……分かりました。」（9字）で分割。
//   e186 は悠太、後続は次ノード。「アランさんは、本気なんですか。」（15字）で分割。
//   e241 は悠太、後続は次ノード。「一緒に、開けましょう。」（11字）で分割。
// 方式は qa/edit_sakura22_a168_a247_serena22_e06_e16_e21_e34_e36_e39.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード e304〜e311（セレナ）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_serena22_e41_e52_e73_e84_e101_e116_e186_e241.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['serena', 'e41', 'e304', 13, '（敬語まで完璧じゃないか。', '生徒の顔はどこへ）'],
  ['serena', 'e52', 'e305', 14, '生徒に嘘をつかれたままでは、', '教えられません。'],
  ['serena', 'e73', 'e306', 11, 'セレナさん、何か大きな', '秘密でもあるんですか。'],
  ['serena', 'e84', 'e307', 14, 'ベルタ、そんなに近いですの？', '　わたくしたち。'],
  ['serena', 'e101', 'e308', 12, '悠太です。よろしくお願い', 'します、アランさん。'],
  ['serena', 'e116', 'e309', 9, '……分かりました。', 'やりましょう、セレナさん。'],
  ['serena', 'e186', 'e310', 15, 'アランさんは、本気なんですか。', 'セレナさんに。'],
  ['serena', 'e241', 'e311', 11, '一緒に、開けましょう。', 'セレナさんと、二人で。'],
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
console.log('OK: split e41->e304, e52->e305, e73->e306, e84->e307, e101->e308, e116->e309, e186->e310, e241->e311');
