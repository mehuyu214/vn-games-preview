// W2 桜の22字行 a168・a247 とセレナの22字行 e06・e16・e21・e34・e36・e39 の分割（文面不変・分割のみ）
// 実測（qa/measure_sakura22_a168_a247_serena22.js、台詞＝name ありのみ）：
// - 桜の台詞の最長は22字（2件：a168・a247）。
//   セレナの最長は22字（14件：e06・e16・e21・e34・e36・e39・e41・e52・e73・e84・e101・e116・e186・e241）。
//   美咲12字、優奈12字、凛の最長は22字（21件）。
//   a168 は藤堂、jump=a310。「取引です。若い方には、」（11字）で分割。
//   a247 は悠太、後続は次ノード。「さくら。俺もだ。帰ってき」（12字）で分割。
//   e06 はベルタ、後続は次ノード。「使用人頭のベルタです。」（11字）で分割。
//   e16 は悠太、後続は次ノード。「（間違えたのに、自分で」（11字）で分割。
//   e21 はセレナ、後続は次ノード。「先生、今日の課題は何ですの？」（14字）で分割。
//   e34 は悠太、後続は次ノード。「（……今の朗読、完璧だった。」（14字）で分割。
//   e36 は悠太、後続は次ノード。「今の朗読……正直、すごい」（12字）で分割。
//   e39 はセレナ、後続は次ノード。「はい、セレナです。」（9字）で分割。
// 方式は qa/edit_rin23_c395_c411_c419_c425_c439_c454.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード a381・a382（桜）、e298〜e303（セレナ）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_sakura22_a168_a247_serena22_e06_e16_e21_e34_e36_e39.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['sakura', 'a168', 'a381', 11, '取引です。若い方には、', '強く聞こえるでしょう。'],
  ['sakura', 'a247', 'a382', 12, 'さくら。俺もだ。帰ってき', 'た理由、半分はお前だ'],
  ['serena', 'e06', 'e298', 11, '使用人頭のベルタです。', '荷物をお預かりします。'],
  ['serena', 'e16', 'e299', 11, '（間違えたのに、自分で', '先に気づくのか……？）'],
  ['serena', 'e21', 'e300', 14, '先生、今日の課題は何ですの？', '　楽しみですわ。'],
  ['serena', 'e34', 'e301', 14, '（……今の朗読、完璧だった。', 'どういうことだ）'],
  ['serena', 'e36', 'e302', 12, '今の朗読……正直、すごい', 'ですね、セレナさん。'],
  ['serena', 'e39', 'e303', 9, 'はい、セレナです。', 'ええ、その件ですけれど……'],
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
console.log('OK: split a168->a381, a247->a382, e06->e298, e16->e299, e21->e300, e34->e301, e36->e302, e39->e303');
