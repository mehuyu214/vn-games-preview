// W2 凛の32字行 c05／c08／c12／c15／c21／c27／c31／c37 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin32_c05_c08_c12_c15_c21_c27_c31_c37.js）：
// - 凛の台詞の最長は32字（45件：c05・c08・c12・c15・c21・c27・c31・c37・c39・c41・c48・c51・c64・c72・c82・c83・c85・c87・c96・c105・c109・c117・c118・c122・c128・c144・c150・c151・c161・c162・c168・c177・c189・c190・c191・c199・c200・c203・c241・c243・c257・c278・c282・c283・c288）。33字以上は0件。桜の台詞31字以上は0件。
//   c05 は悠太、元の後続は c06。「はい、8割終わりました。」（12字）で分割。
//   c08 は凛、元の後続は c09。「声が大きいわ、小野寺。」（11字）で分割。
//   c12 は凛、元の後続は c13。「見せて。……本当ね、全部ずれてる。」（17字）で分割。
//   c15 は悠太、元の後続は c16。「え。……今、何て言いました、凛さん。」（18字）で分割。
//   c21 は凛、元の後続は c22。「いいの。……ありがとう、悠太。」（15字）で分割。
//   c27 は凛、元の後続は c28。「悠太。助手の分際で、」（10字）で分割。
//   c31 は凛、元の jump は c32。「分かった、全部話す。」（10字）で分割。
//   c37 は凛、元の後続は c38。「私が見つけたのは三日前。」（12字）で分割。
// 方式は qa/edit_rin33_c165_c182_c216_c272_c274_c275_c280_c281.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c343〜c350（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin32_c05_c08_c12_c15_c21_c27_c31_c37.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c05', 'c343', 12, 'はい、8割終わりました。', '凛さんの指示が正確なんで、助かってます。'],
  ['rin', 'c08', 'c344', 11, '声が大きいわ、小野寺。', 'n数と同じだけ、静かにしてくれると助かる。'],
  ['rin', 'c12', 'c345', 17, '見せて。……本当ね、全部ずれてる。', 'どういうことなの、これは一体。'],
  ['rin', 'c15', 'c346', 18, 'え。……今、何て言いました、凛さん。', '聞き間違いですよね、きっと。'],
  ['rin', 'c21', 'c347', 15, 'いいの。……ありがとう、悠太。', '本当に助かったわ、心から感謝する。'],
  ['rin', 'c27', 'c348', 10, '悠太。助手の分際で、', '誰に口をきいているか分かっているの、あなた。'],
  ['rin', 'c31', 'c349', 10, '分かった、全部話す。', '椅子に座って、悠太。長くなるわよ、覚悟して。'],
  ['rin', 'c37', 'c350', 12, '私が見つけたのは三日前。', 'それから毎晩、一人で再実験を続けてるの。'],
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
console.log('OK: split c05->c343, c08->c344, c12->c345, c15->c346, c21->c347, c27->c348, c31->c349, c37->c350');
