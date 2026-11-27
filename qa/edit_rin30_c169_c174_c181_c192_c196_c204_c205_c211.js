// W2 凛の30字行 c169／c174／c181／c192／c196／c204／c205／c211 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin30_c169_c174_c181_c192_c196_c204_c205_c211.js）：
// - 凛の最長は30字（22件）、桜の最長は28字、美咲12字、優奈12字、セレナ25字（e14）。
//   c169 は悠太、元の後続は c170。「最終電車じゃないんですね、」（13字）で分割。
//   c174 は真壁、元の後続は c175。「見事だね。数値が生きてる。」（13字）で分割。
//   c181 は小野寺、元の後続は c182。「ち、違います！！　それは、」（13字）で分割。
//   c192 は高峰、元の後続は c193。「生データの余白の字、私の字だろう、」（17字）で分割。
//   c196 は悠太、元の後続は c197。「（負けじゃない。凛さん、これは勝ちだ、」（19字）で分割。
//   c204 は真壁、元の後続は c205。「記録は完璧だ。……」（9字）で分割。
//   c205 は凛、元の後続は c206。「悠太、ありがとう。」（9字）で分割。
//   c211 は凛、元の後続は c212。「分かってる。明日、終わったら話がある。」（19字）で分割。
// 方式は qa/edit_rin30_c136_c140_c147_c152_c153_c155_c157_c163.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c459〜c466（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin30_c169_c174_c181_c192_c196_c204_c205_c211.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c169', 'c459', 13, '最終電車じゃないんですね、', '今日のカウントダウンは、なるほど。'],
  ['rin', 'c174', 'c460', 13, '見事だね。数値が生きてる。', '文句のつけようがない発表だったよ。'],
  ['rin', 'c181', 'c461', 13, 'ち、違います！！　それは、', '私の、私のミスなんです、本当です！'],
  ['rin', 'c192', 'c462', 17, '生データの余白の字、私の字だろう、', 'はは、そうだろう、凛くん。'],
  ['rin', 'c196', 'c463', 19, '（負けじゃない。凛さん、これは勝ちだ、', '俺たちの立派な勝ちだ）'],
  ['rin', 'c204', 'c464', 9, '記録は完璧だ。……', '文句なし、合格だよ、助手くん、見事だった。'],
  ['rin', 'c205', 'c465', 9, '悠太、ありがとう。', '……でも、今のは少し、遠かったわ、私には。'],
  ['rin', 'c211', 'c466', 19, '分かってる。明日、終わったら話がある。', '私からも、ね、約束よ。'],
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
console.log('OK: split c169->c459, c174->c460, c181->c461, c192->c462, c196->c463, c204->c464, c205->c465, c211->c466');
