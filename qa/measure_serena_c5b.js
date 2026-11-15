// セレナ C5: α〜δブロックの導入ノードと「お腹」含有ノードの現行文を確認
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
// ブロック導入(――で始まる地の文)を pos 165-247 で列挙
order.slice(165, 248).forEach(id => {
  const t = byId[id].text || '';
  if (t.startsWith('――')) console.log(' pos', pos[id], id, ':', JSON.stringify(t.slice(0, 120)));
});
console.log('--- 「お腹」含有ノードの全文 (pos 190-210) ---');
['e165','e170','e173','e175','e177'].forEach(id => console.log(id, '@' + pos[id], ':', JSON.stringify(byId[id].text)));
