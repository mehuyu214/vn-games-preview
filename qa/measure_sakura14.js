// W2 候補の着手前計測：桜の14字行（先頭8件）
// 使い方: node qa/measure_sakura14.js
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
for (const gid of ['sakura', 'misaki', 'rin', 'serena', 'yuna']) {
  const g = GAMES.find(x => x.id === gid);
  const dlg = g.scenes.filter(s => s.text && !s.choices && !s.branch && s.name);
  const c13 = dlg.filter(s => s.text.length === 13).map(s => s.id);
  const c14 = dlg.filter(s => s.text.length === 14).map(s => s.id);
  const c15 = dlg.filter(s => s.text.length > 14).map(s => s.id);
  console.log(`${gid}: 台詞13字=${c13.length}件 ${c13.join(',')} / 14字=${c14.length}件 ${c14.join(',')} / 15字超=${c15.length}件`);
}
for (const id of ['a06', 'a07', 'a27', 'a36', 'a39', 'a64', 'a73', 'a78']) dump(id);
