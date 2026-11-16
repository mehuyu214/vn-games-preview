// W2 優奈・A1 選択肢の序盤集中の解消：候補の洗い直し。
// 優奈は選択肢が d07・d12 の2か所のみ。後半で優奈が主人公に直接
// 問いかける場面、または決断の場面を探す。
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const yun = GAMES.find(x => x.id === 'yuna');
const byId = {}; yun.scenes.forEach(n => { byId[n.id] = n; });
function playOrder(g) {
  const order = []; const seen = new Set(); let cur = g.scenes[0];
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id); order.push(cur.id);
    if (cur.jump) cur = byId[cur.jump];
    else if (cur.choice) cur = byId[cur.choice[0].jump];
    else if (cur.branch) cur = byId[cur.branch.then];
    else { const i = g.scenes.indexOf(cur); cur = g.scenes[i + 1]; }
  }
  return order;
}
const order = playOrder(yun);
const pos = {}; order.forEach((id, i) => { pos[id] = i; });
console.log('優奈 全', yun.scenes.length, 'ノード / プレイ順', order.length);
console.log('選択肢:', yun.scenes.filter(n => n.choice).map(n => n.id + '@' + pos[n.id]).join(' '));
console.log('最大ID:', yun.scenes.map(n => n.id).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))).slice(-1)[0]);
console.log('=== 後半の問いかけ候補（pos>=100、「？」を含む）===');
for (const id of order) {
  const n = byId[id];
  if (pos[id] < 100) continue;
  const t = n.text || '';
  if (t.includes('？') && n.name === '優奈') {
    console.log(' ', id, '@' + pos[id], 'jump=' + (n.jump || ''), ':', JSON.stringify(t.slice(0, 140)));
  }
}
console.log('=== d199-d216 の流れ ===');
for (const id of ['d199', 'd200', 'd201', 'd202', 'd203', 'd216']) {
  const n = byId[id];
  console.log(' ', id, '@' + pos[id], 'name=' + n.name, 'jump=' + (n.jump || ''), ':', JSON.stringify((n.text || '').slice(0, 130)));
}
console.log('「栞」出現ノード数:', yun.scenes.filter(n => (n.text || '').includes('栞')).length);
