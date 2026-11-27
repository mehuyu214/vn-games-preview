// W2 凛の29字行 c09／c14／c23／c35／c53／c56／c63／c65 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin29_c09_c14_c23_c35_c53_c56_c63_c65.js）：
// - 凛の最長は29字（28件）、桜の最長は27字（4件：a71・a188・a223・a243）、美咲12字、優奈12字、セレナ25字（e14）。
//   c09 は悠太、元の後続は c10。「（小野寺さん、今日も謝罪の回転」（15字）で分割。
//   c14 は凛、元の後続は c15。「悠太、お願いがある。」（10字）で分割。
//   c23 は悠太、元の jump は c32。「数値じゃないですよ、それは。」（14字）で分割。
//   c35 は悠太、元の後続は c36。「あの小野寺さんが。……」（11字）で分割。
//   c53 は凛、元の後続は c54。「……再現性の高い、いい返事ね。」（15字）で分割。
//   c56 は悠太、元の後続は c57。「じゃあ、なんでそんな寂しそうな」（15字）で分割。
//   c63 は高峰、元の後続は c64。「やあ、みんな。いい顔で徹夜」（13字）で分割。
//   c65 は高峰、元の後続は c66。「ほう。誤差ゼロで進んでいるのかい」（16字）で分割。
// 方式は qa/edit_sakura28_a33_a83_a193_a272.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c481〜c488（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin29_c09_c14_c23_c35_c53_c56_c63_c65.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c09', 'c481', 15, '（小野寺さん、今日も謝罪の回転', '数だけは異常に高いんだよな）'],
  ['rin', 'c14', 'c482', 10, '悠太、お願いがある。', 'あのフォルダ、今すぐ消してちょうだい。'],
  ['rin', 'c23', 'c483', 14, '数値じゃないですよ、それは。', 'さすがに無理があると思います。'],
  ['rin', 'c35', 'c484', 11, 'あの小野寺さんが。……', '締切前のパニックで、列ごと、ですか。'],
  ['rin', 'c53', 'c485', 15, '……再現性の高い、いい返事ね。', 'ありがとう、悠太、心強いわ。'],
  ['rin', 'c56', 'c486', 15, 'じゃあ、なんでそんな寂しそうな', '顔をするんですか、凛さんは。'],
  ['rin', 'c63', 'c487', 13, 'やあ、みんな。いい顔で徹夜', 'したみたいだね、はは、若いねえ。'],
  ['rin', 'c65', 'c488', 16, 'ほう。誤差ゼロで進んでいるのかい', '、凛くん、本当にゼロでね。'],
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
console.log('OK: split c09->c481, c14->c482, c23->c483, c35->c484, c53->c485, c56->c486, c63->c487, c65->c488');
