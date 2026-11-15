// W2 美咲 B2/B3 再計測：妊娠確定後の「子が欲しい」矛盾（b139/b177）と
// 「ケーキの甘い香り」残留（b168/b206）。あわせて B4(b219)・C2(b84)・C3(b229) の現況確認。
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const g = GAMES.find(x => x.id === 'misaki');
const byId = {};
g.scenes.forEach(n => { byId[n.id] = n; });
console.log('misaki nodes:', g.scenes.length);
for (const id of ['b139','b177','b215','b253','b168','b206','b244','b128','b219','b38','b84','b229','b201','b79','b80']) {
  const n = byId[id];
  console.log('==', id, 'name=' + (n && n.name));
  console.log('   ', JSON.stringify(n && n.text));
}
// 妊娠確定後の「子が欲しい」出現を全編で数える
let want = [];
g.scenes.forEach(n => { if ((n.text||'').includes('子が欲しい')) want.push(n.id); });
console.log('「子が欲しい」出現ノード:', JSON.stringify(want));
let cake = [];
g.scenes.forEach(n => { if ((n.text||'').includes('ケーキの甘い香り')) cake.push(n.id); });
console.log('「ケーキの甘い香り」出現ノード:', JSON.stringify(cake));
let cafe = [];
g.scenes.forEach(n => { if ((n.text||'').includes('カフェ')) cafe.push(n.id); });
console.log('「カフェ」出現ノード:', JSON.stringify(cafe));
