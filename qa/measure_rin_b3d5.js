// 凛編の残留再計測: B3 ワイン残留(γ/δ)、D5 凛さん逆行、C2 妊娠経過指標、B5 翌朝二重提示
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
console.log('「ワイン」:', count(/ワイン/));
console.log('「凛さん」(悠太発話):', rin.scenes.filter(n => n.name === '悠太' && /凛さん/.test(n.text || '')).map(n => n.id + '@' + pos[n.id]));
console.log('「つわり」:', count(/つわり/));
console.log('「胎動」:', count(/胎動/));
console.log('「お腹」:', count(/お腹/));
console.log('「数か月」:', count(/数か月|何か月/));
console.log('「子が欲しい」:', count(/子が欲しい/));
for (const id of ['c206','c244','c28','c181','c182','c183','c184','c42','c219','c65','c66','c125','c163','c201','c239']) {
  console.log(id, '@' + pos[id], ':', JSON.stringify(byId[id] && byId[id].text));
}
