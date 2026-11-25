// W2 候補の着手前計測：優奈の13字行 d153／d175／d197／d199／d217／d221／d226／d230
// 使い方: node qa/measure_yuna13_d153_d175_d197_d199_d217_d221_d226_d230.js
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
for (const [gid, len] of [['yuna', 14], ['yuna', 13]]) {
  const g = GAMES.find(x => x.id === gid);
  const max = g.scenes.filter(s => s.text && !s.choices && !s.branch);
  const longest = Math.max(...max.map(s => s.text.length));
  const atLen = max.filter(s => s.text.length === len).map(s => s.id);
  console.log(`${gid}: longest=${longest} ${len}字行=${atLen.length}件: ${atLen.join(',')}`);
}
const y = GAMES.find(x => x.id === 'yuna');
const y13 = y.scenes.filter(s => s.text && !s.choices && !s.branch && s.text.length === 13).map(s => s.id);
console.log('yuna 13字行 7〜14件目: ' + y13.slice(6, 14).join(','));
for (const id of ['d153', 'd175', 'd197', 'd199', 'd217', 'd221', 'd226', 'd230']) dump(id);
