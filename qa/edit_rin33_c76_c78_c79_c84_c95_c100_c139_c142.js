// W2 凛の33字行 c76／c78／c79／c84／c95／c100／c139／c142 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin33_c76_c78_c79_c84_c95_c100_c139_c142.js）：
// - 凛の台詞の最長は33字（16件：c76・c78・c79・c84・c95・c100・c139・c142・c165・c182・c216・c272・c274・c275・c280・c281）。34字以上は0件。
//   c76 は悠太、元の後続は c77。「凛さんは発表の仕上げですよ。」（14字）で分割。
//   c78 は悠太、元の後続は c79。「昼に言われても困ります、」（12字）で分割。
//   c79 は小野寺、元の後続は c80。「せ、先輩！　お弁当、」（10字）で分割。
//   c84 は真壁、元の後続は c85。「学会の事前照合が始まるそうだよ。」（16字）で分割。
//   c95 は真壁、元の jump は c98。「凛さんをよろしく頼むよ、助手くん。」（17字）で分割。
//   c100 は凛、元の後続は c101。「小野寺は帰るの。命令よ。」（12字）で分割。
//   c139 は小野寺、元の後続は c140。「しょ、照合……生データの、」（13字）で分割。
//   c142 は凛、元の後続は c143。「再実験は9割まで来たわ。」（12字）で分割。
// 方式は qa/edit_rin33_c06_c17_c25_c36_c44_c45_c54_c60.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c327〜c334（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin33_c76_c78_c79_c84_c95_c100_c139_c142.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c76', 'c327', 14, '凛さんは発表の仕上げですよ。', '心配しすぎです、小野寺さん、ほんとに。'],
  ['rin', 'c78', 'c328', 12, '昼に言われても困ります、', 'そのカウントダウンは、凛さん、早すぎます。'],
  ['rin', 'c79', 'c329', 10, 'せ、先輩！　お弁当、', '余分に買ってきました、どうぞ、食べてください！'],
  ['rin', 'c84', 'c330', 16, '学会の事前照合が始まるそうだよ。', '生データの提出も求められるらしい。'],
  ['rin', 'c95', 'c331', 17, '凛さんをよろしく頼むよ、助手くん。', '本気で頼む、彼女は大事な人材だ。'],
  ['rin', 'c100', 'c332', 12, '小野寺は帰るの。命令よ。', '明日の朝、元気に来なさい、いいね、約束よ。'],
  ['rin', 'c139', 'c333', 13, 'しょ、照合……生データの、', '提出……ですか、本当に、そんな急に……。'],
  ['rin', 'c142', 'c334', 12, '再実験は9割まで来たわ。', '提出は訂正版でいく、それだけよ、決めたの。'],
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
console.log('OK: split c76->c327, c78->c328, c79->c329, c84->c330, c95->c331, c100->c332, c139->c333, c142->c334');
