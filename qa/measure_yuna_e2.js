// 優奈 E2 残置の再計測
// E2: 展開が初夜の時点で最後まで確定している。d35x の妊娠希望表明→d63 の遅れの告白→d65「最後の確認」→d124 の陽性判明と、すべて予告通りに進行し、逆転・誤解・すれ違いは全編を通じて一度もない。
// レビュー提案（review_yuna.md L116）: 読み聞かせの会の準備が一度頓挫する、図書館の同僚に二人の関係が知られる、といった小さな事件を1つ差し込む。
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const yun = GAMES.find(x => x.id === 'yuna');
const byId = {}; yun.scenes.forEach(n => { byId[n.id] = n; });
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
const order = playOrder(yun);
const pos = {}; order.forEach((id, i) => { pos[id] = i; });
console.log('優奈 全ノード:', yun.scenes.length, 'プレイ順到達:', order.length);
console.log('--- E2: 妊娠予告の流れ ---');
for (const id of ['d35x','d63','d64','d65','d66','d124','d125','d126']) {
  const n = byId[id];
  console.log(' ', id, '@' + pos[id], 'name=' + (n && n.name), ':', JSON.stringify((n && n.text || '').slice(0, 200)));
}
function count(re, label) {
  const hits = yun.scenes.filter(n => re.test(n.text || '')).map(n => n.id + '@' + pos[n.id]);
  console.log(label + ':', hits.length, '件', hits.join(' '));
}
count(/誤解|すれ違い|喧嘩|言い合い|衝突|勘違い/, '誤解・すれ違い・衝突系');
count(/まさか|予想外|意外/, '意外性系');
count(/遅れ/, '「遅れ」');
count(/読み聞かせの会/, '読み聞かせの会');
count(/同僚/, '同僚');
count(/頓挫|中止|延期|潰れ/, '頓挫・中止・延期系');
count(/不安|怖い/, '不安・怖い');
console.log('--- 読み聞かせの会まわり ---');
for (const id of order.filter(id => (byId[id].text || '').includes('読み聞かせの会'))) {
  const n = byId[id];
  console.log(' ', id, '@' + pos[id], 'name=' + n.name, ':', JSON.stringify((n.text || '').slice(0, 160)));
}
