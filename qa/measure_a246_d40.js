// W2 候補の着手前計測：桜 a246（79字の告白台詞）と優奈 d40（同一ノード内反復・50字）
// 使い方: node qa/measure_a246_d40.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));
for (const g of GAMES) {
  const ids = g.scenes.map(s => s.id);
  const nums = ids.map(id => parseInt(id.slice(1))).filter(n => !isNaN(n));
  const dlg = g.scenes.filter(n => n.text && n.name);
  const sorted = [...dlg].sort((a, b) => b.text.length - a.text.length);
  console.log(`== ${g.id}: nodes=${g.scenes.length} maxIdNum=${Math.max(...nums)} last=${ids[ids.length - 1]}`);
  console.log('  longest 5: ' + sorted.slice(0, 5).map(n => `${n.id}:${n.text.length}字`).join(' '));
}
const find = id => { for (const g of GAMES) { const n = g.scenes.find(s => s.id === id); if (n) return { g: g.id, n }; } };
for (const id of ['a246', 'a247', 'd40', 'd41']) {
  const r = find(id);
  console.log(`${id} [${r.g}] name=${JSON.stringify(r.n.name)} face=${r.n.face || '-'} jump=${r.n.jump || '-'} len=${r.n.text.length}: ${r.n.text}`);
}
