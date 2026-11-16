// 凛 C2: 妊娠経過の身体指標の停滞の再計測
// c80 陽性判明から c239 子供部屋完成まで、つわり／胎動／通院／月数の明示が
// どこにあるか（ないか）を洗い出す。お腹への言及ノードの本文も確認する。
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
console.log('陽性判明 c80 @' + pos['c80'], ':', JSON.stringify(byId['c80'] && byId['c80'].text));
console.log('「つわり」:', count(/つわり/));
console.log('「胎動」:', count(/胎動/));
console.log('「通院|産科|検診|病院」:', count(/通院|産科|検診|病院/));
console.log('「か月|ヶ月|数か月」:', count(/か月|ヶ月|数か月/));
console.log('「お腹」ノード本文:');
for (const id of count(/お腹/).map(s => s.split('@')[0])) {
  console.log(' ', id, '@' + pos[id], ':', JSON.stringify(byId[id].text));
}
console.log('ブロック導入:');
for (const id of ['c125','c126','c127','c163','c164','c165','c201','c202','c203','c239','c240','c241','c242']) {
  console.log(' ', id, '@' + pos[id], ':', JSON.stringify(byId[id] && byId[id].text));
}
