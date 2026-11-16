// 桜 B4 賛辞の反復 / D5 店主の独立性 / E3 時系列の再計測
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const sak = GAMES.find(x => x.id === 'sakura');
const byId = {}; sak.scenes.forEach(n => { byId[n.id] = n; });
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
const pos = {}; playOrder(sak).forEach((id, i) => { pos[id] = i; });
function count(re) { return sak.scenes.filter(n => re.test(n.text || '')).map(n => n.id + '@' + pos[n.id]); }
console.log('桜 全ノード:', sak.scenes.length, 'プレイ順到達:', Object.keys(pos).length);
console.log('「人を惹きつける力がある」:', count(/人を惹きつける力がある/));
console.log('「惹きつける」:', count(/惹きつける/));
console.log('「素晴らしい写真」:', count(/素晴らしい/));
console.log('「すごい」:', count(/すごい/));
console.log('「才能」:', count(/才能/));
console.log('B4候補ノード本文:');
for (const id of ['a88','a160','a163','a196','a236','a12','a13','a14']) {
  const n = byId[id];
  console.log(' ', id, '@' + pos[id], 'name=' + (n && n.name), ':', JSON.stringify(n && n.text));
}
console.log('D5 店主ブロック a155-a160:');
for (const id of ['a155','a156','a157','a158','a159','a160']) {
  const n = byId[id];
  console.log(' ', id, '@' + pos[id], 'name=' + (n && n.name), ':', JSON.stringify(n && n.text));
}
console.log('E3 時系列マーカー:');
for (const id of ['a225','a43','a149','a86','a47','a48','a49','a50','a187','a12']) {
  const n = byId[id];
  console.log(' ', id, '@' + pos[id], 'name=' + (n && n.name), ':', JSON.stringify(n && n.text));
}
