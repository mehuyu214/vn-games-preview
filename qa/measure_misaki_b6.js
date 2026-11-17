// W2 美咲 B6 の残留「大きな乳房が、月明かりに白く浮かぶ」の計測。
// レビュー B6 は同句の4回出現を指摘。現行では美咲で b130（α・記念日の夜）と
// b170（β・ベビー用品の夜）の2回に減少しているが、文面は「頷くと、」の有無
// を除き同一で、テンプレートの残留として残っている。
// 両ブロックの導入（b125／b163）は光源を「真夜中のコンビニの灯り」と明示して
// おり、「月明かり」は場面の光源とも食い違う。
// 他作品は各1回のみ（a138／c132／d131／e131）で作品内の反復ではないため対象外。
const fs = require('fs');
const src = fs.readFileSync('data.js', 'utf-8');
const GAMES = eval(src + ';GAMES');
const CLAUSE = '大きな乳房が、月明かりに白く浮かぶ';
for (const g of GAMES) {
  const hits = g.scenes.filter(s => s.text && s.text.includes(CLAUSE)).map(s => s.id);
  console.log(g.id + ': ' + CLAUSE + ' = ' + hits.length + '件 ' + JSON.stringify(hits));
}
const misaki = GAMES.find(x => x.id === 'misaki');
for (const id of ['b125', 'b130', 'b163', 'b170']) {
  const n = misaki.scenes.find(s => s.id === id);
  console.log('--- ' + id + ' ---');
  console.log(n ? n.text : '(missing)');
}
