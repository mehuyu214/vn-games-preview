// W2 凛の33字行 c06／c17／c25／c36／c44／c45／c54／c60 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin33_c06_c17_c25_c36_c44_c45_c54_c60.js）：
// - 凛の台詞の最長は33字（24件：c06・c17・c25・c36・c44・c45・c54・c60・c76・c78・c79・c84・c95・c100・c139・c142・c165・c182・c216・c272・c274・c275・c280・c281）。34字以上は0件。
//   c06 は凛、元の後続は c07。「お世辞はデータじゃないわ。」（13字）で分割。
//   c17 は悠太、元の後続は c18。「（短い。短すぎる。」（9字）で分割。
//   c25 は凛、元の後続は c26。「理由は言えない。」（8字）で分割。
//   c36 は悠太、元の後続は c37。「知らせたら、あの人は確実に崩れますね」（18字）で分割。
//   c44 は小野寺、元の後続は c45。「あ、あの……お茶を淹れました」（14字）で分割。
//   c45 は凛、元の後続は c46。「小野寺、あなたはもう帰りなさい。」（16字）で分割。
//   c54 は悠太、元の後続は c55。「今夜は帰ります。」（8字）で分割。
//   c60 は凛、元の後続は c61。「悠太、帰るなら早くしなさい。」（14字）で分割。
// 方式は qa/edit_sakura31_a222_a257_a263_a273_a286_a301.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c319〜c326（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin33_c06_c17_c25_c36_c44_c45_c54_c60.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c06', 'c319', 13, 'お世辞はデータじゃないわ。', '誤差ゼロで終わらせて、頼んだわよ、悠太。'],
  ['rin', 'c17', 'c320', 9, '（短い。短すぎる。', 'この人に、何か起きてる。絶対に、ただ事じゃない）'],
  ['rin', 'c25', 'c321', 8, '理由は言えない。', '……言えるはず、ないでしょう、こんな情けないこと。'],
  ['rin', 'c36', 'c322', 18, '知らせたら、あの人は確実に崩れますね', '……間違いなく、立ち直れない。'],
  ['rin', 'c44', 'c323', 14, 'あ、あの……お茶を淹れました', '、よかったらどうぞ、温かいうちに……。'],
  ['rin', 'c45', 'c324', 16, '小野寺、あなたはもう帰りなさい。', '最終電車まであと12分よ、急いで。'],
  ['rin', 'c54', 'c325', 8, '今夜は帰ります。', '……明日、ちゃんと考えますから、凛さん、待ってて。'],
  ['rin', 'c60', 'c326', 14, '悠太、帰るなら早くしなさい。', '明日の集合は8時ちょうどよ、遅れるな。'],
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
console.log('OK: split c06->c319, c17->c320, c25->c321, c36->c322, c44->c323, c45->c324, c54->c325, c60->c326');
