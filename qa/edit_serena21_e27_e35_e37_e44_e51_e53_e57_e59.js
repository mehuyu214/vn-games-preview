// W2 セレナの21字行の次8件（e27・e35・e37・e44・e51・e53・e57・e59）の分割（文面不変・分割のみ）
// 実測（qa/measure_serena21_e27_e35_e37_e44_e51_e53_e57_e59.js、台詞＝name ありのみ）：
// - セレナの台詞の最長は21字（27件：e27・e35・e37・e44・e51・e53・e57・e59・e66・e85・e87・
//   e92・e102・e103・e106・e109・e136・e147・e172・e174・e178・e192・e199・e208・e218・e219・
//   e238・e267・e283）。
//   桜の台詞最長は20字、美咲12字、優奈12字、凛の最長は20字。
//   e27 はベルタ、jump なし（次ノードへ）。「お茶をお持ちしました。」（11字）で分割。
//   e35 はセレナ、jump なし（次ノードへ）。「あら、先生。いらしてた」（11字）で分割。
//   e37 はセレナ、jump なし（次ノードへ）。「まぐれですわ。」（7字）で分割。
//   e44 はセレナ、jump なし（次ノードへ）。「では、秘密にしてくださいな。」（14字）で分割。
//   e51 はセレナ、jump なし（次ノードへ）。「なぜ、と聞きますのね。」（11字）で分割。
//   e53 はセレナ、jump なし（次ノードへ）。「……良い先生ですわね、」（11字）で分割。
//   e57 は悠太、jump=e64。「（俺の手で？　」（7字）で分割。
//   e59 はセレナ、jump なし（次ノードへ）。「あら、優しい嘘ですわね。」（12字）で分割。
// 方式は qa/edit_serena21_e09_e12_e17_e22_e23_e24_e25_e26.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード e320〜e327（セレナ）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_serena21_e27_e35_e37_e44_e51_e53_e57_e59.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['serena', 'e27', 'e320', 11, 'お茶をお持ちしました。', '判定、良い香りです。'],
  ['serena', 'e35', 'e321', 11, 'あら、先生。いらしてた', 'の？　驚きましたわ。'],
  ['serena', 'e37', 'e322', 7, 'まぐれですわ。', '音読だけ、昔から得意でして。'],
  ['serena', 'e44', 'e323', 14, 'では、秘密にしてくださいな。', 'お願いですわ。'],
  ['serena', 'e51', 'e324', 11, 'なぜ、と聞きますのね。', 'まっすぐな方ですわ。'],
  ['serena', 'e53', 'e325', 11, '……良い先生ですわね、', '本当に。困りますわ。'],
  ['serena', 'e57', 'e326', 7, '（俺の手で？　', 'どういう意味なんだ、それは）'],
  ['serena', 'e59', 'e327', 12, 'あら、優しい嘘ですわね。', 'ありがとう、先生。'],
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
console.log('OK: split e27->e320, e35->e321, e37->e322, e44->e323, e51->e324, e53->e325, e57->e326, e59->e327');
