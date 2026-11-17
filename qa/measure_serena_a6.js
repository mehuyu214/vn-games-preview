// W2 セレナ A6 再計測：NORMAL END（e18）の e15 経由での接続の粗さ
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const g = GAMES.find(x => x.id === 'serena');
const byId = {}; g.scenes.forEach(n => { byId[n.id] = n; });
function playOrder(g, pick) {
  const order = []; const seen = new Set(); let cur = g.scenes[0];
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id); order.push(cur.id);
    if (cur.jump) cur = byId[cur.jump];
    else if (cur.choice) cur = byId[cur.choice[pick(cur.choice)].jump];
    else if (cur.branch) cur = byId[cur.branch.then];
    else { const i = g.scenes.indexOf(cur); cur = g.scenes[i + 1]; }
  }
  return order;
}
const good = playOrder(g, () => 0); const posG = {}; good.forEach((id,i)=>{posG[id]=i;});
const neg15 = playOrder(g, (ch) => ch[1] && ch[1].text.includes('おやすみなさい') ? 1 : 0);
console.log('GOOD route len:', good.length);
console.log('e15 消極 route tail:', neg15.slice(neg15.indexOf('e15'), neg15.indexOf('e15') + 6).join(' -> '));
for (const id of ['e06','e08','e13','e15','e18']) {
  const n = byId[id];
  console.log('---', id, 'GOOD@'+posG[id], JSON.stringify(n).slice(0, 320));
}
console.log('e18 への到達経路: e13 else / e15 消極 choice');
console.log('e15 消極の直後が e18 直行か:', byId['e15'].choice[1].jump === 'e18');
console.log('e08（e06 消極の反応ノード）あり:', !!byId['e08'], 'e15 消極の反応ノードあり:', g.scenes.some(n => n.jump === 'e18' && n.id !== 'e13'));
