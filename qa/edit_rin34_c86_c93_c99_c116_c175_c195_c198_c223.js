// W2 凛の残る34字行 c86／c93／c99／c116／c175／c195／c198／c223 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin34_c86_c93_c99_c116_c175_c195_c198_c223.js）：
// - 凛の台詞の最長は34字（11件：c86・c93・c99・c116・c175・c195・c198・c223・c273・c276・c279）。35字以上は0件。
//   c86 は真壁、元の後続は c87。「まあ高峰研は大丈夫だろうね。」（14字）で分割。
//   c93 は真壁、元の後続は c94。「ああ、今年から厳しくなってね。」（15字）で分割。
//   c99 は小野寺、元の後続は c100。「せ、先輩！　私も今夜は残ります、」（16字）で分割。
//   c116 は悠太、元の後続は c117。「忘れ物を取りに。……嘘です、」（14字）で分割。
//   c175 は小野寺、元の後続は c176。「せ、先輩、すごい……本当に、すごいです、」（20字）で分割。
//   c195 は小野寺、元の後続は c196。「か、教授ぅ……すみません、ありがとうございます、」（24字）で分割。
//   c198 は悠太、元の後続は c199。「俺も共犯です。助手として、」（13字）で分割。
//   c223 は高峰、元の後続は c224。「助成金の継続が決まったそうだ。」（15字）で分割。
// 方式は qa/edit_rin35_c194_c209_c215_c04_c20_c66_c75_c77.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c308〜c315（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin34_c86_c93_c99_c116_c175_c195_c198_c223.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c86', 'c308', 14, 'まあ高峰研は大丈夫だろうね。', '完璧主義の凛さんがいるんだから、安心だ。'],
  ['rin', 'c93', 'c309', 15, 'ああ、今年から厳しくなってね。', '……君、いい目をしているね、助手くん。'],
  ['rin', 'c99', 'c310', 16, 'せ、先輩！　私も今夜は残ります、', '手伝いますぅ、本当です、帰りません！'],
  ['rin', 'c116', 'c311', 14, '忘れ物を取りに。……嘘です、', '手を貸しに来ました、本当のことを言うと。'],
  ['rin', 'c175', 'c312', 20, 'せ、先輩、すごい……本当に、すごいです、', '完璧です、感動しました……。'],
  ['rin', 'c195', 'c313', 24, 'か、教授ぅ……すみません、ありがとうございます、', '本当に、本当に……。'],
  ['rin', 'c198', 'c314', 13, '俺も共犯です。助手として、', '隣に立たせてください、凛さん、お願いです。'],
  ['rin', 'c223', 'c315', 15, '助成金の継続が決まったそうだ。', '私の研究も続くよ、凛くん、ありがとう。'],
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
console.log('OK: split c86->c308, c93->c309, c99->c310, c116->c311, c175->c312, c195->c313, c198->c314, c223->c315');
