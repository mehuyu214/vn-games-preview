// W2 着手前再計測（凛20字行 c153・c170・c175・c269・c280・c307・c308・c311）：各作品の台詞（name あり）の最長とその全ノードを列挙する
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));
for (const g of GAMES) {
  let max = 0; const longest = [];
  for (const n of g.scenes) {
    if (!n.text || !n.name) continue; // 台詞のみ
    const len = [...n.text].length;
    if (len > max) { max = len; longest.length = 0; longest.push(n.id); }
    else if (len === max) longest.push(n.id);
  }
  console.log(`${g.id}: max=${max} count=${longest.length} nodes=${longest.join(',')}`);
}
