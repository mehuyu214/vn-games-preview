// 凛 C2 残置の再計測: つわり / 通院(産科・検診・病院) の明示
// 前ランで c204 に胎動を追加済み。残るは つわり / 通院の明示 0 件。
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const rin = GAMES.find(x => x.id === 'rin');
const byId = {}; rin.scenes.forEach(n => { byId[n.id] = n; });
function playOrder(g) {
  const order = []; const seen = new Set(); let cur = g.scenes[0];
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id); order.push(cur.id);
    if (cur.jump) cur = byId[cur.jump];
    else if (cur.choices) cur = byId[cur.choices[0].next];
    else if (cur.branch) cur = byId[cur.branch.then];
    else { const i = g.scenes.indexOf(cur); cur = g.scenes[i + 1]; }
  }
  return order;
}
const pos = {}; playOrder(rin).forEach((id, i) => { pos[id] = i; });
function count(re) { return rin.scenes.filter(n => re.test(n.text || '')).map(n => n.id + '@' + pos[n.id]); }
console.log('「つわり」:', count(/つわり/));
console.log('「胎動」:', count(/胎動/));
console.log('「通院|産科|検診|病院」:', count(/通院|産科|検診|病院/));
console.log('「か月|ヶ月|数か月」:', count(/か月|ヶ月|数か月/));
console.log('候補ノード本文:');
for (const id of ['c97','c99','c125','c126','c133','c177','c201','c204','c239']) {
  console.log(' ', id, '@' + pos[id], ':', JSON.stringify(byId[id] && byId[id].text));
}
