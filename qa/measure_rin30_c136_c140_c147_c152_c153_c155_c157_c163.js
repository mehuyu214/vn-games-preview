// W2 凛の30字行 c136／c140／c147／c152／c153／c155／c157／c163 の詳細ダンプ（分割位置決定用）
// 使い方: node qa/measure_rin30_c136_c140_c147_c152_c153_c155_c157_c163.js
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
for (const id of ['c136', 'c140', 'c147', 'c152', 'c153', 'c155', 'c157', 'c163']) dump(id);
const r = GAMES.find(x => x.id === 'rin');
const maxC = Math.max(...r.scenes.map(n => { const m = /^c(\d+)$/.exec(n.id); return m ? +m[1] : -1; }));
console.log(`rin 最大 c 番号=${maxC}`);
// 全作品の最長台詞を再計測（台詞＝text あり・choices/branch なし・name あり）
for (const g of GAMES) {
  const dlg = g.scenes.filter(x => x.text && !x.choices && !x.branch && x.name);
  const mx = Math.max(...dlg.map(x => x.text.length));
  const ids = dlg.filter(x => x.text.length === mx).map(x => x.id);
  console.log(`${g.id}: 台詞最長=${mx}字 ${ids.length}件 [${ids.join('・')}]`);
}
