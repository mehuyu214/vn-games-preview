// W2 優奈の次点最長台詞（d05／d10／d33／d46／d49／d64・36字）＋美咲の同率最長台詞（b177／b178／b185／b192・36字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d05_d10_d33_d46_d49_d64_b177_b178_b185_b192.js）：
// - 優奈 d05／d10／d33／d46／d49／d64 は36字で優奈の同率最長行（d73／d89 も36字で同率だが本ランは前ラン次回候補の6行のみ対象）。
//   d05 は優奈（face=smile・char=true、後半へ継承）、後続は d06。2つ目の「。」の後で分割。省略記号「……」は U+2026×2 を文字インデックスで確認済み。
//   d10 は優奈（face=smile・char=true、後半へ継承）、元の jump=d327 を後半へ引き継ぎ。1つ目の「。」の後で分割。
//   d33 は優奈（face=sad・char=true、後半へ継承）、後続は d34。2つ目の「。」の後で分割。省略記号「……」は U+2026×2 を文字インデックスで確認済み。
//   d46 は優奈（face=angry・char=true、後半へ継承）、後続は d47。2つ目の「。」の後で分割。省略記号「……」は U+2026×2 を文字インデックスで確認済み。
//   d49 は悠太、後続は d50。2つ目の「。」の後で分割。
//   d64 は優奈（face=sad・char=true、後半へ継承）、後続は d65。1つ目の「。」の後で分割。省略記号「……」は U+2026×2 を文字インデックスで確認済み。
// - 美咲 b177／b178／b185／b192 は36字で美咲の同率最長行（b208／b220／b228／b237 も36字で同率だが本ランは前ラン次回候補の4行のみ対象）。
//   b177 は美咲（face=serious、後半へ継承）、後続は b178。3つ目の「。」の後で分割。省略記号「……」は U+2026×2 を文字インデックスで確認済み。
//   b178 は悠太、後続は b179。2つ目の「。」の後で分割。省略記号「……」は U+2026×2 を文字インデックスで確認済み。
//   b185 は美咲（face=sad、後半へ継承）、後続は b186。1つ目の「。」の後で分割。
//   b192 は美咲（face=surprise・char=true、後半へ継承）、後続は b193。2つ目の「。」の後で分割。省略記号「……」は U+2026×2 を文字インデックスで確認済み。
// 方式は qa/edit_d213c_d242_b142_b154_b162_b173.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d461〜d466（優奈）・b376〜b379（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d05_d10_d33_d46_d49_d64_b177_b178_b185_b192.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd05', 'd461', 21, 'ええ、簡単です。……三万冊までは、ですが。', '残りは、根気との勝負になります'],
  ['yuna', 'd10', 'd462', 18, '悠太さんは修理の続きをお願いします。', '直す本は、わたしが選んでおきました。'],
  ['yuna', 'd33', 'd463', 21, '理由は……今は、言えません。ごめんなさい。', '言える日が来たら、必ず話します'],
  ['yuna', 'd46', 'd464', 25, '隠しては……いません。直していたんです、あの本を。', 'ずっと、閉館後の書庫で'],
  ['yuna', 'd49', 'd465', 24, '本を見る目は、優奈さん仕込みですから。誇りです。', '教え方が、上手いんですよ'],
  ['yuna', 'd64', 'd466', 22, '任せる、だなんて……それは、少しずるいです。', '決断を、わたしに委ねるなんて'],
  ['misaki', 'b177', 'b376', 20, '写真……。若い男の人が、二人。笑ってる。', '海の前で。……一人は、相沢さんだ'],
  ['misaki', 'b178', 'b377', 25, '裏に字があります。『相沢と、傘の持ち主、夏』って。', '……傘の持ち主、って誰'],
  ['misaki', 'b185', 'b378', 24, 'うん。お父さんの友達が、わたしに気づいてくれて。', '娘だって、分かってくれて'],
  ['misaki', 'b192', 'b379', 26, '手紙……わたし、書けるかな。何度も書き直しそうだよ。', '五年分なんて、重くて'],
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
console.log('OK: split d05->d461, d10->d462, d33->d463, d46->d464, d49->d465, d64->d466, b177->b376, b178->b377, b185->b378, b192->b379');
