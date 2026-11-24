// W2 候補の着手前計測：美咲 b465／b466／b468／b476／b486／b493／b542／b560（15字・美咲の最長行）＋優奈 d149／d149b／d167b／d167c／d171／d173／d182b／d194（14字・優奈の最長行）
// 使い方: node qa/measure_b465_b466_b468_b476_b486_b493_b542_b560_d149_d149b_d167b_d167c_d171_d173_d182b_d194.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));
const IDS = ['b465', 'b466', 'b468', 'b476', 'b486', 'b493', 'b542', 'b560', 'd149', 'd149b', 'd167b', 'd167c', 'd171', 'd173', 'd182b', 'd194'];
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
