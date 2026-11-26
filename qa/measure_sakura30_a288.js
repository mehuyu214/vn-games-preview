// W2 候補の着手前計測：桜の30字行 a288（残り1件）＋他作品の最長確認
// 使い方: node qa/measure_sakura30_a288.js
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
for (const g of GAMES) {
  const dlg = g.scenes.filter(x => x.text && !x.choices && !x.branch && x.name);
  const max = Math.max(...dlg.map(x => x.text.length));
  const atMax = dlg.filter(x => x.text.length === max).map(x => x.id);
  console.log(`${g.id} 台詞最長=${max}字 ${atMax.length}件 ${atMax.join(',')}`);
}
const s = GAMES.find(x => x.id === 'sakura');
const sdlg = s.scenes.filter(x => x.text && !x.choices && !x.branch && x.name);
console.log(`sakura 台詞29字=${sdlg.filter(x => x.text.length === 29).length}件 ${sdlg.filter(x => x.text.length === 29).map(x => x.id).join(',')}`);
const maxA = Math.max(...s.scenes.map(n => { const m = /^a(\d+)$/.exec(n.id); return m ? +m[1] : -1; }));
console.log(`sakura 最大 a 番号=${maxA}`);
dump('a288');
