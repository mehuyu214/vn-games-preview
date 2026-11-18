// W2 優奈の同率最長台詞（d176／d176c／d193・38字）＋美咲の同率最長台詞（b176／b198／b207／b210／b211／b222・37字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d176_d176c_d193_b176_b198_b207_b210_b211_b222.js）：
// - 優奈 d176／d176c／d193 は38字で優奈の同率最長行（d207／d228／d232／d240b／d241 も38字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d176 は優奈（face=serious・char=true）、後続は d176b。d176c は優奈（face=serious・char=true）、後続は d177。
//   d193 は優奈（face=serious・char=true）、後続は d193b。省略記号「……」は U+2026×2 を文字インデックスで確認済み。
// - 美咲 b176／b198／b207／b210／b211／b222 は37字で美咲の同率最長行（b223／b234 も37字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   b176 は悠太（地の文）、後続は b177。b198 は美咲（face=serious・char=true）、後続は b199。
//   b207 は美咲（face=sad）、後続は b208。b210 は相沢、後続は b211。b211 は美咲（face=serious・char=true）、後続は b212。
//   b222 は美咲（face=sad）、後続は b223。b210 の後続 b211 は本ランで分割対象だが、処理順（b210→b211）により b210 の後半は元の b211 へ jump する。
// 方式は qa/edit_d105_d119_d150_d157_d172_b167_b174.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d435〜d437（優奈）・b348〜b353（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d176_d176c_d193_b176_b198_b207_b210_b211_b222.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd176', 'd435', 23, '……ふふ、ありがとう。半世紀の本に、今日の栞。', '新しい物語が、挟まりましたね。'],
  ['yuna', 'd176c', 'd436', 24, '悠太さん。明日、隣にいてください。お願いします。', '一人では、きっと足が震えます'],
  ['yuna', 'd193', 'd437', 22, '榊さん、少しお話ができますか。大事な話です。', '昨日は、失礼なことを言いました。'],
  ['misaki', 'b176', 'b348', 27, '中から、何か……細い筒？　防水のケースみたいなものが。', '誰かが隠したみたいに'],
  ['misaki', 'b198', 'b349', 23, 'そのまま……そうだね。そのままが、誠実だよね。', '飾らないのが、父の傘らしくて'],
  ['misaki', 'b207', 'b350', 27, '悠太くん。……ありがとうね。ここまで一緒にいてくれて。', '台帳も、手紙も、全部'],
  ['misaki', 'b210', 'b351', 25, '……今夜が、最後の雨だそうですね。来て、よかった。', '……間に合って、よかった'],
  ['misaki', 'b211', 'b352', 27, '相沢さん。……傘、持ってきました。今日こそ、返します。', 'ずっと預かってた傘を'],
  ['misaki', 'b222', 'b353', 28, 'あの傘が、お父さんの物だって知りました。柄の中の写真で。', '全部、分かりました'],
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
console.log('OK: split d176->d435, d176c->d436, d193->d437, b176->b348, b198->b349, b207->b350, b210->b351, b211->b352, b222->b353');
