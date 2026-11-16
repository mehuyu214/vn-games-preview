// 凛 C2 残置の再計測: 妊娠経過の「月数」の明示
// 前ランまでで つわり(c97)・検診(c201)・胎動(c204) を追加済み。残るは月数の明示。
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
console.log('凛 全ノード:', rin.scenes.length, 'プレイ順到達:', Object.keys(pos).length);
console.log('「か月|ヶ月|月数」:', count(/か月|ヶ月|月数/));
console.log('「妊娠\\d」:', count(/妊娠\d/));
console.log('「数か月」:', count(/数か月/));
console.log('「つわり」:', count(/つわり/));
console.log('「胎動」:', count(/胎動/));
console.log('「検診」:', count(/検診/));
console.log('候補ノード本文:');
for (const id of ['c65','c68','c69','c80','c81','c163','c177','c201','c203','c204','c239','c240','c242']) {
  const n = byId[id];
  console.log(' ', id, '@' + pos[id], 'name=' + (n && n.name), ':', JSON.stringify(n && n.text));
}
