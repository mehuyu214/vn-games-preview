// W2 優奈の次点最長台詞（d16／d28／d34・38字）＋美咲の同率最長台詞（b139／b140／b145／b152／b153／b163・37字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d16_d28_d34_b139_b140_b145_b152_b153_b163.js）：
// - 優奈 d16／d28／d34 は38字で優奈の次点最長行（d105／d119／d150／d157／d172 も38字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d16 は優奈（face=serious・char=true）、後続は d17。「？」直後の全角スペースは b49／b160 と同じく後半へ。
//   d28 は優奈（face=sad・char=true）、後続は d29。d34 は悠太、後続は d35。
// - 美咲 b139／b140／b145／b152／b153／b163 は37字で美咲の同率最長行（b167／b174 も37字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   b139 は店長、後続は b140。b140 は美咲（face=sad）、後続は b141。b145 は店長、後続は b146。
//   b152 は店長、後続は b153。b153 は美咲（face=sad）、後続は b154。b163 は悠太、後続は b164。
// 方式は qa/edit_d186_d196_d199_d216_d225b_b113_b114.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d427〜d429（優奈）・b340〜b345（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d16_d28_d34_b139_b140_b145_b152_b153_b163.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd16', 'd427', 16, '貸出カードは、入っていましたか？', '　本の奥のポケットに。……確認、してください'],
  ['yuna', 'd28', 'd428', 18, '……ごめんなさい。でも、お願いです。', '返してください。わたしを、信じてください'],
  ['yuna', 'd34', 'd429', 18, '言えない理由がある、ってことですね。', 'それは分かりました。無理に聞きはしません'],
  ['misaki', 'b139', 'b340', 26, 'まあ、なんとかなるっしょ。……なんとか、しないとね。', 'おれの代で終わらせない'],
  ['misaki', 'b140', 'b341', 18, '……店長。台帳の備考、知ってますか。', '『大島に引き継ぐ』。あれ、店長ですよね'],
  ['misaki', 'b145', 'b342', 20, '美咲ちゃんの雨シフトは、おれが組んでた。', '毎回ね、ずっと。雨の日は必ず彼女で'],
  ['misaki', 'b152', 'b343', 25, 'そう。『まあ、なんとかなるっしょ』って、笑ってた。', '根拠もなく、確信を持って'],
  ['misaki', 'b153', 'b344', 17, '……店長。ありがとう、ございます。', '五年、守ってくれて。シフトも、傘も、全部'],
  ['misaki', 'b163', 'b345', 24, '耳寄り、って。藤井さんの情報はいつも半分噂で……', '残り半分は本当なんですけど'],
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
console.log('OK: split d16->d427, d28->d428, d34->d429, b139->b340, b140->b341, b145->b342, b152->b343, b153->b344, b163->b345');
