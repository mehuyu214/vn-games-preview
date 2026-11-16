// W2 セレナ C2 再計測：結婚式当日は描かれているか（e255→e80 のジャンプ区間）
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const g = GAMES.find(x => x.id === 'serena');
const byId = {};
g.scenes.forEach(n => { byId[n.id] = n; });
console.log('serena nodes:', g.scenes.length);

// GOOD ルートのプレイ順
function playOrder() {
  const order = []; const seen = new Set();
  let cur = g.scenes[0];
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id); order.push(cur.id);
    if (cur.jump) cur = byId[cur.jump];
    else if (cur.choices) cur = byId[cur.choices[0].next];
    else if (cur.branch) cur = byId[cur.branch.then];
    else { const i = g.scenes.indexOf(cur); cur = g.scenes[i + 1]; }
  }
  return order;
}
const order = playOrder();
const pos = {}; order.forEach((id, i) => { pos[id] = i; });
console.log('play order len:', order.length);

for (const id of ['e234','e88','e255','e256','e80','e81']) {
  const n = byId[id];
  console.log('=== ' + id + ' pos=' + pos[id] + ' ===');
  console.log(n ? (n.text || '(no text)') : '(missing)');
}
for (const kw of ['結婚式','白いバラのアーチ','誓い','ウェディング','式当日','花嫁','当日']) {
  const hits = g.scenes.filter(n=>(n.text||'').includes(kw)).map(n=>n.id);
  console.log(kw + ': ' + hits.length + '件 ' + hits.join(','));
}
// e255 の次はどこへ行くか
console.log('e255 jump:', byId['e255'] && byId['e255'].jump, 'next:', byId['e255'] && byId['e255'].next);
console.log('e80 の直前 (play order):', order.slice(pos['e80']-3, pos['e80']+1).join(' -> '));
