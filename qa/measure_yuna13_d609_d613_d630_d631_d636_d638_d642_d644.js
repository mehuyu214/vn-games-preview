// W2 候補の着手前計測：優奈の13字行 d609／d613／d630／d631／d636／d638／d642／d644
// 使い方: node qa/measure_yuna13_d609_d613_d630_d631_d636_d638_d642_d644.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));
const find = id => { for (const g of GAMES) { const n = g.scenes.find(s => s.id === id); if (n) return { g: g.id, n }; } };
const dump = id => {
  const r = find(id);
  if (!r) { console.log(`${id}: NOT FOUND`); return; }
  const scenes = GAMES.find(g => g.id === r.g).scenes;
  const idx = scenes.findIndex(s => s.id === id);
  const next = scenes[idx + 1];
  console.log(`${id} [${r.g}] name=${JSON.stringify(r.n.name)} face=${r.n.face || '-'} char=${r.n.char || '-'} r18=${r.n.r18 || '-'} jump=${r.n.jump || '-'} next=${next ? next.id : '-'} len=${r.n.text.length}: ${r.n.text}`);
  console.log('   extra: ' + JSON.stringify(Object.keys(r.n).filter(k => !['id', 'name', 'text', 'face', 'char', 'jump', 'r18'].includes(k))));
  console.log('   chars: ' + [...r.n.text].map((c, i) => `${i}:${c}`).join(' '));
};
const y = GAMES.find(x => x.id === 'yuna');
const y13 = y.scenes.filter(s => s.text && !s.choices && !s.branch && s.text.length === 13).map(s => s.id);
console.log(`yuna 13字行=${y13.length}件: ${y13.join(',')}`);
const y14 = y.scenes.filter(s => s.text && !s.choices && !s.branch && s.text.length > 13).map(s => s.id);
console.log(`yuna 13字超え行=${y14.length}件: ${y14.join(',')}`);
console.log('yuna 13字行 先頭16件: ' + y13.slice(0, 16).join(','));
for (const id of ['d609', 'd613', 'd630', 'd631', 'd636', 'd638', 'd642', 'd644']) dump(id);
