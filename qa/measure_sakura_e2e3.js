// 桜 E2/E3 残置の再計測
// E2: 展開が完全に予測可能。a38 で妊娠希望が明言され、以後 逆転・意外性・誤解の解消が一度もない。
// E3: 写真展当日の時系列が断片化。プレイ順は 当日朝(a225)→並木道(a43)→写真館(a149)→前日の回想(a86)→当日の告白回想(a47-50)→喫茶店(a187)→会場内(a12)。
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
const order = playOrder(sak);
const pos = {}; order.forEach((id, i) => { pos[id] = i; });
console.log('桜 全ノード:', sak.scenes.length, 'プレイ順到達:', order.length);
// E3: 写真展当日まわりのプレイ順と時刻表示
console.log('--- E3: 写真展当日まわり ---');
for (const id of ['a225','a43','a149','a86','a47','a48','a49','a50','a187','a12','a13','a14']) {
  const n = byId[id];
  console.log(' ', id, '@' + pos[id], 'bg=' + (n && n.bg), 'name=' + (n && n.name), ':', JSON.stringify((n && n.text || '').slice(0, 160)));
}
function count(re, label) {
  const hits = sak.scenes.filter(n => re.test(n.text || '')).map(n => n.id + '@' + pos[n.id]);
  console.log(label + ':', hits.length, '件', hits.join(' '));
}
console.log('--- E3: 時刻・回想の明示 ---');
count(/写真展当日/, '「写真展当日」');
count(/当日の朝|当日朝/, '「当日の朝」');
count(/前日/, '「前日」');
count(/回想|思い出す|思い出した/, '「回想/思い出す」');
count(/午前|午後|夕方|夜/, '「午前/午後/夕方/夜」');
console.log('--- E2: 揺さぶりの装置 ---');
count(/誤解|勘違い/, '「誤解/勘違い」');
count(/まさか|予想外|意外/, '「まさか/予想外/意外」');
count(/喧嘩|言い合い|すれ違い|衝突/, '「喧嘩/言い合い/すれ違い/衝突」');
count(/心配|不安|怖い/, '「心配/不安/怖い」');
count(/検査薬/, '「検査薬」');
console.log('--- 検査薬まわり (a93/a110/a131) ---');
for (const id of ['a93','a94','a95','a110','a111','a131','a132','a133']) {
  const n = byId[id];
  console.log(' ', id, '@' + pos[id], 'name=' + (n && n.name), ':', JSON.stringify((n && n.text || '').slice(0, 200)));
}
