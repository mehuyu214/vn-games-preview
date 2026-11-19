// W2 優奈の次点最長台詞（d14／d196b／d197／d218／d246／d276・32字）＋美咲の同率最長台詞（b259／b277／b285／b287・35字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d14_d196b_d197_d218_d246_d276_b259_b277_b285_b287.js）：
// - 優奈 d14／d196b／d197／d218／d246／d276 は32字で優奈の同率最長行（d281 も32字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   d14 は優奈（face=surprise・char=true を後半へ継承）、後続は d15。1つ目の「。」の後で分割（文末に「。」なし）。
//   d196b は優奈（face=sad・char=true を後半へ継承）、後続は d197（本ランで同時に分割するが、d518→d197→d519 と連鎖するため問題なし）。1つ目の「。」の後で分割。
//   d197 は榊、元の jump=d345 を後半へ引き継ぎ。1つ目の「。」の後で分割。
//   d218 は園田、後続は d219。1つ目の「。」の後で分割（文末に「。」なし）。
//   d246 は優奈（face=love・char=true を後半へ継承）、後続は d247。2つ目の「。」の後で分割（文末に「。」なし）。
//   d276 は優奈（face=sad・char=true を後半へ継承）、後続は d277。1つ目の「。」の後で分割（文末に「。」なし）。
// - 美咲 b259／b277／b285／b287 は35字で美咲の同率最長行。
//   b259 は悠太、後続は b260。3つ目の「。」の後で分割（文末に「。」なし）。
//   b277 は美咲（face=love を後半へ継承）、後続は b278。1つ目の「。」の後で分割（文末に「。」なし）。
//   b285 は美咲（face=smile を後半へ継承）、後続は b286。2つ目の「。」の後で分割（文末に「。」なし）。
//   b287 は藤井、後続は b288。2つ目の「。」の後で分割（文末に「。」なし）。
// 方式は qa/edit_d260_d329_b253_b254.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d517〜d522（優奈）・b438〜b441（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d14_d196b_d197_d218_d246_d276_b259_b277_b285_b287.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd14', 'd517', 14, '……どうしました、悠太さん。', '何かありましたか？　本のことで、何か'],
  ['yuna', 'd196b', 'd518', 15, '届かなかった、告白の手紙です。', '半世紀、本の中で眠っていた告白です'],
  ['yuna', 'd197', 'd519', 13, '祖母の日記に、ありました。', '『言えなかったことだけが、残る』って。'],
  ['yuna', 'd218', 'd520', 14, '手紙……？　宛名は、わしか。', '……梓さんから。まさか、そんなことが'],
  ['yuna', 'd246', 'd521', 21, '違います。今のは『帰さないで』の意味です。', '……今日は、帰しません'],
  ['yuna', 'd276', 'd522', 19, '……わたしは、直すことしかできません。', '届けるのは、祖母の言葉だけ'],
  ['misaki', 'b259', 'b438', 24, '……はい。供養、しましょう。今日は唐揚げですね。', '……いつも通り、ですね'],
  ['misaki', 'b277', 'b439', 22, 'わたしたちの子、できたらいいな……本気だよ。', '悠太くんとの子が、ほしいの'],
  ['misaki', 'b285', 'b440', 25, '最初のお客さんは、もう決まってるの。内緒だけどね。', 'ふふ、楽しみにしてて'],
  ['misaki', 'b287', 'b441', 25, 'あたしは卵焼きの大盛りで。常連第一号はあたしだよ。', '五年、待ったんだから'],
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
  secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split d14->d517, d196b->d518, d197->d519, d218->d520, d246->d521, d276->d522, b259->b438, b277->b439, b285->b440, b287->b441');
