// W2 優奈の最長行（d648／d650／d656／d663／d669／d693／d696／d702、14字・14件同率の先頭8件）＋美咲の次点最長行（b286／b321／b322／b326／b332／b346／b349／b355、14字・55件同率の先頭8件）の分割（文面不変・分割のみ）
// 実測（qa/measure_d648_d650_d656_d663_d669_d693_d696_d702_b286_b321_b322_b326_b332_b346_b349_b355.js）：
// - 優奈 d648／d650／d656／d663／d669／d693／d696／d702 は14字で優奈の最長行（14件同率の先頭8件）。
//   d648 は優奈、元の jump=d59 を後半へ引き継ぎ。「、」の後（7字）で分割。face=shy・char=true を後半へ継承。
//   d650 は悠太、元の jump=d334 を後半へ引き継ぎ。「も」の後（4字）で分割。
//   d656 は悠太、元の jump=d430 を後半へ引き継ぎ。「さんの」の後（5字）で分割。
//   d663 は悠太、元の jump=d484 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d669 は榊、元の jump=d374 を後半へ引き継ぎ。「が」の後（5字）で分割。
//   d693 は園田、元の jump=d221b を後半へ引き継ぎ。「、」の後（4字）で分割。
//   d696 は悠太、元の jump=d544 を後半へ引き継ぎ。「、」の後（9字）で分割。先頭の全角スペースは前半に残る。
//   d702 は優奈、元の jump=d503 を後半へ引き継ぎ。「登録」の後（7字）で分割。face=serious・char=true を後半へ継承。
// - 美咲 b286／b321／b322／b326／b332／b346／b349／b355 は14字で美咲の次点最長行（55件同率の先頭8件）。
//   b286 は店長、元の jump=b519 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   b321 は悠太、元の jump=b250 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b322 は店長、元の jump=b256 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b326 は相沢、元の jump=b19 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   b332 は相沢、元の jump=b677 を後半へ引き継ぎ。「、」の後（7字）で分割。
//   b346 は悠太、元の jump=b168 を後半へ引き継ぎ。「ない」の後（7字）で分割。
//   b349 は美咲、元の jump=b199 を後半へ引き継ぎ。「、」の後（7字）で分割。face=serious・char=true を後半へ継承。
//   b355 は相沢、元の jump=b235 を後半へ引き継ぎ。「、」の後（5字）で分割。
// 方式は qa/edit_d572_..._b259.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d1059〜d1066（優奈）・b993〜b1000（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d648_d650_d656_d663_d669_d693_d696_d702_b286_b321_b322_b326_b332_b346_b349_b355.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd648', 'd1059', 7, '守るだなんて、', '大それたことは'],
  ['yuna', 'd650', 'd1060', 4, '数か月も', '直し続けるんですか。'],
  ['yuna', 'd656', 'd1061', 5, '優奈さんの', '従兄弟ってことに。'],
  ['yuna', 'd663', 'd1062', 5, '最後まで、', 'ちゃんと聞きます。'],
  ['yuna', 'd669', 'd1063', 5, '同じことが', '書いてありました。'],
  ['yuna', 'd693', 'd1064', 4, 'わしも、', '同じ馬鹿だったのに。'],
  ['yuna', 'd696', 'd1065', 9, '　どうしたんです、', 'いきなり。'],
  ['yuna', 'd702', 'd1066', 7, '全て目録に登録', 'されています。'],
  ['misaki', 'b286', 'b993', 4, 'おーい、', '開店おめでとうさん。'],
  ['misaki', 'b321', 'b994', 5, '……俺も、', '何も言えなかった）'],
  ['misaki', 'b322', 'b995', 5, 'おれには、', 'それしか言えなくて'],
  ['misaki', 'b326', 'b996', 5, 'この店に、', '預けたままの傘です'],
  ['misaki', 'b332', 'b997', 7, 'それ以外では、', '来られなくて。'],
  ['misaki', 'b346', 'b998', 7, 'もう来られない', 'かもしれない）'],
  ['misaki', 'b349', 'b999', 7, '飾らないのが、', '父の傘らしくて'],
  ['misaki', 'b355', 'b1000', 5, '待つのは、', 'もう終わりでしょう'],
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
console.log('OK: split d648->d1059, d650->d1060, d656->d1061, d663->d1062, d669->d1063, d693->d1064, d696->d1065, d702->d1066, b286->b993, b321->b994, b322->b995, b326->b996, b332->b997, b346->b998, b349->b999, b355->b1000');
