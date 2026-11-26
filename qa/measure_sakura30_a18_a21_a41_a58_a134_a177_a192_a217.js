// W2 候補の着手前計測：桜の30字行 a18／a21／a41／a58／a134／a177／a192／a217
// 使い方: node qa/measure_sakura30_a18_a21_a41_a58_a134_a177_a192_a217.js
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
const sdlg = s.scenes.filter(x => x.text && !x.choices && !x.branch && x.name);
const s30 = sdlg.filter(x => x.text.length === 30).map(x => x.id);
console.log(`sakura 台詞30字=${s30.length}件 ${s30.join(',')}`);
console.log(`sakura 台詞31字以上=${sdlg.filter(x => x.text.length >= 31).length}件`);
const r = GAMES.find(x => x.id === 'rin');
const rdlg = r.scenes.filter(x => x.text && !x.choices && !x.branch && x.name);
console.log(`rin 台詞32字以上=${rdlg.filter(x => x.text.length >= 32).length}件`);
const se = GAMES.find(x => x.id === 'serena');
const sedlg = se.scenes.filter(x => x.text && !x.choices && !x.branch && x.name);
const seMax = Math.max(...sedlg.map(x => x.text.length));
console.log(`serena 台詞最長=${seMax}字 ${sedlg.filter(x => x.text.length === seMax).map(x => x.id).join(',')}`);
const maxA = Math.max(...s.scenes.map(n => { const m = /^a(\d+)$/.exec(n.id); return m ? +m[1] : -1; }));
console.log(`sakura 最大 a 番号=${maxA}`);
for (const id of ['a18', 'a21', 'a41', 'a58', 'a134', 'a177', 'a192', 'a217']) dump(id);
