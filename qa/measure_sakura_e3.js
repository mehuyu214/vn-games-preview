// W2 桜 E3 再計測：写真展当日の時系列断片化の現状
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const g = GAMES.find(x => x.id === 'sakura');
const byId = {}; g.scenes.forEach(n => { byId[n.id] = n; });
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
const order = playOrder(g); const pos = {}; order.forEach((id,i)=>{pos[id]=i;});
function count(re, label) {
  const hits = g.scenes.filter(n => re.test(n.text||'')).map(n=>n.id+'@'+pos[n.id]);
  console.log(label+':', hits.length, '件', hits.join(' '));
}
count(/回想/, '回想');
count(/写真展の前日|前日/, '前日');
count(/当日|写真展の朝|今朝/, '当日・今朝');
for (const id of ['a225','a43','a149','a86','a47','a48','a49','a50','a187','a12','a85','a226','a227']) {
  const n = byId[id];
  console.log('---', id, '@'+pos[id], 'jump', n.jump||'-', 'face', n.face||'-');
  console.log(JSON.stringify((n.text||'').slice(0,260)));
}
