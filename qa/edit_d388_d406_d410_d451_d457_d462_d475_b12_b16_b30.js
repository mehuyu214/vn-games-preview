// W2 優奈の18字最長行（d388／d406／d410／d451／d457／d462／d475）＋美咲の19字最長行（b12／b16／b30）の分割（文面不変・分割のみ）
// 実測（qa/measure_d388_d406_d410_d451_d457_d462_d475_b12_b16_b30.js）：
// - 優奈 d388／d406／d410／d451／d457／d462／d475 は18字で優奈の同率最長行（次点も18字の d485）。
//   d388 は悠太、元の jump=d201 を後半へ引き継ぎ。「、」の後（11字）で分割。
//   d406 は白鳥、元の jump=d182b を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d410 は優奈（face=serious・char=true を後半へ継承）、元の jump=d240b を後半へ引き継ぎ。「、」の後（3字）で分割。
//   d451 は悠太、元の jump=d99 を後半へ引き継ぎ。「、」の後（3字）で分割。
//   d457 は園田、元の jump=d185b を後半へ引き継ぎ。「、」の後（6字）で分割。
//   d462 は優奈（face=smile・char=true を後半へ継承）、元の jump=d327 を後半へ引き継ぎ。「、」の後（5字）で分割。
//   d475 は優奈（face=serious・char=true を後半へ継承）、元の jump=d209 を後半へ引き継ぎ。「、」の後（8字）で分割。末尾に句点なしの原文のまま。
// - 美咲 b12／b16／b30 は19字で美咲の同率最長行（次点も19字の b50／b52／b69／b99／b105）。
//   b12 は美咲（face=confused を後半へ継承）、元の jump=b307 を後半へ引き継ぎ。「。」の後（3字）で分割。
//   b16 は相沢、元の jump=b296 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   b30 は藤井、元の jump=b395 を後半へ引き継ぎ。「、」の後（14字）で分割。
// 方式は qa/edit_d385_b444_b475_b540_b598_b612.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d827〜d833（優奈）・b755〜b757（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d388_d406_d410_d451_d457_d462_d475_b12_b16_b30.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd388', 'd827', 11, '疑ってしまったことを、', '少し反省した）'],
  ['yuna', 'd406', 'd828', 5, '二人とも、', 'まだ二十代の頃の写真です。'],
  ['yuna', 'd410', 'd829', 3, 'もう、', '直すだけじゃ終われませんから。'],
  ['yuna', 'd451', 'd830', 3, 'でも、', 'この緩さが人を救うこともある）'],
  ['yuna', 'd457', 'd831', 6, 'いい匂いが、', '閲覧室まで届いていたよ。'],
  ['yuna', 'd462', 'd832', 5, '直す本は、', 'わたしが選んでおきました。'],
  ['yuna', 'd475', 'd833', 8, '祖母の二の舞は、', 'わたしで終わらせます'],
  ['misaki', 'b12', 'b755', 3, '店長。', '長いレシート、頭についてますよ。'],
  ['misaki', 'b16', 'b756', 8, '……すみません。', '少し、よろしいですか。'],
  ['misaki', 'b30', 'b757', 14, '客が一人もいないと思ったら、', '一人いた。'],
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
console.log('OK: split d388->d827, d406->d828, d410->d829, d451->d830, d457->d831, d462->d832, d475->d833, b12->b755, b16->b756, b30->b757');
