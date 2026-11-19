// W2 優奈の次点最長台詞（d170・29字）＋美咲の次点最長台詞（b218／b226／b232／b267・34字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d170_b218_b226_b232_b267.js）：
// - 優奈 d170 は29字で優奈の同率最長行（次点は28字多数）。
//   d170 は優奈（face=sad・char=true を後半へ継承）、元の jump=d343 を後半へ引き継ぎ。1つ目の「。」の後で分割。
// - 美咲 b218／b226／b232／b267 は34字で美咲の同率最長行（b269／b270／b283／b289 も34字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b218 は美咲（face=serious・char=true を後半へ継承）、後続は b219。2つ目の「。」の後で分割（文末に「。」なし）。
//   b226 は相沢、後続は b227。1つ目の「。」の後で分割（文末に「。」なし）。
//   b232 は相沢、後続は b233。1つ目の「。」の後で分割（文末に「。」なし。2つ目の「。」で切ると後半が6字と短いため）。
//   b267 は悠太、後続は b268。2つ目の「。」の後で分割（文末に「。」なし）。
// 方式は qa/edit_d76b_d135c_d155c_b183_b194_b203_b205.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d542（優奈）・b466〜b469（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d170_b218_b226_b232_b267.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd170', 'd542', 10, 'わたしも同じでした。', '直している間は、渡さなくて済むんです。'],
  ['misaki', 'b218', 'b466', 19, '相沢さん。まず、これを読んでください。', '私の手紙です。昨夜、書きました'],
  ['misaki', 'b226', 'b467', 25, '顔向けできず、傘だけでも返そう、と……卑怯でした。', '本当に、申し訳ない'],
  ['misaki', 'b232', 'b468', 13, '代わりに、私の傘をどうぞ。', '新しい傘です、今日買いました。一番いいのを'],
  ['misaki', 'b267', 'b469', 22, '俺で、いいんですか。……俺で、いいんですね。', '本当に、俺でいいんですか'],
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
  secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split d170->d542, b218->b466, b226->b467, b232->b468, b267->b469');
