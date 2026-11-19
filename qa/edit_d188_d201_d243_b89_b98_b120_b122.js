// W2 優奈の次点最長台詞（d188／d201／d243・31字）＋美咲の次点最長台詞（b89／b98／b120／b122・34字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d188_d201_d243_b89_b98_b120_b122.js）：
// - 優奈 d188／d201／d243 は31字で優奈の同率最長行（d256／d346 も31字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d188 は悠太、後続は d189。「。」の後で分割（文末に「。」なし）。
//   d201 は榊、後続は d202。「。」の後で分割（文末に「。」なし）。
//   d243 は悠太、後続は d243b。3つ目の「。」の後で分割。
// - 美咲 b89／b98／b120／b122 は34字で美咲の同率最長行（b124／b136／b144／b146 も34字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b89 は美咲（face=serious を後半へ継承）、後続は b90。2つ目の「。」の後で分割（文末に「。」なし）。
//   b98 は美咲（face=surprise・char=true を後半へ継承）、後続は b99。2つ目の「。」の後で分割（文末に「。」なし）。
//   b120 は悠太、後続は b121。2つ目の「。」の後で分割（文末に「。」なし）。
//   b122 は悠太、元の jump=b124 を後半へ引き継ぎ。「？」の後で分割。
// 方式は qa/edit_d20_d48_d97_d135_d177_b53_b58_b65_b83.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d529〜d531（優奈）・b450〜b453（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d188_d201_d243_b89_b98_b120_b122.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd188', 'd529', 17, '（明日、半世紀の物語に決着がつく。', '俺たちは、その立会人になる）'],
  ['yuna', 'd201', 'd530', 18, '届ける相手は、まだご存命なんですか。', 'その方は、今もこの図書館に'],
  ['yuna', 'd243', 'd531', 20, '……はい。喜んで。半世紀も待たせません。', '即答が、俺の答えです。'],
  ['misaki', 'b89', 'b450', 23, 'うん。持ち主が取りに来たら、お礼を言いたくて。', 'それだけの理由で、五年'],
  ['misaki', 'b98', 'b451', 16, '……藤井さん。それ、本当ですか。', '何か、言ってましたか。車の中で、何か'],
  ['misaki', 'b120', 'b452', 18, '備考は……『持ち主来店まで永久保管。', '大島に引き継ぐ』。……大島、って'],
  ['misaki', 'b122', 'b453', 24, '（前の店主が、今の店長に引き継いだ、ってことか？', '　傘ごと、この店を）'],
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
console.log('OK: split d188->d529, d201->d530, d243->d531, b89->b450, b98->b451, b120->b452, b122->b453');
