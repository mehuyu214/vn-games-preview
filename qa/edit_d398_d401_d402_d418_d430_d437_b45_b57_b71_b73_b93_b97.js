// W2 優奈の16字最長行（d398／d401／d402／d418／d430／d437）＋美咲の17字最長行（b45／b57／b71／b73／b93／b97）の分割（文面不変・分割のみ）
// 実測（qa/measure_d398_d401_d402_d418_d430_d437_b45_b57_b71_b73_b93_b97.js）：
// - 優奈 d398／d401／d402／d418／d430／d437 は16字で優奈の同率最長行（次点も16字の d440／d449）。
//   d398 は悠太、元の jump=d56 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   d401 は優奈、face=serious・char=true を後半へ継承、元の jump=d73 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d402 は優奈、face=serious・char=true を後半へ継承、元の jump=d87 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d418 は園田、元の jump=d135 を後半へ引き継ぎ。「、」の後（10字）で分割。
//   d430 は悠太、元の jump=d106 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d437 は優奈、face=serious・char=true を後半へ継承、元の jump=d193b を後半へ引き継ぎ。「、」の後（4字）で分割。
// - 美咲 b45／b57／b71／b73／b93／b97 は17字で美咲の同率最長行（次点も17字の b123／b152）。
//   b45 は藤井、元の jump=b331 を後半へ引き継ぎ。「、」の後（4字）で分割。
//   b57 は相沢、元の jump=b521 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   b71 は美咲、face=smile を後半へ継承、元の jump=b628 を後半へ引き継ぎ。「、」の後（12字）で分割。
//   b73 は美咲、face=smile・char=true を後半へ継承、元の jump=b313 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   b93 は美咲、face=sad を後半へ継承、元の jump=b575 を後半へ引き継ぎ。「、」の後（6字）で分割。
//   b97 は藤井、元の jump=b367 を後半へ引き継ぎ。「、」の後（6字）で分割。
// 方式は qa/edit_d379_d394_b08_b42.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d909〜d914（優奈）・b836〜b841（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d398_d401_d402_d418_d430_d437_b45_b57_b71_b73_b93_b97.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd398', 'd909', 4, '手紙は、', '届いて初めて手紙なんです'],
  ['yuna', 'd401', 'd910', 5, '……まあ、', 'いつものことですけれど'],
  ['yuna', 'd402', 'd911', 6, 'その顔では、', '放っておけませんから'],
  ['yuna', 'd418', 'd912', 10, 'わしの人生を変えた、', '一冊の詩集さ'],
  ['yuna', 'd430', 'd913', 5, '……話が、', '一気に身内ごとになった'],
  ['yuna', 'd437', 'd914', 4, '昨日は、', '失礼なことを言いました。'],
  ['misaki', 'b45', 'b836', 4, 'あんた、', '雨の日にしか来ない客かい。'],
  ['misaki', 'b57', 'b837', 9, '相沢、と申します。', 'また、雨の日に。'],
  ['misaki', 'b71', 'b838', 12, '悠太くん。……コーヒー、', '入れるね。'],
  ['misaki', 'b73', 'b839', 8, '悠太くん。廃棄、', '今日は二つあるよ。'],
  ['misaki', 'b93', 'b840', 6, '……あの人、', '今どうしてるんだろう。'],
  ['misaki', 'b97', 'b841', 6, '先週の紳士、', 'あたしが送ったんだよ。'],
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
console.log('OK: split d398->d909, d401->d910, d402->d911, d418->d912, d430->d913, d437->d914, b45->b836, b57->b837, b71->b838, b73->b839, b93->b840, b97->b841');
