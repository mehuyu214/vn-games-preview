// W2 凛の28字行 c16／c28／c33／c52／c74／c107／c143／c146 の着手前再計測
// - 各作品の台詞最長と、その8ノードの全文・文字単位の分割候補を表示する
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));
for (const g of GAMES) {
  let max = 0; const longest = [];
  for (const n of g.scenes) {
    if (!n.text) continue;
    const len = [...n.text].length;
    if (len > max) { max = len; longest.length = 0; longest.push(n.id); }
    else if (len === max) longest.push(n.id);
  }
  console.log(`${g.id}: max=${max} nodes=${longest.join(',')}`);
}
const rin = GAMES.find(x => x.id === 'rin');
for (const id of ['c16', 'c28', 'c33', 'c52', 'c74', 'c107', 'c143', 'c146']) {
  const n = rin.scenes.find(x => x.id === id);
  if (!n) { console.log(id, 'NOT FOUND'); continue; }
  console.log(`\n${id} name=${n.name} face=${n.face||'-'} char=${!!n.char} r18=${!!n.r18} jump=${n.jump||'-'} end=${!!n.end} len=${[...n.text].length}`);
  console.log(`text: ${n.text}`);
  [...n.text].forEach((ch, i) => { if (i % 10 === 0) process.stdout.write(`\n${String(i).padStart(2)}:`); process.stdout.write(` ${ch}`); });
  console.log('');
}
