// W2 優奈の次点最長台詞（d256／d346・31字）＋美咲の次点最長台詞（b124／b136／b144／b146・34字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d256_d346_b124_b136_b144_b146.js）：
// - 優奈 d256／d346 は31字で優奈の同率最長行（次点は d26／d187／d229／d259／d332:30字）。
//   d256 は優奈（face=pleasure・char=true を後半へ継承）、後続は d257。「。」の後で分割（文末に「。」なし）。
//   d346 は優奈（face=shy・char=true を後半へ継承）、元の jump=d31 を後半へ引き継ぎ。「。」の後で分割（文末に「。」なし）。
// - 美咲 b124／b136／b144／b146 は34字で美咲の同率最長行（b148／b170／b171／b182 も34字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b124 は美咲（face=serious・char=true を後半へ継承）、後続は b125。2つ目の「。」の後で分割（文末に「。」なし）。
//   b136 は店長、後続は b137。2つ目の「。」の後で分割（文末に「。」なし）。
//   b144 は悠太、後続は b145。文中に「。」なしのため読点（「は、」の後）で分割（文末に「。」なし）。
//   b146 は美咲（face=sad を後半へ継承）、後続は b147。2つ目の「。」の後で分割（文末に「。」なし）。
// 方式は qa/edit_d188_d201_d243_b89_b98_b120_b122.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d532〜d533（優奈）・b454〜b457（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d256_d346_b124_b136_b144_b146.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd256', 'd532', 20, 'ん……悠太さん、優しく、してくださいね。', '初めてだから、ゆっくり'],
  ['yuna', 'd346', 'd533', 14, '悠太さんは、優しい方ですね。', '疑いもせず、本を返してくれるなんて'],
  ['misaki', 'b124', 'b454', 26, '……店長に、聞いてみる。傘のこと、知ってるはずだよ。', 'あの備考の意味も'],
  ['misaki', 'b136', 'b455', 25, 'オーナーの都合でね。おれも、先週聞いたばかりだよ。', '寝耳に水ってやつさ'],
  ['misaki', 'b144', 'b456', 24, 'じゃあ雨の日のシフトも……美咲さんの雨シフトは、', '店長がわざと組んでた'],
  ['misaki', 'b146', 'b457', 24, '……どうして、黙ってたんですか。五年も、ずっと。', 'わたし、知らなかった'],
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
console.log('OK: split d256->d532, d346->d533, b124->b454, b136->b455, b144->b456, b146->b457');
