// セレナ C5 残留: 妊娠経過の指標(つわり/胎動/月数/お腹の変化)、マルタ、使用人の扱い、e195 の前のめり
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
const pos = {}; playOrder(serena).forEach((id, i) => { pos[id] = i; });
function count(re) { return serena.scenes.filter(n => re.test(n.text || '')).map(n => n.id + '@' + pos[n.id]); }
console.log('「つわり」:', count(/つわり/));
console.log('「胎動」:', count(/胎動/));
console.log('「お腹」:', count(/お腹/));
console.log('「マルタ」:', count(/マルタ/));
console.log('「公然」:', count(/公然/));
console.log('「数か月／何か月／月日」:', count(/数か月|何か月|月日が/));
console.log('「住み込み」:', count(/住み込み/));
for (const id of ['e195','e104','e62','e63','e64']) {
  console.log(id, '@' + pos[id], ':', JSON.stringify(byId[id] && byId[id].text));
}
