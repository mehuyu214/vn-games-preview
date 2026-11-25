// W2 美咲の最長行（b766／b768／b773／b775／b794／b800／b803／b831、13字・10件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_misaki13_b766_b768_b773_b775_b794_b800_b803_b831.js）：
// - 美咲 b766／b768／b773／b775／b794／b800／b803／b831 は13字で美咲の最長台詞行（14字行は0件）。
//   13字を超える件は全て地の文（name=""）のため分割対象外（前ランと同様）。
//   b766 は悠太、元の jump=b458 を後半へ引き継ぎ。「全然」の後（5字）で分割。
//   b768 は美咲、元の jump=b549 を後半へ引き継ぎ。face=sad を後半へ継承。「人間」の後（7字）で分割。
//   b773 は美咲、元の jump=b388 を後半へ引き継ぎ。face=smile を後半へ継承。「、」の後（7字）で分割。
//   b775 は悠太、元の jump=b506 を後半へ引き継ぎ。「さんが」の後（5字）で分割。
//   b794 は藤井、元の jump=b363 を後半へ引き継ぎ。「ホットコーヒー」の後（7字）で分割。
//   b800 は美咲、元の jump=b486 を後半へ引き継ぎ。face=serious・char=true を後半へ継承。「見れば」の後（7字）で分割。
//   b803 は美咲、元の jump=b341 を後半へ引き継ぎ。face=sad を後半へ継承。「、」の後（6字）で分割。
//   b831 は美咲、元の jump=b428 を後半へ引き継ぎ。face=sad を後半へ継承。「、」の後（9字）で分割。
// 方式は qa/edit_misaki13_b689_b691_b698_b709_b715_b719_b752_b763.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b1120〜b1127（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_misaki13_b766_b768_b773_b775_b794_b800_b803_b831.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b766', 'b1120', 5, '今日は全然', '出てきませんね。'],
  ['misaki', 'b768', 'b1121', 7, '傘を貸せる人間', 'であれ』……'],
  ['misaki', 'b773', 'b1122', 7, '隣を歩く人を、', '自分で選ぶ。'],
  ['misaki', 'b775', 'b1123', 5, '美咲さんが', '書いたやつです。'],
  ['misaki', 'b794', 'b1124', 7, 'ホットコーヒー', 'ちょうだい。'],
  ['misaki', 'b800', 'b1125', 7, 'どこから見れば', 'いいのかな。'],
  ['misaki', 'b803', 'b1126', 6, '台帳の備考、', '知ってますか。'],
  ['misaki', 'b831', 'b1127', 9, '言えなかったのに、', 'わたし。'],
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
console.log('OK: split b766->b1120, b768->b1121, b773->b1122, b775->b1123, b794->b1124, b800->b1125, b803->b1126, b831->b1127');
