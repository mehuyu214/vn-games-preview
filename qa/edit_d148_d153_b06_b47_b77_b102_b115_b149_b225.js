// W2 優奈の同率最長台詞（d148／d153・41字）と美咲の最長台詞（b06／b47／b77／b102／b115／b149／b225・39字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d148_d153_b06_b47_b77_b102_b115_b149_b225.js）：
// - 優奈 d148／d153 は41字で優奈の最長行（d200／d202／d221c／d231／d278 も41字で同率だが本ランは前ラン次回候補の2行のみ対象）。
//   d148 は悠太、d153 は白鳥。
// - 美咲 b06／b47／b77／b102／b115／b149／b225 は39字で美咲の最長行（次点 b07:38字）。
//   b06 は美咲（face=smile）、b47 は悠太（jump=b48）、b77 は美咲（face=sad）、b102 は美咲、b115 は悠太（jump=b123）、b149 は店長、b225 は相沢。
// 方式は qa/edit_d11_d50_d56_d59_d128_d134.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d386・d387（優奈）、b299〜b305（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d148_d153_b06_b47_b77_b102_b115_b149_b225.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd148', 'd386', 26, '優奈さんが直してきたのは、本だけじゃない気がします。', '祖母の後悔も、一緒に直してきた'],
  ['yuna', 'd153', 'd387', 22, '閉館後のお茶は、格別です。判子も要りません。', '静かな図書館で飲む一杯は、格別なんです'],
  ['misaki', 'b06', 'b299', 13, '食べるのが一番の供養だよ。', '残すほうが、よっぽど罰当たりだもん。お弁当も本望だよ'],
  ['misaki', 'b47', 'b300', 22, '（雨の日だけ来る客。雨の日だけ出勤する先輩。', '……偶然か？　いや、出来すぎてる）'],
  ['misaki', 'b77', 'b301', 12, '……うん。来なかったね。', '……まあ、そんなものかな。期待したわたしが、馬鹿みたい'],
  ['misaki', 'b102', 'b302', 22, '……誰に、似ているって……わたしが、ですか。', '誰に。藤井さん、本当にそう言ったの'],
  ['misaki', 'b115', 'b303', 15, '大島って、店長の名前ですよね。', '……引き継ぐ、って何を。前の店主から、今の店長へ'],
  ['misaki', 'b149', 'b304', 26, '『まあ、なんとかなるっしょ』は、前の店主の口癖だよ。', 'おれのじゃないんだ、本当は'],
  ['misaki', 'b225', 'b305', 18, '……事故の日、私は彼の隣にいました。', '運転席に、私が。……彼を、助けられなかった'],
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
console.log('OK: split d148->d386, d153->d387, b06->b299, b47->b300, b77->b301, b102->b302, b115->b303, b149->b304, b225->b305');
