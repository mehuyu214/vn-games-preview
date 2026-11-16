// 凛 E4 残置の再計測: タイトルモチーフ「最終電車」の反復
// 現状: c06（冒頭）・c81（GOOD END 回収）のみ。c81 は前ランまでで回収済み。
// 残るは中盤（通学・帰宅・街の描写）での反復が 0 件かどうか。
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
console.log('候補ブロック本文（研究室の朝 c181-200 / 下見編 c105-124 / 休憩編 c219-238）:');
for (const id of ['c181','c182','c183','c184','c185','c186','c187','c188','c189','c190','c191','c192','c193','c194','c195','c196','c197','c198','c199','c200','c105','c106','c107','c108','c219','c220','c221','c222','c223','c224','c225']) {
  const n = byId[id];
  console.log(' ', id, '@' + pos[id], 'name=' + (n && n.name), ':', JSON.stringify(n && n.text));
}
