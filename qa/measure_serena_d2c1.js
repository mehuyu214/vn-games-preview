// 再計測: セレナ D2(バラ園の夢の未回収) / C1(妊娠確定イベント不在) / C2(結婚式当日不在) + 桜 E4(感慨の反復)
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const serena = GAMES.find(x => x.id === 'serena');
const sakura = GAMES.find(x => x.id === 'sakura');
const sn = {}; serena.scenes.forEach(n => { sn[n.id] = n; });
const an = {}; sakura.scenes.forEach(n => { an[n.id] = n; });
function count(nodes, re) { return nodes.filter(n => re.test(n.text || '')).map(n => n.id); }
function playOrder(g) {
  const byId = {}; g.scenes.forEach(n => { byId[n.id] = n; });
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
const spos = {}; playOrder(serena).forEach((id, i) => { spos[id] = i; });
console.log('--- セレナ: バラ園の夢 ---');
console.log('「バラ園」:', count(serena.scenes, /バラ園/).map(id => id + '@' + spos[id]).join(' '));
console.log('「一番最初のお客さん」:', count(serena.scenes, /一番最初のお客さん/).map(id => id + '@' + spos[id]).join(' '));
console.log('「白いバラ」:', count(serena.scenes, /白いバラ/).map(id => id + '@' + spos[id]).join(' '));
console.log('--- セレナ: 妊娠確定 ---');
console.log('「判明」:', count(serena.scenes, /判明/));
console.log('「検査」:', count(serena.scenes, /検査/));
console.log('「医師／医者／診断」:', count(serena.scenes, /医師|医者|診断/));
console.log('「宿して」:', count(serena.scenes, /宿して/));
console.log('--- セレナ: 結婚式 ---');
console.log('「結婚式」:', count(serena.scenes, /結婚式/).map(id => id + '@' + spos[id]).join(' '));
console.log('--- e80/e79/e255/e154/e151/e234/e88/e162 現行文 ---');
for (const id of ['e80','e79','e255','e154','e151','e234','e88','e162']) {
  console.log(id, '@' + spos[id], ':', JSON.stringify(sn[id] && sn[id].text));
}
const apos = {}; playOrder(sakura).forEach((id, i) => { apos[id] = i; });
console.log('--- 桜 E4: 感慨の反復 ---');
console.log('「全部見て」:', count(sakura.scenes, /全部見て/).map(id => id + '@' + apos[id]).join(' '));
console.log('「全部そこにある」:', count(sakura.scenes, /全部そこにある/).map(id => id + '@' + apos[id]).join(' '));
console.log('「5年間」:', count(sakura.scenes, /5年間/).map(id => id + '@' + apos[id]).join(' '));
for (const id of ['a49','a165','a195','a205','a12']) {
  console.log(id, '@' + apos[id], ':', JSON.stringify(an[id] && an[id].text));
}
