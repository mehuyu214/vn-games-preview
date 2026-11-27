// W2 凛の31字行 c170／c173／c176／c178／c183／c184／c185／c187 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin31_c170_c173_c176_c178_c183_c184_c185_c187.js）：
// - 凛の台詞の最長は31字（24件）。32字以上は0件。桜の最長は29字（9件）、美咲12字、優奈12字、セレナ25字（e14）。
//   c170 は凛、元の後続は c171。「送信、完了。……終わったわ、第一関門は、」（20字）で分割。
//   c173 は凛、元の後続は c174。「以上が訂正後の結果です。」（12字）で分割。
//   c176 は悠太、元の後続は c177。「（乗り切った。」（7字）で分割。
//   c178 は凛、元の後続は c179。「集計過程の転記ミスです。」（12字）で分割。
//   c183 は小野寺、元の後続は c184。「やめません！」（6字）で分割。
//   c184 は小野寺、元の後続は c185。「先輩はずっと庇ってくれて」（12字）で分割。
//   c185 は真壁、元の後続は c186。「……ほう。」（5字）で分割。
//   c187 は真壁、元の後続は c188。「全行程の記録……」（8字）で分割。
// 方式は qa/edit_rin31_c125_c131_c132_c135_c141_c148_c156_c158.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c412〜c419（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin31_c170_c173_c176_c178_c183_c184_c185_c187.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c170', 'c412', 20, '送信、完了。……終わったわ、第一関門は、', 'やっと、ここまで来た。'],
  ['rin', 'c173', 'c413', 12, '以上が訂正後の結果です。', 'ご質問はありますか、どうぞ、遠慮なく。'],
  ['rin', 'c176', 'c414', 7, '（乗り切った。', 'このまま終われば、全部終わるはずなんだ、きっと）'],
  ['rin', 'c178', 'c415', 12, '集計過程の転記ミスです。', '責任は、すべて私にあります、真壁先生。'],
  ['rin', 'c183', 'c416', 6, 'やめません！', '　貼り間違えたのは、私なんです、締切の夜に、私が！'],
  ['rin', 'c184', 'c417', 12, '先輩はずっと庇ってくれて', '……すみませんでした、皆さん、本当に！'],
  ['rin', 'c185', 'c418', 5, '……ほう。', 'これは、予想外の展開だね、実に、興味深いじゃないか。'],
  ['rin', 'c187', 'c419', 8, '全行程の記録……', '一晩で、ここまで直したのか、君たちは、本気で。'],
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
console.log('OK: split c170->c412, c173->c413, c176->c414, c178->c415, c183->c416, c184->c417, c185->c418, c187->c419');
