// 凛 E4 残置の再計測: タイトルモチーフ「最終電車」の反復
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
console.log('凛 全ノード:', rin.scenes.length, 'プレイ順到達:', Object.keys(pos).length);
console.log('「最終電車」:', count(/最終電車/));
console.log('「電車」:', count(/電車/));
console.log('「駅」:', count(/駅/));
console.log('「帰宅|帰り道|帰る」:', count(/帰宅|帰り道|帰る/));
