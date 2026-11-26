// W2 候補の着手前計測：凛の残る34字行 c273／c276／c279 ＋ 桜の31字行先頭5件
// 使い方: node qa/measure_rin34_sakura31_c273_c276_c279.js
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
const s = GAMES.find(x => x.id === 'sakura');
const dlg = s.scenes.filter(x => x.text && !x.choices && !x.branch && x.name);
const s31 = dlg.filter(x => x.text.length === 31).map(x => x.id);
console.log(`sakura 台詞31字=${s31.length}件 ${s31.join(',')}`);
const r = GAMES.find(x => x.id === 'rin');
const rdlg = r.scenes.filter(x => x.text && !x.choices && !x.branch && x.name);
const r35 = rdlg.filter(x => x.text.length === 35).map(x => x.id);
const r34 = rdlg.filter(x => x.text.length === 34).map(x => x.id);
console.log(`rin 台詞35字=${r35.length}件 ${r35.join(',')} / 34字=${r34.length}件 ${r34.join(',')}`);
for (const id of ['c273', 'c276', 'c279']) dump(id);
for (const id of s31.slice(0, 5)) dump(id);
