// W2 桜 E1 再計測：中盤の緊張の山（写真館 a149-168 / 喫茶店 a187-206）の現状
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const g = GAMES.find(x => x.id === 'sakura');
const byId = {}; g.scenes.forEach(n => { byId[n.id] = n; });
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
const order = playOrder(g); const pos = {}; order.forEach((id,i)=>{pos[id]=i;});
function count(re, label) {
  const hits = g.scenes.filter(n => re.test(n.text||'')).map(n=>n.id+'@'+pos[n.id]);
  console.log(label+':', hits.length, '件', hits.join(' '));
}
count(/すれ違い|誤解|喧嘩|言い合い|衝突|勘違い/, '対立語彙');
count(/額縁|ヒビ/, '額縁のヒビ');
count(/不安|怖い|心配/, '不安語彙');
for (const [a,b] of [['a149','a168'],['a187','a206']]) {
  console.log('--- block', a, '-', b);
  for (const n of g.scenes) {
    const num = parseInt(n.id.slice(1));
    if (n.id.startsWith('a') && !isNaN(num) && num>=parseInt(a.slice(1)) && num<=parseInt(b.slice(1))) {
      console.log(' ', n.id, '@'+pos[n.id], (n.name||'')+':', JSON.stringify((n.text||'').slice(0,90)));
    }
  }
}
