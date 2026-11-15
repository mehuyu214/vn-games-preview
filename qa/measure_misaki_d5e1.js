// W2 美咲 D5/E1/D1/D3 再計測：D5 葛藤の再燃の有無、E1 金銭・シフトの火種の再燃の有無、
// D1 夢の初告白の回数、D3 「……」開始ノードの分布。GOOD ルートのプレイ順（0 起点）で位置を出す。
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const g = GAMES.find(x => x.id === 'misaki');
const byId = {};
g.scenes.forEach(n => { byId[n.id] = n; });
console.log('misaki nodes:', g.scenes.length);

// GOOD ルートのプレイ順（b07 で love+1、b17 で love+1 を選ぶ想定で then 側を追う）
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

// D3: 「……」で本文を開始するノード
const dots = g.scenes.filter(n => (n.text || '').trimStart().startsWith('……'));
console.log('D3 ……start:', dots.length, dots.map(n => n.id + '@' + pos[n.id]).join(' '));

// D5: 葛藤語の出現（b82 OL辞職、b152 夢への不安「無謀だよね」の再燃があるか）
for (const w of ['無謀', '焦り', '不安', '怖い', '合わなくて辞めて', '辞めた', 'フリーター']) {
  const hits = g.scenes.filter(n => (n.text || '').includes(w));
  console.log('D5 word', w, ':', hits.map(n => n.id + '@' + pos[n.id]).join(' ') || 'none');
}
// E1: 金銭・シフトの火種（b65/b66）の再燃
for (const w of ['時給', '給料', 'お金', '貯金', '資金', 'シフト', '昼シフト', '収入']) {
  const hits = g.scenes.filter(n => (n.text || '').includes(w));
  console.log('E1 word', w, ':', hits.map(n => n.id + '@' + pos[n.id]).join(' ') || 'none');
}
// D1: 夢の初告白
for (const w of ['わたしの夢', '夢、知ってる', '夢、笑わない', '夢を']) {
  const hits = g.scenes.filter(n => (n.text || '').includes(w));
  console.log('D1 word', w, ':', hits.map(n => n.id + '@' + pos[n.id]).join(' ') || 'none');
}
// 対象ノードの現行文
for (const id of ['b82', 'b152', 'b65', 'b66', 'b150', 'b186', 'b219', 'b229', 'b239', 'b255', 'b256']) {
  const n = byId[id];
  console.log('==', id, 'pos=' + pos[id], 'name=' + (n && n.name));
  console.log('   ', JSON.stringify(n && n.text));
}
