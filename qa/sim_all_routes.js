const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
// engine.js の applySet と同じ代入仕様（love の max 特例は 2026-11-17 に除去）
function applySet(flags, s) { if (!s) return; for (const k of Object.keys(s)) flags[k] = s[k]; }
function simulate(g, picks) {
  const idx = new Map(g.scenes.map((s, i) => [s.id, i]));
  const resolve = (flags, id) => { let gu = 0; while (gu++ < 100) { const n = g.scenes[idx.get(id)]; if (!n) return null;
    if (n.branch) { const v = flags[n.branch.flag] || 0; id = (n.branch.min !== undefined ? v >= n.branch.min : v === n.branch.eq) ? n.branch.then : n.branch.else; continue; }
    if (n.jump && !n.text && !n.choice) { id = n.jump; continue; } return n; } return null; };
  const flags = {}; const visited = new Set(); let n = resolve(flags, g.scenes[0].id); let steps = 0;
  while (n && steps++ < 4000) { visited.add(n.id); if (n.set) applySet(flags, n.set);
    if (n.end) return { end: n.id, visited };
    if (n.choice) { const c = n.choice[picks[n.id] ?? 0]; if (!c) return { end: null, visited }; applySet(flags, c.set); n = resolve(flags, c.jump); continue; }
    if (n.jump) { n = resolve(flags, n.jump); continue; }
    const nx = g.scenes[idx.get(n.id) + 1]; n = nx ? resolve(flags, nx.id) : null; }
  return { end: null, visited };
}
for (const g of GAMES) {
  const choiceNodes = g.scenes.filter(s => s.choice);
  const combos = 1 << choiceNodes.reduce((a, s) => a + s.choice.length - 1, 0); // not exact; use product enumeration below
  // enumerate all pick combinations via recursion over choice nodes (index per node)
  let assignments = [{}];
  for (const cn of choiceNodes) { const next = []; for (const a of assignments) for (let i = 0; i < cn.choice.length; i++) next.push({ ...a, [cn.id]: i }); assignments = next; }
  const ends = new Set(); const covered = new Set(); let failed = 0;
  for (const a of assignments) { const r = simulate(g, a); if (r.end) ends.add(r.end); else failed++; r.visited.forEach(v => covered.add(v)); }
  const endIds = g.scenes.filter(s => s.end).map(s => s.id);
  console.log(`${g.id}: routes=${assignments.length} ends reached=${[...ends].sort().join(',')} (all ends: ${endIds.join(',')}) failed=${failed} coverage=${covered.size}/${g.scenes.length}`);
}

// uncovered node detail
for (const g of GAMES) {
  const choiceNodes = g.scenes.filter(s => s.choice);
  let assignments = [{}];
  for (const cn of choiceNodes) { const next = []; for (const a of assignments) for (let i = 0; i < cn.choice.length; i++) next.push({ ...a, [cn.id]: i }); assignments = next; }
  const covered = new Set();
  for (const a of assignments) simulate(g, a).visited.forEach(v => covered.add(v));
  const missing = g.scenes.map(s => s.id).filter(id => !covered.has(id));
  console.log(g.id, 'uncovered:', missing.join(',') || 'none');
}
