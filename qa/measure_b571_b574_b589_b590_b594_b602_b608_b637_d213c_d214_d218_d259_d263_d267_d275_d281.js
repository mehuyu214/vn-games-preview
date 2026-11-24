// W2 候補の着手前計測：美咲 b571／b574／b589／b590／b594／b602／b608／b637（15字・美咲の最長行）＋優奈 d213c／d214／d218／d259／d263／d267／d275／d281（14字・優奈の最長行）
// 使い方: node qa/measure_b571_b574_b589_b590_b594_b602_b608_b637_d213c_d214_d218_d259_d263_d267_d275_d281.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));
const IDS = ['b571', 'b574', 'b589', 'b590', 'b594', 'b602', 'b608', 'b637', 'd213c', 'd214', 'd218', 'd259', 'd263', 'd267', 'd275', 'd281'];
const find = id => { for (const g of GAMES) { const n = g.scenes.find(s => s.id === id); if (n) return { g: g.id, n }; } };
for (const id of IDS) {
  const r = find(id);
  if (!r) { console.log(`${id}: NOT FOUND`); continue; }
  const scenes = GAMES.find(g => g.id === r.g).scenes;
  const idx = scenes.findIndex(s => s.id === id);
  const next = scenes[idx + 1];
  console.log(`${id} [${r.g}] name=${JSON.stringify(r.n.name)} face=${r.n.face || '-'} char=${r.n.char || '-'} r18=${r.n.r18 || '-'} jump=${r.n.jump || '-'} next=${next ? next.id : '-'} len=${r.n.text.length}: ${r.n.text}`);
  console.log('   extra: ' + JSON.stringify(Object.keys(r.n).filter(k => !['id', 'name', 'text', 'face', 'char', 'jump', 'r18'].includes(k))));
  console.log('   chars: ' + [...r.n.text].map((c, i) => `${i}:${c}`).join(' '));
}
// 残数確認：美咲の15字行・優奈の14字行の総数
for (const [gid, len] of [['misaki', 15], ['yuna', 14]]) {
  const g = GAMES.find(x => x.id === gid);
  const max = g.scenes.filter(s => s.text && !s.choices && !s.branch);
  const longest = Math.max(...max.map(s => s.text.length));
  const atLen = max.filter(s => s.text.length === len).map(s => s.id);
  console.log(`${gid}: longest=${longest} ${len}字行=${atLen.length}件: ${atLen.join(',')}`);
}
