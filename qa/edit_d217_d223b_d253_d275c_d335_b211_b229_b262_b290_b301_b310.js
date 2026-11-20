// W2 優奈の同率最長台詞（d217／d223b／d253／d275c／d335・23字）＋美咲の同率最長台詞（b211／b229／b262／b290／b301／b310・27字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d217_d223b_d253_d275c_d335_b211_b229_b262_b290_b301_b310.js）：
// - 優奈 d217／d223b／d253／d275c／d335 は23字で優奈の同率最長行（d342／d352／d358 も23字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   d217 は優奈（face=serious・char=true を後半へ継承）、元の jump=d378 を後半へ引き継ぎ。1つ目の「。」の後（13字）で分割。
//   d223b は園田、元の jump=d409 を後半へ引き継ぎ。「待てば、」の読点の後（10字）で分割。
//   d253 は優奈（face=love・char=true を後半へ継承）、元の jump=d512 を後半へ引き継ぎ。1つ目の「。」の後（8字）で分割。
//   d275c は優奈（face=smile・char=true を後半へ継承）、元の jump=d413 を後半へ引き継ぎ。1つ目の「。」の後（15字）で分割。
//   d335 は園田、元の jump=d76 を後半へ引き継ぎ。1つ目の「。」の後（5字）で分割。
// - 美咲 b211／b229／b262／b290／b301／b310 は27字で美咲の同率最長行（次点は26字の b19／b32）。
//   b211 は美咲（face=serious・char=true を後半へ継承）、元の jump=b352 を後半へ引き継ぎ。2つ目の「。」の後（17字）で分割。
//   b229 は美咲（face=smile を後半へ継承）、jump なし・後続 b230 へ。1つ目の「。」の後（13字）で分割。
//   b262 は美咲（face=shy・char=true を後半へ継承）、元の jump=b386 を後半へ引き継ぎ。3つ目の「。」の後（18字）で分割。
//   b290 は美咲（face=smile を後半へ継承）、jump なし・後続 b291 へ。「だって。」の後（21字）で分割。
//   b301 は美咲（face=sad を後半へ継承）、元の jump=b78 を後半へ引き継ぎ。1つ目の「。」の後（13字）で分割。
//   b310 は悠太、元の jump=b44 を後半へ引き継ぎ。1つ目の「。」の後（15字）で分割。
// 方式は qa/edit_d176_d182b_d200_b208.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d637〜d641（優奈）・b563〜b568（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d217_d223b_d253_d275c_d335_b211_b229_b262_b290_b301_b310.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd217', 'd637', 13, '中に、手紙が入っています。', '開けてみてください。'],
  ['yuna', 'd223b', 'd638', 10, 'ここに座って待てば、', 'いつか会えるから、ってね。'],
  ['yuna', 'd253', 'd639', 8, 'ねえ、悠太さん。', 'もう少し、近くに来てください。'],
  ['yuna', 'd275c', 'd640', 15, '隣にいてくれて、助かりました。', 'それは本当です。'],
  ['yuna', 'd335', 'd641', 5, '若い頃さ。', '勧められるままに、詩集なんか読んでね'],
  ['misaki', 'b211', 'b563', 17, '相沢さん。……傘、持ってきました。', '今日こそ、返します。'],
  ['misaki', 'b229', 'b564', 13, '『傘を貸せる人間であれ』。', '知ってます、父の字で見ました'],
  ['misaki', 'b262', 'b565', 18, '悠太くん。さっきの、続き。聞かせて。', 'ここなら静かだよ。'],
  ['misaki', 'b290', 'b566', 21, '『雨の日は、傘を貸せる人間であれ』だって。', '元気そうだよ'],
  ['misaki', 'b301', 'b567', 13, '……まあ、そんなものかな。', '期待したわたしが、馬鹿みたい'],
  ['misaki', 'b310', 'b568', 15, '雨の日は、必ず出勤してますね。', '休んだのを見たことがない'],
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
console.log('OK: split d217->d637, d223b->d638, d253->d639, d275c->d640, d335->d641, b211->b563, b229->b564, b262->b565, b290->b566, b301->b567, b310->b568');
