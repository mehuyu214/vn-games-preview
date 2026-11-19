// W2 優奈の次点最長台詞（d174／d230／d269・34字）＋美咲の同率最長台詞（b128／b132・35字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d174_d230_d269_b128_b132.js）：
// - 優奈 d174／d230／d269 は34字で優奈の同率最長行（次点 d277:34字）。
//   d174 は優奈（face=surprise・char=true を後半へ継承）、後続は d175。2つ目の「。」の後で分割（文末に「。」なし）。
//   d230 は白鳥、後続は d231。2つ目の「。」の後で分割（文末に「。」なし）。
//   d269 は悠太、後続は d270。1つ目の「。」の後で分割（文末に「。」なし）。
// - 美咲 b128／b132 は35字で美咲の同率最長行（b135／b141／b150／b151／b161／b164 も35字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   b128 は美咲（face=smile を後半へ継承）、後続は b129。1つ目の「。」の後で分割（文末に「。」なし）。
//   b132 は美咲（face=confused・char=true を後半へ継承）、後続は b133。1つ目の「。」の後で分割（文末に「。」なし）。
// 方式は qa/edit_d03_d78_d88_d104_d114_b99_b106_b107_b111_b125_b126.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d495〜d497（優奈）・b412〜b413（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d174_d230_d269_b128_b132.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd174', 'd495', 22, '栞、ですか。悠太さんが作ったんですか、これ。', '……端切れの革で、丁寧に'],
  ['yuna', 'd230', 'd496', 21, '判子つきの、とびきりです。お任せください。', '今日だけの、特別な判子です'],
  ['yuna', 'd269', 'd497', 21, 'はいはい、家族は例外でしょう、館長公認で。', '判子も、押してもらいました'],
  ['misaki', 'b128', 'b412', 21, 'この店の秘密は、雨の日にしか動かないから。', '……そんな気がするの、ずっと'],
  ['misaki', 'b132', 'b413', 23, '店長が改まる日は、ろくなことがないんですよね。', '今までの経験上、百発百中'],
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
console.log('OK: split d174->d495, d230->d496, d269->d497, b128->b412, b132->b413');
