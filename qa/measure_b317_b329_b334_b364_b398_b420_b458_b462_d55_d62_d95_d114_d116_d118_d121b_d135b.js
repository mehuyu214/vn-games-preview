// W2 候補の着手前計測：美咲 b317／b329／b334／b364／b398／b420／b458／b462（15字・美咲の最長行）＋優奈 d55／d62／d95／d114／d116／d118／d121b／d135b（14字・優奈の最長行）
// 使い方: node qa/measure_b317_b329_b334_b364_b398_b420_b458_b462_d55_d62_d95_d114_d116_d118_d121b_d135b.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));
const IDS = ['b317', 'b329', 'b334', 'b364', 'b398', 'b420', 'b458', 'b462', 'd55', 'd62', 'd95', 'd114', 'd116', 'd118', 'd121b', 'd135b'];
const find = id => { for (const g of GAMES) { const n = g.scenes.find(s => s.id === id); if (n) return { g: g.id, n }; } };
for (const id of IDS) {
  const r = find(id);
  if (!r) { console.log(`${id}: NOT FOUND`); continue; }
  const scenes = GAMES.find(g => g.id === r.g).scenes;
  const idx = scenes.findIndex(s => s.id === id);
  const next = scenes[idx + 1];
  console.log(`${id} [${r.g}] name=${JSON.stringify(r.n.name)} face=${r.n.face || '-'} char=${r.n.char || '-'} r18=${r.n.r18 || '-'} jump=${r.n.jump || '-'} next=${next ? next.id : '-'} len=${r.n.text.length}: ${r.n.text}`);
  console.log('   extra: ' + JSON.stringify(Object.keys(r.n).filter(k => !['id', 'name', 'text', 'face', 'char', 'jump', 'r18'].includes(k))));
  console.log('   chars: ' + [...r.n.text].map((c, i) => `${i}:${c}`).join(' '));
}
