// W2 優奈の15字最長行（d366／d386／d390／d422／d424／d435）＋美咲の16字最長行（b98／b101／b111／b134／b135／b137）の分割（文面不変・分割のみ）
// 実測（qa/measure_d366_d386_d390_d422_d424_d435_b98_b101_b111_b134_b135_b137.js）：
// - 優奈 d366／d386／d390／d422／d424／d435 は15字で優奈の同率最長行（次点も15字の d452／d454）。
//   d366 は悠太、元の jump=d591 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d386 は悠太、元の jump=d149 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d390 は園田、元の jump=d222 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d422 は園田、元の jump=d187 を後半へ引き継ぎ。「、」の後（11字）で分割。
//   d424 は榊、元の jump=d199b を後半へ引き継ぎ。「、」の後（7字）で分割。
//   d435 は優奈、元の jump=d176b を後半へ引き継ぎ。「、」の後（7字）で分割。face=serious・char=true を後半へ継承。
// - 美咲 b98／b101／b111／b134／b135／b137 は16字で美咲の同率最長行（次点も16字の b146／b149）。
//   b98 は美咲、元の jump=b451 を後半へ引き継ぎ。「。」の後（7字）で分割。face=surprise・char=true を後半へ継承。
//   b101 は藤井、元の jump=b556 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b111 は悠太、元の jump=b409 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   b134 は店長、元の jump=b488 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   b135 は美咲、元の jump=b414 を後半へ引き継ぎ。「。」の後（4字）で分割。face=surprise を後半へ継承。
//   b137 は悠太、元の jump=b603 を後半へ引き継ぎ。「傘は」の後（6字）で分割。
// 方式は qa/edit_d344_d350_b81_b96.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d957〜d962（優奈）・b884〜b889（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d366_d386_d390_d422_d424_d435_b98_b101_b111_b134_b135_b137.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd366', 'd957', 7, 'それは事実で、', '目録に無い本は、'],
  ['yuna', 'd386', 'd958', 7, '祖母の後悔も、', '一緒に直してきた'],
  ['yuna', 'd390', 'd959', 5, 'お互いに、', '馬鹿同士だったんだな'],
  ['yuna', 'd422', 'd960', 11, 'あの日々があったから、', '今がある'],
  ['yuna', 'd424', 'd961', 7, '祖母の想いを、', 'あるべき場所へ。'],
  ['yuna', 'd435', 'd962', 7, '新しい物語が、', '挟まりましたね。'],
  ['misaki', 'b98', 'b884', 7, '……藤井さん。', 'それ、本当ですか。'],
  ['misaki', 'b101', 'b885', 5, '『彼女に、', 'よく似ている』ってさ。'],
  ['misaki', 'b111', 'b886', 10, '雨の日だけに絞れば、', '早いですよ。'],
  ['misaki', 'b134', 'b887', 4, 'この店、', '来月末で閉店が決まった。'],
  ['misaki', 'b135', 'b888', 4, '……え。', '閉店……来月末、ですか。'],
  ['misaki', 'b137', 'b889', 6, 'じゃあ、傘は', '……落とし物の傘は、'],
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
console.log('OK: split d366->d957, d386->d958, d390->d959, d422->d960, d424->d961, d435->d962, b98->b884, b101->b885, b111->b886, b134->b887, b135->b888, b137->b889');
