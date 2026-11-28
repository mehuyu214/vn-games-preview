// W2 凛の21字行残り3件（c464・c465・c478）と桜の21字行5件（a111・a185・a227・a307・a309）の分割（文面不変・分割のみ）
// 実測（qa/measure_rin21_c464_c465_c478_sakura21_a111_a185_a227_a307_a309.js、台詞＝name ありのみ）：
// - 凛の台詞の最長は21字（3件：c464・c465・c478）。
//   桜の台詞最長は21字（5件：a111・a185・a227・a307・a309）、美咲12字、優奈12字、
//   セレナの最長は21字（e09・e12・e17・e22・e23・e24・e25・e26・e27・e35・e37・e44・
//   e51・e53・e57・e59・e66・e85・e87・e92・e102・e103・e106・e109・e136・e147・e172・
//   e174・e178・e192・e199・e208・e218・e219・e238・e267・e283）。
//   c464 は真壁、jump=c205。「文句なし、合格だよ、」（10字）で分割。
//   c465 は凛、jump=c206。「……でも、今のは少し」（10字）で分割。
//   c478 は凛、jump=c269。「それで異論は、認めな」（10字）で分割。
//   a111 はさくら、jump なし（次ノードへ）。「やめて。お願い、ミキ。」（11字）で分割。
//   a185 は店主、jump なし（次ノードへ）。「氷はないがな。冷たい」（10字）で分割。
//   a227 は店主、jump なし（次ノードへ）。「……決まったな。一杯」（10字）で分割。
//   a307 はさくら、jump=a155。「渡すか開けるかは。その」（11字）で分割。
//   a309 は悠太、jump=a41。「（さくらは嘘がつけない」（11字）で分割。
// 方式は qa/edit_rin21_c339_c344_c351_c387_c392_c434_c438_c449.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c592〜c594（凛）・a383〜a387（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin21_c464_c465_c478_sakura21_a111_a185_a227_a307_a309.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c464', 'c592', 10, '文句なし、合格だよ、', '助手くん、見事だった。'],
  ['rin', 'c465', 'c593', 10, '……でも、今のは少し', '、遠かったわ、私には。'],
  ['rin', 'c478', 'c594', 10, 'それで異論は、認めな', 'いわよ、誰にも、絶対。'],
  ['sakura', 'a111', 'a383', 11, 'やめて。お願い、ミキ。', 'これ以上、騒がないで'],
  ['sakura', 'a185', 'a384', 10, '氷はないがな。冷たい', 'のならある。一杯どうだ'],
  ['sakura', 'a227', 'a385', 10, '……決まったな。一杯', 'どうだ。今日のは特別だ'],
  ['sakura', 'a307', 'a386', 11, '渡すか開けるかは。その', '人と、決めなさいって'],
  ['sakura', 'a309', 'a387', 11, '（さくらは嘘がつけない', '。それが常識だった）'],
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
console.log('OK: split c464->c592, c465->c593, c478->c594, a111->a383, a185->a384, a227->a385, a307->a386, a309->a387');
