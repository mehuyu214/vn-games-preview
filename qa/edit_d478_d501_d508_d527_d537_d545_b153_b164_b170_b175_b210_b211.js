// W2 優奈の16字最長行（d478／d501／d508／d527／d537／d545）＋美咲の17字最長行（b153／b164／b170／b175／b210／b211）の分割（文面不変・分割のみ）
// 実測（qa/measure_d478_d501_d508_d527_d537_d545_b153_b164_b170_b175_b210_b211.js）：
// - 優奈 d478／d501／d508／d527／d537／d545 は16字で優奈の同率最長行（次点も16字の d547／d558）。
//   d478 は悠太、元の jump=d280 を後半へ引き継ぎ。「、」の後（12字）で分割。
//   d501 は優奈、元の jump=d53 を後半へ引き継ぎ。「、」の後（8字）で分割。face=sad・char=true を後半へ継承。
//   d508 は優奈、元の jump=d199 を後半へ引き継ぎ。「、」の後（8字）で分割。face=serious・char=true を後半へ継承。
//   d527 は園田、元の jump=d344 を後半へ引き継ぎ。「と」の後（7字）で分割。
//   d537 は悠太、元の jump=d260 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   d545 は園田、元の jump=d71b を後半へ引き継ぎ。「、」の後（12字）で分割。
// - 美咲 b153／b164／b170／b175／b210／b211 は17字で美咲の同率最長行（次点も17字の b223／b226）。
//   b153 は美咲、元の jump=b344 を後半へ引き継ぎ。「。」の後（5字）で分割。face=sad を後半へ継承。
//   b164 は藤井、元の jump=b583 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b170 は店長、元の jump=b459 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b175 は美咲、元の jump=b421 を後半へ引き継ぎ。「。」の後（5字）で分割。face=surprise を後半へ継承。
//   b210 は相沢、元の jump=b609 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   b211 は美咲、元の jump=b563 を後半へ引き継ぎ。「。」の後（5字）で分割。face=serious・char=true を後半へ継承。
// 方式は qa/edit_d440_d449_b123_b152.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d917〜d922（優奈）・b844〜b849（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d478_d501_d508_d527_d537_d545_b153_b164_b170_b175_b210_b211.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd478', 'd917', 12, '本の頁を閉じるみたいに、', '静かに）'],
  ['yuna', 'd501', 'd918', 8, 'いつも同じ席の、', '窓際の席の方です'],
  ['yuna', 'd508', 'd919', 8, '本当のところを、', '聞かせてください'],
  ['yuna', 'd527', 'd920', 7, '本の話をすると', '目が輝く人だった。'],
  ['yuna', 'd537', 'd921', 10, '本の話をする時より、', 'ずっと綺麗だ'],
  ['yuna', 'd545', 'd922', 12, '今日は司書さんと一緒か、', '珍しい。'],
  ['misaki', 'b153', 'b844', 5, '……店長。', 'ありがとう、ございます。'],
  ['misaki', 'b164', 'b845', 7, 'あの人、来月、', '海外に行くんだって。'],
  ['misaki', 'b170', 'b846', 7, '天気予報じゃ、', '月末に一回だけだね。'],
  ['misaki', 'b175', 'b847', 5, '……回る。', '悠太くん、これ、回るよ。'],
  ['misaki', 'b210', 'b848', 6, '……今夜が、', '最後の雨だそうですね。'],
  ['misaki', 'b211', 'b849', 5, '相沢さん。', '……傘、持ってきました。'],
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
console.log('OK: split d478->d917, d501->d918, d508->d919, d527->d920, d537->d921, d545->d922, b153->b844, b164->b845, b170->b846, b175->b847, b210->b848, b211->b849');
