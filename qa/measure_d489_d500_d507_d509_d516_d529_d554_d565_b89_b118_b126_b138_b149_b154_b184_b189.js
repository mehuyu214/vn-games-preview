// W2 候補の着手前計測：優奈 d489／d500／d507／d509／d516／d529／d554／d565（14字・優奈の最長行の続き）＋美咲の14字行（次点最長行）の先頭8件
// 使い方: node qa/measure_d489_d500_d507_d509_d516_d529_d554_d565_b89_b118_b126_b138_b149_b154_b184_b189.js
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
for (const id of ['d489', 'd500', 'd507', 'd509', 'd516', 'd529', 'd554', 'd565']) dump(id);
// 美咲の14字行の先頭8件
const m = GAMES.find(x => x.id === 'misaki');
const m14 = m.scenes.filter(s => s.text && !s.choices && !s.branch && s.text.length === 14).map(s => s.id);
console.log(`misaki: 14字行=${m14.length}件: ${m14.join(',')}`);
for (const id of m14.slice(0, 8)) dump(id);
// 残数確認
for (const [gid, len] of [['misaki', 14], ['yuna', 14]]) {
  const g = GAMES.find(x => x.id === gid);
  const max = g.scenes.filter(s => s.text && !s.choices && !s.branch);
  const longest = Math.max(...max.map(s => s.text.length));
  const atLen = max.filter(s => s.text.length === len).map(s => s.id);
  console.log(`${gid}: longest=${longest} ${len}字行=${atLen.length}件: ${atLen.join(',')}`);
}
