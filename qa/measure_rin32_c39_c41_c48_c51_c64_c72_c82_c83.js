// W2 候補の着手前計測：凛の32字行 c39／c41／c48／c51／c64／c72／c82／c83
// 使い方: node qa/measure_rin32_c05_c08_c12_c15_c21_c27_c31_c37.js
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
const r = GAMES.find(x => x.id === 'rin');
const rdlg = r.scenes.filter(x => x.text && !x.choices && !x.branch && x.name);
const r32 = rdlg.filter(x => x.text.length === 32).map(x => x.id);
console.log(`rin 台詞32字=${r32.length}件 ${r32.join(',')}`);
console.log(`rin 台詞33字以上=${rdlg.filter(x => x.text.length >= 33).length}件`);
const s = GAMES.find(x => x.id === 'sakura');
const sdlg = s.scenes.filter(x => x.text && !x.choices && !x.branch && x.name);
console.log(`sakura 台詞31字以上=${sdlg.filter(x => x.text.length >= 31).length}件`);
const maxC = Math.max(...r.scenes.map(n => { const m = /^c(\d+)$/.exec(n.id); return m ? +m[1] : -1; }));
console.log(`rin 最大 c 番号=${maxC}`);
for (const id of ['c39', 'c41', 'c48', 'c51', 'c64', 'c72', 'c82', 'c83']) dump(id);
