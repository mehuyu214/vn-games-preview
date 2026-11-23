// W2 優奈の17字最長行（d352／d368）＋美咲の19字最長行（b605）の分割（文面不変・分割のみ）
// 実測（qa/measure_d352_d368_b605.js）：
// - 優奈 d352／d368 は17字で優奈の同率最長行（次点も17字の d383／d392／d407／d409／d413／d423）。
//   d352 は優奈、face=serious・char=true を後半へ継承、元の jump=d643 を後半へ引き継ぎ。「は」の後（11字）で分割。
//   d368 は優奈、face=serious・char=true を後半へ継承、元の jump=d45 を後半へ引き継ぎ。「、」の後（8字）で分割。
// - 美咲 b605 は19字で美咲の同率最長行（次点は18字の b17／b32／b64／b106／b110／b113／b120）。
//   b605 は藤井、元の jump=b318 を後半へ引き継ぎ。「、」の後（5字）で分割。
// 方式は qa/edit_d162_d176c_d188_d193c_d198_d213_b524_b545_b547_b554_b596.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d867〜d868（優奈）・b795（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d352_d368_b605.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd352', 'd867', 11, 'もう、直すだけの日々は', '終わりです。'],
  ['yuna', 'd368', 'd868', 8, '司書である前に、', '規則を守る人間です'],
  ['misaki', 'b605', 'b795', 5, '雨の日を、', '待ってるみたいだよ、あの人。'],
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
console.log('OK: split d352->d867, d368->d868, b605->b795');
