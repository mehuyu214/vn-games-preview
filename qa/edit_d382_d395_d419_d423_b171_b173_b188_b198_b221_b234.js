// W2 優奈の同率最長台詞（d382／d395／d419／d423・20字）＋美咲の同率最長台詞（b171／b173／b188／b198／b221／b234・23字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d382_d395_d419_d423_b171_b173_b188_b198_b221_b234.js）：
// - 優奈 d382／d395／d419／d423 は20字で優奈の同率最長行（次点も20字の d428／d429／d453／d476）。
//   d382 は優奈（face=serious・char=true を後半へ継承）、元の jump=d57 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d395 は悠太、元の jump=d18 を後半へ引き継ぎ。「。」の後（7字）で分割。
//   d419 は優奈（face=sad・char=true を後半へ継承）、元の jump=d145b を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d423 は優奈（face=sad・char=true を後半へ継承）、元の jump=d196b を後半へ引き継ぎ。「。」の後（17字）で分割。
// - 美咲 b171／b173／b188／b198／b221／b234 は23字で美咲の同率最長行（次点も23字の b256／b288）。
//   b171 は美咲（face=sad を後半へ継承）、元の jump=b460 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   b173 は美咲（face=sad・char=true を後半へ継承）、元の jump=b375 を後半へ引き継ぎ。「……」の後（11字）で分割。
//   b188 は悠太、元の jump=b532 を後半へ引き継ぎ。「。」の後（13字）で分割。
//   b198 は美咲（face=serious・char=true を後半へ継承）、元の jump=b349 を後半へ引き継ぎ。「。」の後（11字）で分割。
//   b221 は相沢、元の jump=b526 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b234 は相沢、元の jump=b355 を後半へ引き継ぎ。「、」の後（17字）で分割。
// 方式は qa/edit_d355_d374_d376_d381_b167_b169.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d743〜d746（優奈）・b669〜b674（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d382_d395_d419_d423_b171_b173_b188_b198_b221_b234.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd382', 'd743', 6, '見つかれば、', 'あの本は捨てられてしまいます'],
  ['yuna', 'd395', 'd744', 7, '……手紙です。', '封がされたままの、古い手紙'],
  ['yuna', 'd419', 'd745', 8, '最後の頁の裏に、', 'そっと挟んでありました。'],
  ['yuna', 'd423', 'd746', 17, '恋の手紙、と言っていいと思います。', 'はい。'],
  ['misaki', 'b171', 'b669', 8, '最後の、雨……。', 'その日に、全部終わるんですね。'],
  ['misaki', 'b173', 'b670', 11, '返す前に、一度だけ……', '開けてみよう、この傘を。'],
  ['misaki', 'b188', 'b671', 13, '（顔向けできなかったのか。', 'だから友人、とだけ。'],
  ['misaki', 'b198', 'b672', 11, 'そのまま……そうだね。', 'そのままが、誠実だよね。'],
  ['misaki', 'b221', 'b673', 5, '『あの日、', '傘と温かい飲み物をありがとう』……。'],
  ['misaki', 'b234', 'b674', 17, '雨の日に、誰かを待つためではなく、', '使う傘です。'],
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
console.log('OK: split d382->d743, d395->d744, d419->d745, d423->d746, b171->b669, b173->b670, b188->b671, b198->b672, b221->b673, b234->b674');
