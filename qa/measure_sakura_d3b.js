// W2 桜 D3（続）再計測：悠太の家族（実家の両親）への言及
// a06 に両親の一文あり（先行作業）。以降の再登場は 0 件が残留のはず。
// a171 に妊娠報告の一文を追加し、a06 の伏線を回収する。
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const g = GAMES.find(x => x.id === 'sakura');
const byId = {};
g.scenes.forEach(n => { byId[n.id] = n; });
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
const order = playOrder(g);
const pos = {}; order.forEach((id, i) => { pos[id] = i; });
console.log('sakura nodes:', g.scenes.length, 'プレイ順到達:', order.length);
function count(re, label) {
  const hits = g.scenes.filter(n => re.test(n.text || '')).map(n => n.id + '@' + pos[n.id]);
  console.log(label + ':', hits.length, '件', hits.join(' '));
}
count(/家族/, '「家族」');
count(/実家/, '「実家」');
count(/両親/, '「両親」');
count(/父さん/, '「父さん」');
for (const id of ['a06', 'a169', 'a171', 'a178', 'a207']) {
  const n = byId[id];
  console.log(' ', id, '@' + pos[id], ':', JSON.stringify(n && n.text || ''));
}
