// W2 美咲の残る15字行（b208／b220／b255／b268／b274／b292／b310／b315）＋優奈の14字最長行（d14／d30／d33／d40／d50／d54）の分割（文面不変・分割のみ）
// 実測（qa/measure_b208_b220_b255_b268_b274_b292_b310_b315_d14_d30_d33_d40_d50_d54.js）：
// - 美咲 b208／b220／b255／b268／b274／b292／b310／b315 は15字で美咲の同率最長行（8件同率）。
//   b208 は悠太、元の jump=b562 を後半へ引き継ぎ。「から、」の後（11字）で分割。
//   b220 は美咲、元の jump=b610 を後半へ引き継ぎ。「言えなかった」の後（10字）で分割。face=shy を後半へ継承。
//   b255 は店長、元の jump=b644 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b268 は美咲、元の jump=b503 を後半へ引き継ぎ。「、」の後（10字）で分割。face=love を後半へ継承。
//   b274 は美咲、元の jump=b528 を後半へ引き継ぎ。「、」の後（7字）で分割。face=pleasure・r18=true を後半へ継承。
//   b292 は美咲、元の jump=b507 を後半へ引き継ぎ。「。」の後（3字）で分割。face=smile を後半へ継承。
//   b310 は悠太、元の jump=b568 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b315 は藤井、元の jump=b104 を後半へ引き継ぎ。「、」の後（7字）で分割。
// - 優奈 d14／d30／d33／d40／d50／d54 は14字で優奈の同率最長行（8件同率、d55／d62 も同率）。
//   d14 は優奈、元の jump=d517 を後半へ引き継ぎ。「、」の後（9字）で分割。face=surprise・char=true を後半へ継承。
//   d30 は優奈、元の jump=d346 を後半へ引き継ぎ。「、」の後（8字）で分割。face=shy・char=true を後半へ継承。
//   d33 は優奈、元の jump=d697 を後半へ引き継ぎ。「、」の後（8字）で分割。face=sad・char=true を後半へ継承。
//   d40 は優奈、元の jump=d578 を後半へ引き継ぎ。「、」の後（5字）で分割。face=serious・char=true を後半へ継承。
//   d50 は優奈、元の jump=d699 を後半へ引き継ぎ。「、」の後（5字）で分割。face=serious・char=true を後半へ継承。
//   d54 は優奈、元の jump=d623 を後半へ引き継ぎ。「届かなかった」の後（10字）で分割。face=sad・char=true を後半へ継承。
// 方式は qa/edit_d829_..._b156.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード b930〜b937（美咲）・d997〜d1002（優奈）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_b208_b220_b255_b268_b274_b292_b310_b315_d14_d30_d33_d40_d50_d54.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['misaki', 'b208', 'b930', 11, '礼は、傘を返せてから、', 'ですよ。'],
  ['misaki', 'b220', 'b931', 10, '五年間、言えなかった', 'お礼です。'],
  ['misaki', 'b255', 'b932', 5, '……まあ、', 'なんとかなる、かな。'],
  ['misaki', 'b268', 'b933', 10, '悠太くんじゃなきゃ、', 'だめなの。'],
  ['misaki', 'b274', 'b934', 7, 'あっ……だめ、', '声、出ちゃう……'],
  ['misaki', 'b292', 'b935', 3, 'うん。', 'なんとかなったね、店長。'],
  ['misaki', 'b310', 'b936', 5, '雨の日は、', '必ず出勤してますね。'],
  ['misaki', 'b315', 'b937', 7, '聞き返したら、', '目を閉じちゃった'],
  ['yuna', 'd14', 'd997', 9, '……どうしました、', '悠太さん。'],
  ['yuna', 'd30', 'd998', 8, '……ありがとう、', 'ございます。'],
  ['yuna', 'd33', 'd999', 8, '理由は……今は、', '言えません。'],
  ['yuna', 'd40', 'd1000', 5, '悠太さん、', 'まだいたんですか。'],
  ['yuna', 'd50', 'd1001', 5, 'この本は、', '誰にも渡せません。'],
  ['yuna', 'd54', 'd1002', 10, '手紙は、届かなかった', 'んです。'],
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
console.log('OK: split b208->b930, b220->b931, b255->b932, b268->b933, b274->b934, b292->b935, b310->b936, b315->b937, d14->d997, d30->d998, d33->d999, d40->d1000, d50->d1001, d54->d1002');
