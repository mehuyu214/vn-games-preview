// W2 候補の着手前計測：美咲の13字行（14字行は0件のため次点）＋残数確認
// 使い方: node qa/measure_misaki13_b612_b614_b630_b641_b657_b659_b664_b682.js
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
const m = GAMES.find(x => x.id === 'misaki');
const m13 = m.scenes.filter(s => s.text && !s.choices && !s.branch && s.text.length === 13).map(s => s.id);
console.log(`misaki: 13字行=${m13.length}件: ${m13.join(',')}`);
for (const id of ["b612","b614","b630","b641","b657","b659","b664","b682"]) dump(id);
// 残数確認
for (const [gid, len] of [['misaki', 14], ['misaki', 13], ['yuna', 14], ['yuna', 13]]) {
  const g = GAMES.find(x => x.id === gid);
  const max = g.scenes.filter(s => s.text && !s.choices && !s.branch);
  const longest = Math.max(...max.map(s => s.text.length));
  const atLen = max.filter(s => s.text.length === len).map(s => s.id);
  console.log(`${gid}: longest=${longest} ${len}字行=${atLen.length}件: ${atLen.join(',')}`);
}
