const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const g = GAMES.find(x => x.id === 'yuna');
const byId = {};
g.scenes.forEach(n => { byId[n.id] = n; });
for (const id of ['d217','d221','d226','d228','d229','d230','d231','d232','d16','d188','d149','d154','d80']) {
  const n = byId[id];
  console.log('==', id, 'name=' + (n && n.name), 'keys=' + (n ? Object.keys(n).join(',') : 'MISSING'));
  console.log('   ', JSON.stringify(n && n.text));
}
// GOOD route play order (love-max picks), same resolver logic as sim_all_routes.js
function applySet(flags, s) { if (!s) return; for (const k of Object.keys(s)) flags[k] = (typeof flags[k] === 'number' && typeof s[k] === 'number' && k === 'love') ? Math.max(flags[k], s[k]) : s[k]; }
function resolve(flags, id) {
  let gu = 0;
  while (gu++ < 100) {
    const n = byId[id]; if (!n) return null;
    if (n.branch) { const v = flags[n.branch.flag] || 0; id = (n.branch.min !== undefined ? v >= n.branch.min : v === n.branch.eq) ? n.branch.then : n.branch.else; continue; }
    if (n.jump && !n.text && !n.choice) { id = n.jump; continue; }
    return n;
  }
  return null;
}
const idx = new Map(g.scenes.map((s, i) => [s.id, i]));
const flags = {}; let order = []; let n = resolve(flags, g.scenes[0].id); let steps = 0;
while (n && steps++ < 4000) {
  order.push(n.id);
  if (n.set) applySet(flags, n.set);
  if (n.end) break;
  if (n.choice) {
    // pick the love-max option (GOOD route)
    let best = 0, bestLove = -1;
    n.choice.forEach((c, i) => { const v = (c.set && c.set.love) || 0; if (v > bestLove) { bestLove = v; best = i; } });
    const c = n.choice[best]; applySet(flags, c.set);
    n = resolve(flags, c.jump); continue;
  }
  if (n.jump) { n = resolve(flags, n.jump); continue; }
  const nx = g.scenes[idx.get(n.id) + 1];
  n = nx ? resolve(flags, nx.id) : null;
}
for (const id of ['d229','d230','d16','d217','d188','d149','d154','d80','d124','d141']) {
  console.log('pos', id, order.indexOf(id), '/', order.length);
}
console.log('GOOD route len', order.length);
// count "この子" mentions in yuna before d16 in play order
const before16 = order.slice(0, order.indexOf('d16'));
let hits = [];
before16.forEach(id => { const t = byId[id] && byId[id].text || ''; if (t.includes('この子')) hits.push(id); });
console.log('この子 before confession d16:', JSON.stringify(hits));
