// W2 美咲・A1 選択肢の序盤集中の解消：候補の洗い直し。
// 美咲は選択肢が b07・b17 の2か所のみ。後半で美咲が主人公に直接
// 問いかける場面、または決断の場面を探す。
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const mis = GAMES.find(x => x.id === 'misaki');
const byId = {}; mis.scenes.forEach(n => { byId[n.id] = n; });
function playOrder(g) {
  const order = []; const seen = new Set(); let cur = g.scenes[0];
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id); order.push(cur.id);
    if (cur.jump) cur = byId[cur.jump];
    else if (cur.choice) cur = byId[cur.choice[0].jump];
    else if (cur.branch) cur = byId[cur.branch.then];
    else { const i = g.scenes.indexOf(cur); cur = g.scenes[i + 1]; }
  }
  return order;
}
const order = playOrder(mis);
const pos = {}; order.forEach((id, i) => { pos[id] = i; });
console.log('美咲 全', mis.scenes.length, 'ノード / プレイ順', order.length);
console.log('選択肢:', mis.scenes.filter(n => n.choice).map(n => n.id + '@' + pos[n.id]).join(' '));
// 後半（pos>=100）で「？」で終わる美咲の台詞、または問いかけを含むノード
console.log('=== 後半の問いかけ候補（pos>=100、「？」を含む）===');
for (const id of order) {
  const n = byId[id];
  if (pos[id] < 100) continue;
  const t = n.text || '';
  if (t.includes('？') && n.name === '美咲') {
    console.log(' ', id, '@' + pos[id], 'jump=' + (n.jump || ''), ':', JSON.stringify(t.slice(0, 140)));
  }
}
// 開店・夢・お客さん関連の後半ノード
console.log('=== 開店・夢関連の後半ノード ===');
for (const id of ['b80', 'b85', 'b155', 'b190', 'b200', 'b210', 'b220', 'b230', 'b240', 'b250']) {
  const n = byId[id];
  if (!n) { console.log(' ', id, 'なし'); continue; }
  console.log(' ', id, '@' + pos[id], 'name=' + n.name, 'jump=' + (n.jump || ''), ':', JSON.stringify((n.text || '').slice(0, 130)));
}
