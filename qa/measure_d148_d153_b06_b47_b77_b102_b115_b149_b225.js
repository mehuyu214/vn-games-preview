// W2 候補の着手前計測：優奈 d148／d153（41字・優奈の同率最長行）＋美咲 b06／b47／b77／b102／b115／b149／b225（39字・美咲の次点最長行）の現状＋各作品の最長行
// 使い方: node qa/measure_d148_d153_b06_b47_b77_b102_b115_b149_b225.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));
for (const g of GAMES) {
  const ids = g.scenes.map(s => s.id);
  const nums = ids.map(id => parseInt(id.slice(1))).filter(n => !isNaN(n));
  const dlg = g.scenes.filter(n => n.text && n.name);
  const sorted = [...dlg].sort((a, b) => b.text.length - a.text.length);
  console.log(`== ${g.id}: nodes=${g.scenes.length} maxIdNum=${Math.max(...nums)} last=${ids[ids.length - 1]}`);
  console.log('  longest 8: ' + sorted.slice(0, 8).map(n => `${n.id}:${n.text.length}字`).join(' '));
}
const find = id => { for (const g of GAMES) { const n = g.scenes.find(s => s.id === id); if (n) return { g: g.id, n }; } };
for (const id of ['d148', 'd153', 'b06', 'b47', 'b77', 'b102', 'b115', 'b149', 'b225']) {
  const r = find(id);
  if (!r) { console.log(`${id}: NOT FOUND`); continue; }
  const scenes = GAMES.find(g => g.id === r.g).scenes;
  const idx = scenes.findIndex(s => s.id === id);
  const next = scenes[idx + 1];
  console.log(`${id} [${r.g}] name=${JSON.stringify(r.n.name)} face=${r.n.face || '-'} char=${r.n.char || '-'} jump=${r.n.jump || '-'} next=${next ? next.id : '-'} len=${r.n.text.length}: ${r.n.text}`);
}
