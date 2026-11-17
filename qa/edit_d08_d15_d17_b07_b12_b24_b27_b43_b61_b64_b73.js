// W2 優奈の次点最長台詞（d08／d15／d17・40字）＋美咲の次点最長台詞（b07／b12／b24／b27／b43／b61／b64／b73・38字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d08_d15_d17_b07_b12_b24_b27_b43_b61_b64_b73.js）：
// - 優奈 d08／d15／d17 は40字で優奈の次点最長行（d32／d53／d55／d58／d71b も40字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d08・d15・d17 はいずれも悠太。美咲 b07／b12／b24／b27／b43／b61／b64／b73 は38字で美咲の次点最長行。
//   b12 は美咲（face=confused）、b64 は美咲（face=sad・char=true）、b73 は美咲（face=smile・char=true）。
// 方式は qa/edit_d200_d202_d221c_d231_d278.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d393〜d395（優奈）・b306〜b313（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d08_d15_d17_b07_b12_b24_b27_b43_b61_b64_b73.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd08', 'd393', 19, '（開始に判子が要る図書館、初めて見た。', '……いや、うちの館長らしいと言えばらしい）'],
  ['yuna', 'd15', 'd394', 24, '台帳にも蔵書目録にも、この本の記録が無いんです。', '番号も、ラベルも、何もありません'],
  ['yuna', 'd17', 'd395', 20, 'カードの代わりに、これが挟まってました。', '……手紙です。封がされたままの、古い手紙'],
  ['misaki', 'b07', 'b306', 28, '理屈は立派なんですけど、目が完全に笑ってますよ美咲さん。', '供養の顔じゃないです'],
  ['misaki', 'b12', 'b307', 19, '店長。長いレシート、頭についてますよ。', '……王冠みたいに。ジャラジャラしてます'],
  ['misaki', 'b24', 'b308', 14, 'え、ちょっと、美咲さん！？　', 'お客さん、まだ話の途中……行っちゃったよ、本当に'],
  ['misaki', 'b27', 'b309', 25, 'いえ、あの、うちの先輩、普段はあんなじゃなくて……', '本当に、普段はしっかり者で'],
  ['misaki', 'b43', 'b310', 11, '美咲さんは五年目です。', '雨の日は、必ず出勤してますね。休んだのを見たことがない'],
  ['misaki', 'b61', 'b311', 16, '店長、今の人、知ってるんですか。', '教えてくださいよ。『来たんだねえ』って何です'],
  ['misaki', 'b64', 'b312', 18, '……悠太くん。今夜のことは、内緒ね。', '誰にも言わないで。店長にも、藤井さんにも'],
  ['misaki', 'b73', 'b313', 17, '悠太くん。廃棄、今日は二つあるよ。', '一つは悠太くんの分。今日はおにぎりも余った'],
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
console.log('OK: split d08->d393, d15->d394, d17->d395, b07->b306, b12->b307, b24->b308, b27->b309, b43->b310, b61->b311, b64->b312, b73->b313');
