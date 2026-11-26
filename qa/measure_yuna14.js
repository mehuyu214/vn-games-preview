// W2 候補の着手前計測：優奈の14字行（13字行は0件になったため次は14字）
// 使い方: node qa/measure_yuna14.js
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
const y14 = y.scenes.filter(s => s.text && !s.choices && !s.branch && s.text.length === 14).map(s => s.id);
console.log(`yuna 14字行=${y14.length}件: ${y14.join(',')}`);
const y15 = y.scenes.filter(s => s.text && !s.choices && !s.branch && s.text.length > 14).map(s => s.id);
console.log(`yuna 14字超え行=${y15.length}件: ${y15.join(',')}`);
const m = GAMES.find(x => x.id === 'misaki');
const m14 = m.scenes.filter(s => s.text && !s.choices && !s.branch && s.text.length === 14).map(s => s.id);
console.log(`misaki 14字行=${m14.length}件: ${m14.join(',')}`);
const s = GAMES.find(x => x.id === 'sakura');
const s14 = s.scenes.filter(s => s.text && !s.choices && !s.branch && s.text.length === 14).map(s => s.id);
console.log(`sakura 14字行=${s14.length}件: ${s14.join(',')}`);
for (const id of y14.slice(0, 8)) dump(id);
