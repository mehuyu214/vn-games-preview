// W2 優奈の次点最長台詞（d26／d187／d229／d259／d332・30字）＋美咲の次点最長台詞（b148／b170／b171／b182・34字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d26_d187_d229_d259_d332_b148_b170_b171_b182.js）：
// - 優奈 d26／d187／d229／d259／d332 は30字で優奈の同率最長行（次点は d76b／d135c／d155c:29字）。
//   d26 は優奈（face=serious・char=true を後半へ継承）、後続は d27。「は」の後で分割（文末に「。」なし）。
//   d187 は白鳥、元の jump=d360 を後半へ引き継ぎ。1つ目の「。」の後で分割。
//   d229 は園田、後続は d230。2つ目の「。」の後で分割（文末に「。」なし）。
//   d259 は悠太、後続は d260。2つ目の「。」の後で分割（文末に「。」なし）。
//   d332 は優奈（face=shy・char=true を後半へ継承）、元の jump=d245 を後半へ引き継ぎ。1つ目の「。」の後で分割（文末に「。」なし）。
// - 美咲 b148／b170／b171／b182 は34字で美咲の同率最長行（b183／b194／b203／b205 も34字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b148 は悠太、後続は b149。1つ目の「。」の後で分割（文末に「。」なし）。
//   b170 は店長、後続は b171。1つ目の「。」の後で分割（文末に「。」なし）。
//   b171 は美咲（face=sad を後半へ継承）、後続は b172。2つ目の「。」の後で分割（文末に「。」なし）。
//   b182 は悠太、後続は b183。1つ目の「。」の後で分割（文末に「。」なし）。
// 方式は qa/edit_d256_d346_b124_b136_b144_b146.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d534〜d538（優奈）・b458〜b461（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d26_d187_d229_d259_d332_b148_b170_b171_b182.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd26', 'd534', 19, '図書館規則第三条、資料の所在については', '――、ええと、その……'],
  ['yuna', 'd187', 'd535', 11, 'さあ、お茶が冷めます。', '明日のために、今日は早く休みましょう。'],
  ['yuna', 'd229', 'd536', 19, '館長。今日は、とびきりの一杯を頼むよ。', '半世紀待った祝いに、ね'],
  ['yuna', 'd259', 'd537', 14, '優奈さん、綺麗だよ。本当に。', '本の話をする時より、ずっと綺麗だ'],
  ['yuna', 'd332', 'd538', 20, 'わたしの勇気を、いつも受け止めてくれる。', '閉館ですよ、悠太さん'],
  ['misaki', 'b148', 'b458', 19, '店長の口癖、今日は全然出てきませんね。', '珍しい。本気の話ってことですか'],
  ['misaki', 'b170', 'b459', 17, '天気予報じゃ、月末に一回だけだね。', '大きいのだよ。台風並みって言ってた'],
  ['misaki', 'b171', 'b460', 23, '最後の、雨……。その日に、全部終わるんですね。', '返せても、返せなくても'],
  ['misaki', 'b182', 'b461', 24, '（この傘は、美咲の父親のものだった、ってことか。', '……全部、繋がった）'],
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
console.log('OK: split d26->d534, d187->d535, d229->d536, d259->d537, d332->d538, b148->b458, b170->b459, b171->b460, b182->b461');
