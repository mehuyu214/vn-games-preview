// e200/e238 の前後ノード確認（編集の接続チェック用）
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
for (const id of ['e200','e238']) {
  const p = pos[id];
  console.log('---', id, 'pos', p, '---');
  order.slice(p - 1, p + 3).forEach(nid => console.log(' ', nid, ':', JSON.stringify(byId[nid].text)));
}
// e162/e200/e238 の締め文の一致確認
const closers = ['e162','e200','e238'].map(id => byId[id].text.split('。').pop());
console.log('closers:', JSON.stringify(closers));
// 「胎動」「つわり」全作品での件数
GAMES.forEach(g => {
  const t = g.scenes.filter(n => /胎動/.test(n.text || '')).length;
  const s = g.scenes.filter(n => /つわり/.test(n.text || '')).length;
  console.log(g.id, '胎動:', t, 'つわり:', s);
});
