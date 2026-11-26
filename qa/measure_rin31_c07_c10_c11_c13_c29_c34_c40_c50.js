// W2 凛の31字行 先頭8件の詳細ダンプ（分割位置決定用）
// 使い方: node qa/measure_rin31_c07_c10_c11_c13_c29_c34_c40_c50.js
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
for (const id of ['c07', 'c10', 'c11', 'c13', 'c29', 'c34', 'c40', 'c50']) dump(id);
const r = GAMES.find(x => x.id === 'rin');
const maxC = Math.max(...r.scenes.map(n => { const m = /^c(\d+)$/.exec(n.id); return m ? +m[1] : -1; }));
console.log(`rin 最大 c 番号=${maxC}`);
