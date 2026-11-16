// W2 凛・A1 選択肢の序盤集中の解消：候補の洗い直し。
// 凛は選択肢が c07・c17 の2か所のみ。後半で凛が主人公に直接
// 問いかける場面、または決断の場面を探す。
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const rin = GAMES.find(x => x.id === 'rin');
const byId = {}; rin.scenes.forEach(n => { byId[n.id] = n; });
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
const order = playOrder(rin);
const pos = {}; order.forEach((id, i) => { pos[id] = i; });
console.log('凛 全', rin.scenes.length, 'ノード / プレイ順', order.length);
console.log('選択肢:', rin.scenes.filter(n => n.choice).map(n => n.id + '@' + pos[n.id]).join(' '));
console.log('最大ID:', rin.scenes.map(n => n.id).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))).slice(-1)[0]);
console.log('=== 後半の問いかけ候補（pos>=100、「？」を含む・凛の発話）===');
for (const id of order) {
  const n = byId[id];
  if (pos[id] < 100) continue;
  const t = n.text || '';
  if (t.includes('？') && n.name === '凛') {
    console.log(' ', id, '@' + pos[id], 'jump=' + (n.jump || ''), ':', JSON.stringify(t.slice(0, 140)));
  }
}
console.log('=== 「名前」言及ノード ===');
for (const id of order) {
  const n = byId[id];
  const t = n.text || '';
  if (t.includes('名前') && pos[id] >= 100) {
    console.log(' ', id, '@' + pos[id], 'name=' + n.name, ':', JSON.stringify(t.slice(0, 130)));
  }
}
