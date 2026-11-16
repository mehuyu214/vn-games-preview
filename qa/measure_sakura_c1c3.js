// 桜 C1/C2/C3/B5/D4 の残留再計測
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
console.log('C1 季節: 「桜の花びらが静かに舞」:', count(/桜の花びらが静かに舞/));
console.log('C1 「桜が舞」:', count(/桜が舞/));
console.log('C1 「夏」:', count(/夏/));
console.log('C1 「秋」:', count(/秋/));
console.log('C1 「暑」:', count(/暑/));
console.log('C3 「仕事」:', count(/仕事/));
console.log('C3 「会社」:', count(/会社/));
console.log('C3 「職場」:', count(/職場/));
console.log('C3 「出勤」:', count(/出勤/));
console.log('C3 「新社会人」:', count(/新社会人/));
console.log('B5 「抱き合ったまま眠りに落ちる」:', count(/抱き合ったまま眠りに落ちる/));
console.log('B5 「鼓動が、少しだけ早い」:', count(/鼓動が、少しだけ早い/));
console.log('B5 「桜の香り」:', count(/桜の香り/));
console.log('B3 「頑張れる」:', count(/頑張れる/));
console.log('C2 a93/a110/a131:');
for (const id of ['a06','a93','a110','a131','a01','a02']) {
  const n = byId[id];
  console.log(' ', id, '@' + pos[id], 'name=' + (n && n.name), ':', JSON.stringify(n && n.text));
}
// D4: a111-a130 の台詞が「……」で始まる割合
let dots = 0, total = 0;
for (let i = 111; i <= 130; i++) {
  const n = byId['a' + i];
  if (!n || !n.text) continue;
  total++;
  if (/^……/.test(n.text.trim())) dots++;
}
console.log('D4 a111-a130 「……」開始:', dots + '/' + total);
let dots2 = 0, total2 = 0;
for (let i = 225; i <= 244; i++) {
  const n = byId['a' + i];
  if (!n || !n.text) continue;
  total2++;
  if (/^……/.test(n.text.trim())) dots2++;
}
console.log('D4 a225-a244 「……」開始:', dots2 + '/' + total2);
