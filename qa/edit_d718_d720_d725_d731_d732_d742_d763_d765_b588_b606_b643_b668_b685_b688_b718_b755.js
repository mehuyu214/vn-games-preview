// W2 優奈の15字最長行（d718／d720／d725／d731／d732／d742／d763／d765）＋美咲の16字最長行（b588／b606／b643／b668／b685／b688／b718／b755）の分割（文面不変・分割のみ）
// 実測（qa/measure_d718_d720_d725_d731_d732_d742_d763_d765_b588_b606_b643_b668_b685_b688_b718_b755.js）：
// - 優奈 d718／d720／d725／d731／d732／d742／d763／d765 は15字で優奈の同率最長行（8件同率）。
//   d718 は悠太、元の jump=d232 を後半へ引き継ぎ。「け」の後（6字）で分割。
//   d720 は優奈、元の jump=d36 を後半へ引き継ぎ。「、」の後（7字）で分割。face=sad・char=true を後半へ継承。
//   d725 は悠太、元の jump=d479 を後半へ引き継ぎ。「い」の後（9字）で分割。
//   d731 は悠太、元の jump=d391 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   d732 は優奈、元の jump=d460 を後半へ引き継ぎ。「、」の後（5字）で分割。face=shy・char=true を後半へ継承。
//   d742 は優奈、元の jump=d51 を後半へ引き継ぎ。「ば」の後（6字）で分割。face=serious・char=true を後半へ継承。
//   d763 は悠太、元の jump=d451 を後半へ引き継ぎ。「準」の後（8字）で分割。
//   d765 は白鳥、元の jump=d548 を後半へ引き継ぎ。「へ」の後（8字）で分割。
// - 美咲 b588／b606／b643／b668／b685／b688／b718／b755 は16字で美咲の同率最長行（8件同率）。
//   b588 は相沢、元の jump=b382 を後半へ引き継ぎ。「、」の後（9字）で分割。
//   b606 は悠太、元の jump=b377 を後半へ引き継ぎ。「、」の後（11字）で分割。
//   b643 は悠太、元の jump=b321 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   b668 は美咲、元の jump=b525 を後半へ引き継ぎ。「は」の後（5字）で分割。face=serious を後半へ継承（charなし）。
//   b685 は藤井、元の jump=b314 を後半へ引き継ぎ。「は」の後（5字）で分割。
//   b688 は悠太、元の jump=b319 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b718 は相沢、元の jump=b17 を後半へ引き継ぎ。「を」の後（6字）で分割。
//   b755 は美咲、元の jump=b307 を後半へ引き継ぎ。「、」の後（7字）で分割。face=confused を後半へ継承（charなし）。
// 方式は qa/edit_d577_..._b572.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d987〜d994（優奈）・b914〜b921（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d718_d720_d725_d731_d732_d742_d763_d765_b588_b606_b643_b668_b685_b688_b718_b755.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd718', 'd987', 6, '俺は少しだけ', '泣きそうになった）'],
  ['yuna', 'd720', 'd988', 7, 'わたしからの、', '一生のお願いです'],
  ['yuna', 'd725', 'd989', 9, 'でも、目は離さない', 'ことにした。'],
  ['yuna', 'd731', 'd990', 8, '半世紀の手紙が、', 'ついに届いた。'],
  ['yuna', 'd732', 'd991', 5, 'わたしと、', '付き合ってください。'],
  ['yuna', 'd742', 'd992', 6, '守らなければ', 'いけない本なんです'],
  ['yuna', 'd763', 'd993', 8, 'ルールがお茶基準', 'すぎるだろう。'],
  ['yuna', 'd765', 'd994', 8, '届くべき人の元へ', '届けること』。'],
  ['misaki', 'b588', 'b914', 9, '『雨の日は――』、', 'よく口にして。'],
  ['misaki', 'b606', 'b915', 11, '『相沢と、傘の持ち主、', '夏』って。'],
  ['misaki', 'b643', 'b916', 10, 'お礼も、父のことも、', '手紙もない。'],
  ['misaki', 'b668', 'b917', 5, 'あと、雨は', 'あと何回来るんですか。'],
  ['misaki', 'b685', 'b918', 5, '傘、今度は', 'ちゃんと持ってきたよ。'],
  ['misaki', 'b688', 'b919', 7, '……美咲さん、', '手、震えてますよ。'],
  ['misaki', 'b718', 'b920', 6, '少々お時間を', 'いただきたいのですが'],
  ['misaki', 'b755', 'b921', 7, '長いレシート、', '頭についてますよ。'],
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
console.log('OK: split d718->d987, d720->d988, d725->d989, d731->d990, d732->d991, d742->d992, d763->d993, d765->d994, b588->b914, b606->b915, b643->b916, b668->b917, b685->b918, b688->b919, b718->b920, b755->b921');
