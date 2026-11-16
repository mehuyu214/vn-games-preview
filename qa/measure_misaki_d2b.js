// W2 美咲 D2 残置の再計測：悠太が学生か・将来設計は依然として未言及か。
// b01 には夜勤を選んだ理由（手当・生活費はバイト一本）が追加済み。
// 「学生／大学／将来／卒業／就職」の出現と、b01・b64・b65 の現行文を確認する。
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const g = GAMES.find(x => x.id === 'misaki');
const byId = {};
g.scenes.forEach(n => { byId[n.id] = n; });
console.log('misaki nodes:', g.scenes.length);
for (const w of ['学生', '大学', '将来', '卒業', '就職', '夜間', '授業']) {
  const hits = g.scenes.filter(n => (n.text || '').includes(w));
  console.log('word', w, ':', hits.map(n => n.id).join(' ') || 'none');
}
for (const id of ['b01', 'b64', 'b65', 'b66']) {
  const n = byId[id];
  console.log('==', id, 'name=' + JSON.stringify(n && n.name));
  console.log('   ', JSON.stringify(n && n.text));
}
