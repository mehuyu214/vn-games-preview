// W2 セレナ E2 再計測：展開が初夜の時点で最後まで確定しているか。
// e35x 跡継ぎ希望表明→e63 推測→e64 プロポーズ→e79「今夜、きっと決まりましたね」
// と、すべて予告通りに進行する。逆転・誤解・すれ違いは全編を通じて
// 一度もないか、疑い・不安の揺さぶりがあるかを数える。
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const g = GAMES.find(x => x.id === 'serena');
const byId = {};
g.scenes.forEach(n => { byId[n.id] = n; });
console.log('serena nodes:', g.scenes.length);

// GOOD ルートのプレイ順（e06・e15 で積極側を選ぶ想定で then 側を追う）
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

// E2: 逆転・誤解・すれ違い・疑い・不安の語の出現
for (const w of ['誤解', 'すれ違い', '喧嘩', '言い合い', '衝突', '勘違い', 'まさか', '予想外', '意外', '不安', '怖い', '焦り', '陰性', '陽性', 'がっかり', '違っていた']) {
  const hits = g.scenes.filter(n => (n.text || '').includes(w));
  console.log('E2 word', w, ':', hits.map(n => n.id + '@' + pos[n.id]).join(' ') || 'none');
}
// 対象ノードの現行文
for (const id of ['e35x', 'e63', 'e64', 'e79', 'e256']) {
  const n = byId[id];
  console.log('==', id, 'pos=' + pos[id], 'name=' + (n && n.name));
  console.log('   ', JSON.stringify(n && n.text));
}
