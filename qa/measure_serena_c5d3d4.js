// W2 セレナ C5/D3/D4 再計測
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const g = GAMES.find(x => x.id === 'serena');
const byId = {};
g.scenes.forEach(n => { byId[n.id] = n; });
// C5: e62 立場変遷、マルタ、e132系身体描写、お腹の変化
for (const id of ['e62','e104','e132']) {
  const n = byId[id];
  console.log('=== ' + id + ' ===');
  console.log(n ? (n.text||'') : '(missing)');
}
for (const kw of ['マルタ','お腹','ふくら','胎動','つわり','住み込み','家庭教師を辞']) {
  const hits = g.scenes.filter(n=>(n.text||'').includes(kw)).map(n=>n.id);
  console.log(kw + ': ' + hits.length + '件 ' + hits.join(','));
}
// e132系の身体描写の反復
const core = '熱くなってますわ';
const hits = g.scenes.filter(n=>(n.text||'').includes(core)).map(n=>n.id);
console.log('「熱くなってますわ」: ' + hits.length + '件 ' + hits.join(','));
// D4: 「……」で始まるノード
const dots = g.scenes.filter(n=>(n.text||'').startsWith('……'));
console.log('「……」開始: ' + dots.length + '件 ' + dots.map(n=>n.id).join(','));
// D3: 悠太の発話ノード数（「悠太」名義の台詞は engine 上 speaker で判定できないため text 内の「俺」出現で概算）
const ore = g.scenes.filter(n=>(n.text||'').includes('俺')).map(n=>n.id);
console.log('「俺」含む: ' + ore.length + '件');
