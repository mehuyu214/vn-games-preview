// セレナ C1 深掘り: e256 の内容、e79→e80 間の GOOD ルート、e80 の文字数、e79 前後
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const serena = GAMES.find(x => x.id === 'serena');
const byId = {}; serena.scenes.forEach(n => { byId[n.id] = n; });
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
const order = playOrder(serena);
const pos = {}; order.forEach((id, i) => { pos[id] = i; });
console.log('e256:', JSON.stringify(byId['e256']));
console.log('e256 in GOOD order?', pos['e256']);
console.log('e80 len:', (byId['e80'].text || '').length, 'chars');
console.log('GOOD order e70..e80 area:');
order.slice(145, 165).forEach(id => console.log(' pos', pos[id], id, ':', JSON.stringify((byId[id].text || '').slice(0, 80))));
console.log('--- e79 前後 (pos 150-160) ---');
order.slice(150, 160).forEach(id => console.log(' pos', pos[id], id, ':', JSON.stringify(byId[id].text)));
console.log('--- e80 の直前 (pos 240-247) ---');
order.slice(240, 248).forEach(id => console.log(' pos', pos[id], id, ':', JSON.stringify(byId[id].text)));
console.log('--- 全作品の text 最長 ---');
let max = 0; GAMES.forEach(g => g.scenes.forEach(n => { if ((n.text || '').length > max) max = (n.text || '').length; }));
console.log('max text len all works:', max);
console.log('serena max:', Math.max(...serena.scenes.map(n => (n.text || '').length)));
