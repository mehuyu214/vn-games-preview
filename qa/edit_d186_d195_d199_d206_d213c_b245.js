// W2 優奈の同率最長台詞（d186／d195／d199／d206／d213c・24字）＋美咲の次点最長台詞（b245・29字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d186_d195_d199_d206_d213c_b245.js）：
// - 優奈 d186／d195／d199／d206／d213c は24字で優奈の同率最長行（d228／d278／d327 も24字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   d186 は園田、元の jump=d422 を後半へ引き継ぎ。1つ目の「。」の後（16字）で分割。
//   d195 は悠太、元の jump=d361 を後半へ引き継ぎ。1つ目の「。」の後（10字）で分割。
//   d199 は榊、元の jump=d424 を後半へ引き継ぎ。1つ目の「。」の後（13字）で分割。
//   d206 は悠太、元の jump=d353 を後半へ引き継ぎ。1つ目の「。」の後（11字）で分割。
//   d213c は優奈（face=serious・char=true を後半へ継承）、元の jump=d459 を後半へ引き継ぎ。1つ目の「。」の後（14字）で分割。
// - 美咲 b245 は29字で美咲の次点最長行（次点は28字多数）。
//   b245 は美咲（face=sad・char=true を後半へ継承）、元の jump=b385 を後半へ引き継ぎ。「。」は文頭の「相沢さん。」（5字）のみのため「あの、」の読点で分割（8字）。
// 方式は qa/edit_d173_d176c_d184b_b04_b69_b80.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d610〜d614（優奈）・b538（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d186_d195_d199_d206_d213c_b245.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd186', 'd610', 16, 'わしはね、後悔はしていないんだ。', '若い日々にはね。'],
  ['yuna', 'd195', 'd611', 10, '榊さん、落ち着いて。', '理由があるんです、ちゃんと。'],
  ['yuna', 'd199', 'd612', 13, '暴きたいんじゃないんです。', '届けたいんです、僕は。'],
  ['yuna', 'd206', 'd613', 11, '園田さんはいつもの席。', '自然に渡すのが一番ですね。'],
  ['yuna', 'd213c', 'd614', 14, 'お渡ししたい、本があります。', '受け取ってください。'],
  ['misaki', 'b245', 'b538', 8, '相沢さん。あの、', 'その……言わなきゃいけないことがあって……'],
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
console.log('OK: split d186->d610, d195->d611, d199->d612, d206->d613, d213c->d614, b245->b538');
