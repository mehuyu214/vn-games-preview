// W2 桜 D3 再計測：悠太自身の家族（実家の両親）への言及
// 仕事は a178、将来設計は a178/a182 で最低限あり。残る家族は 0 件のはず。
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const g = GAMES.find(x => x.id === 'sakura');
const byId = {};
g.scenes.forEach(n => { byId[n.id] = n; });
const pats = ['家族', '両親', '母親', '父親', '母さん', '父さん', '実家', 'お母さん', 'お父さん', '親父', 'おふくろ', 'お袋'];
let hits = [];
g.scenes.forEach(n => {
  const t = n.text || '';
  pats.forEach(p => { if (t.includes(p)) hits.push(n.id + ':' + p); });
});
console.log('sakura nodes:', g.scenes.length);
console.log('family-related hits:', hits.length);
console.log(hits.join('\n'));
for (const id of ['a06', 'a132', 'a133', 'a135', 'a182']) {
  const n = byId[id];
  console.log('==', id, 'name=' + (n && n.name));
  console.log('   ', JSON.stringify(n && n.text));
}
