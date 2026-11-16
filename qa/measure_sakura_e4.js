// W2 桜 E4 再計測：「わたしの5年間、全部見て／全部そこにある」の反復
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const g = GAMES.find(x => x.id === 'sakura');
const byId = {};
g.scenes.forEach(n => { byId[n.id] = n; });
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
const order = playOrder(g);
const pos = {}; order.forEach((id, i) => { pos[id] = i; });
console.log('sakura nodes:', g.scenes.length, 'プレイ順到達:', order.length);
function count(re, label) {
  const hits = g.scenes.filter(n => re.test(n.text || '')).map(n => n.id + '@' + pos[n.id]);
  console.log(label + ':', hits.length, '件', hits.join(' '));
}
count(/5年間/, '「5年間」');
count(/全部そこにある/, '「全部そこにある」');
count(/全部見て/, '「全部見て」');
count(/全部、そこにある/, '「全部、そこにある」');
for (const id of ['a49','a165','a195','a205']) {
  const n = byId[id];
  console.log(' ', id, '@' + pos[id], ':', JSON.stringify(n && n.text || ''));
}
