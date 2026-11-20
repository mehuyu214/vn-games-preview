// W2 優奈の同率最長台詞（d134／d134c／d154／d156／d168・23字）＋美咲の同率最長台詞（b58／b101／b116／b147／b156／b176／b207・27字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d134_d134c_d154_d156_d168_b58_b101_b116_b147_b156_b176_b207.js）：
// - 優奈 d134／d134c／d154／d156／d168 は23字で優奈の同率最長行（d176／d182b／d200 も23字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   d134 は園田、元の jump=d385 を後半へ引き継ぎ。1つ目の「。」の後（8字）で分割。
//   d134c は園田、元の jump=d418 を後半へ引き継ぎ。1つ目の「。」の後（5字）で分割。
//   d154 は悠太（地の文）、jump なし（後続は d155 逐次）。「が、」の読点の後（10字）で分割。
//   d156 は白鳥、元の jump=d373 を後半へ引き継ぎ。「よ、」の読点の後（18字）で分割。
//   d168 は優奈（face=sad・char=true を後半へ継承）、元の jump=d331 を後半へ引き継ぎ。「何度も」の後（11字）で分割。
// - 美咲 b58／b101／b116／b147／b156／b176／b207 は27字で美咲の同率最長行（b208 も27字で同率だが本ランは前ラン次回候補の7行のみ対象）。
//   b58 は美咲（face=sad を後半へ継承）、元の jump=b447 を後半へ引き継ぎ。2つ目の「。」の後（11字）で分割。
//   b101 は藤井、jump なし（後続は b102 逐次）。1つ目の「。」の後（16字）で分割。
//   b116 は悠太、元の jump=b370 を後半へ引き継ぎ。1つ目の「。」の後（11字）で分割。
//   b147 は店長、jump なし（後続は b148 逐次）。1つ目の「。」の後（13字）で分割。
//   b156 は店長、jump なし（後続は b157 逐次）。2つ目の「。」の後（15字）で分割。
//   b176 は悠太、元の jump=b348 を後半へ引き継ぎ。「？」の後（12字）で分割。
//   b207 は美咲（face=sad を後半へ継承）、元の jump=b350 を後半へ引き継ぎ。2つ目の「。」の後（14字）で分割。
// 方式は qa/edit_d112_d120_d121b_b56.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d629〜d633（優奈）・b555〜b561（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d134_d134c_d154_d156_d168_b58_b101_b116_b147_b156_b176_b207.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd134', 'd629', 8, 'おお、司書さん。', '昔話かい、いいよ、座りなさい。'],
  ['yuna', 'd134c', 'd630', 5, '詩集だよ。', '若い娘さんが勧めてくれた、詩集一冊。'],
  ['yuna', 'd154', 'd631', 10, '（『閉館ですよ』が、', '館長に跳ね返ってしまった）'],
  ['yuna', 'd156', 'd632', 18, '残りの半分は、貴方が持っていますよ、', '優奈さん。'],
  ['yuna', 'd168', 'd633', 11, '祖母は、この本を何度も', '直そうとしたと思います。'],
  ['misaki', 'b58', 'b555', 11, '……はい。預かります。', '……今度こそ、ちゃんと返します。'],
  ['misaki', 'b101', 'b556', 16, '『彼女に、よく似ている』ってさ。', '……彼女、って誰のこと'],
  ['misaki', 'b116', 'b557', 11, '台帳、埃だらけですね。', '棚卸しの後で見ましょう、二人で。'],
  ['misaki', 'b147', 'b558', 13, '言うと、待てなくなるだろ。', '人はさ、答えを知ると急ぐから'],
  ['misaki', 'b156', 'b559', 15, '連絡先は、知らないよ。本当に。', '来るかどうかも、彼次第さ'],
  ['misaki', 'b176', 'b560', 12, '中から、何か……細い筒？', '　防水のケースみたいなものが。'],
  ['misaki', 'b207', 'b561', 14, '悠太くん。……ありがとうね。', 'ここまで一緒にいてくれて。'],
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
console.log('OK: split d134->d629, d134c->d630, d154->d631, d156->d632, d168->d633, b58->b555, b101->b556, b116->b557, b147->b558, b156->b559, b176->b560, b207->b561');
