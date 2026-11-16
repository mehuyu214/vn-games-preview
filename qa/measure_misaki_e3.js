// W2 美咲 E3/A2 再計測：夢のクライマックス（開店当日）が描かれないか。
// b255「明日は、食堂の開店よ」→b256（就寝）→b80（END）で終わり、
// 3度結ばれた「一番最初のお客さん」の約束が回収される場面自体がない。
// b80 は b79 の「責任、取ってくれる？」への返答のままで、b87 が同じ
// ビートを既に演じている。b80 の現行文と周辺ノード、約束の出現を確認する。
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const g = GAMES.find(x => x.id === 'misaki');
const byId = {};
g.scenes.forEach(n => { byId[n.id] = n; });
console.log('misaki nodes:', g.scenes.length);

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
console.log('play order len:', order.length);
const pos = {}; order.forEach((id, i) => { pos[id] = i; });

// 「一番最初のお客さん」／「常連第一号」の約束の出現
for (const w of ['一番最初のお客さん', '常連第一号', '開店', '明日は、食堂の開店']) {
  const hits = g.scenes.filter(n => (n.text || '').includes(w));
  console.log('word', w, ':', hits.map(n => n.id + '@' + pos[n.id]).join(' ') || 'none');
}
// 対象ノードの現行文（b80 は name/bg/face/end フラグも確認）
for (const id of ['b79', 'b80', 'b87', 'b155', 'b191', 'b241', 'b255', 'b256']) {
  const n = byId[id];
  console.log('==', id, 'pos=' + pos[id], 'name=' + (n && n.name), 'bg=' + (n && n.bg), 'end=' + (n && n.end), 'r18=' + (n && n.r18));
  console.log('   ', JSON.stringify(n && n.text));
}
