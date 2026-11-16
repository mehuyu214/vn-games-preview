// W2 セレナ残留の洗い直し：C3（e81回想の自己矛盾）・D4（「……」開始ノード）・
// A7（e40/e86 の表情指定と本文の食い違い）・B6（翌朝の二重演じ e180/e25）。
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const g = GAMES.find(x => x.id === 'serena');
const byId = {};
g.scenes.forEach(n => { byId[n.id] = n; });
console.log('serena nodes:', g.scenes.length);

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
const pos = {}; order.forEach((id, i) => { pos[id] = i; });

// C3: e81 回想導入文の自己矛盾（庭園の手入れ＋キッチン）
console.log('C3 e81:', JSON.stringify(byId.e81 && byId.e81.text));
console.log('C3 旧文「庭園の手入れを手伝った午後」:', g.scenes.filter(n => (n.text || '').includes('庭園の手入れを手伝った午後')).map(n => n.id).join(' ') || 'none');

// D4: 「……」で本文を開始するノード
const dots = g.scenes.filter(n => (n.text || '').startsWith('……'));
console.log('D4 ……開始:', dots.length, '件', dots.map(n => n.id + '@' + pos[n.id]).join(' '));
const shop = dots.filter(n => { const p = pos[n.id]; return p >= 100 && p <= 130; });
console.log('D4 うち買い物ブロック e104-e123 相当:', shop.map(n => n.id).join(' '));

// A7: 表情指定と本文の食い違い
for (const id of ['e40', 'e86']) {
  const n = byId[id];
  console.log('A7', id, 'face=' + (n && n.face), 'name=' + (n && n.name), JSON.stringify(n && n.text));
}
// A7: 後半4ブロック導入ノードの r18 フラグ
for (const id of ['e124', 'e162', 'e200', 'e238']) {
  const n = byId[id];
  console.log('A7 r18', id, 'r18=' + (n && n.r18), JSON.stringify(n && n.text));
}

// B6: 翌朝の二重演じ
for (const id of ['e25', 'e180', 'e181', 'e38x']) {
  const n = byId[id];
  console.log('B6', id, 'pos=' + pos[id], JSON.stringify(n && n.text));
}
