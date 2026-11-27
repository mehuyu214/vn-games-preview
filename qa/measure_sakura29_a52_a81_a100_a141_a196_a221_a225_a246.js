// W2 桜の29字行 次の8件の詳細ダンプ（分割位置決定用）
// 使い方: node qa/measure_sakura29_a52_a81_a100_a141_a196_a221_a225_a246.js
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
for (const id of ['a52', 'a81', 'a100', 'a141', 'a196', 'a221', 'a225', 'a246']) dump(id);
const s = GAMES.find(x => x.id === 'sakura');
const maxA = Math.max(...s.scenes.map(n => { const m = /^a(\d+)$/.exec(n.id); return m ? +m[1] : -1; }));
console.log(`sakura 最大 a 番号=${maxA}`);
// 全作品の最長台詞を再計測（台詞＝text あり・choices/branch なし・name あり）
for (const g of GAMES) {
  const dlg = g.scenes.filter(x => x.text && !x.choices && !x.branch && x.name);
  const mx = Math.max(...dlg.map(x => x.text.length));
  const ids = dlg.filter(x => x.text.length === mx).map(x => x.id);
  console.log(`${g.id}: 台詞最長=${mx}字 ${ids.length}件 [${ids.join('・')}]`);
}
