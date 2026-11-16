// W2 E3 残留の洗い直し：セレナ e80／優奈 d80／凛 c81 の GOOD END が
// まだ置き去りの要約のままか、それとも回収シーンに書き換え済みかを確認する。
// あわせて各作品の到達点（結婚式当日／出産・読み聞かせ／学会発表・卒業・出産）が
// 画面内で描かれているかを数える。
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
for (const gid of ['serena', 'yuna', 'rin']) {
  const g = GAMES.find(x => x.id === gid);
  const byId = {};
  g.scenes.forEach(n => { byId[n.id] = n; });
  console.log('=====', gid, 'nodes:', g.scenes.length);
  const endId = { serena: 'e80', yuna: 'd80', rin: 'c81' }[gid];
  const n = byId[endId];
  console.log('==', endId, 'name=' + JSON.stringify(n && n.name), 'bg=' + (n && n.bg), 'end=' + (n && n.end));
  console.log('   ', JSON.stringify(n && n.text));
}
const words = {
  serena: ['結婚式当日', '結婚式を挙げ', 'バラ園を開', '一番最初のお客さん', '出産', '生まれた'],
  yuna: ['出産', '生まれた', '読み聞かせの会', '一番最初のお客さん', '産休'],
  rin: ['学会発表', '卒業', '出産', '生まれた', '最終電車'],
};
for (const gid of ['serena', 'yuna', 'rin']) {
  const g = GAMES.find(x => x.id === gid);
  for (const w of words[gid]) {
    const hits = g.scenes.filter(n => (n.text || '').includes(w));
    console.log(gid, 'word', w, ':', hits.map(n => n.id).join(' ') || 'none');
  }
}
