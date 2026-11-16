// e208 の文脈確認（C5 残留：中核部の身体描写の反復とお腹の変化の不在）
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const g = GAMES.find(x => x.id === 'serena');
const byId = {};
g.scenes.forEach(n => { byId[n.id] = n; });
function playOrder() {
  const order = []; const seen = new Set();
  let cur = g.scenes[0];
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id); order.push(cur.id);
    if (cur.jump) cur = byId[cur.jump];
    else if (cur.choices) cur = byId[cur.choices[0].next];
    else if (cur.branch) cur = byId[cur.branch.then];
    else { const i = g.scenes.indexOf(cur); cur = g.scenes[i + 1]; }
  }
  return order;
}
const order = playOrder();
const pos = {}; order.forEach((id,i)=>{pos[id]=i;});
for (const id of ['e132','e208']) {
  console.log('=== ' + id + ' pos=' + pos[id] + ' ===');
  console.log(byId[id].text);
}
// e208 の前後（プレイ順）
const p = pos['e208'];
console.log('--- e208 前後 ---');
for (const id of order.slice(p-2, p+3)) {
  console.log('[' + id + ' pos=' + pos[id] + '] ' + (byId[id].text||'').slice(0,120));
}
// e238（胎動）の文脈
console.log('=== e238 pos=' + pos['e238'] + ' ===');
console.log(byId['e238'].text);
// e132 と e208 の text が同一か
console.log('e132==e208:', byId['e132'].text === byId['e208'].text);
