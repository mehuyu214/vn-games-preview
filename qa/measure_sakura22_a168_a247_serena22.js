// W2 桜の22字行 a168・a247 とセレナの22字行の着手前再計測
// - 各作品の台詞（name あり）の最長と、対象ノードの全文・文字単位の分割候補を表示する
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
  console.log(`${g.id}: max=${max} nodes=${longest.join(',')}`);
}
const show = (gid, ids) => {
  const g = GAMES.find(x => x.id === gid);
  for (const id of ids) {
    const n = g.scenes.find(x => x.id === id);
    if (!n) { console.log(id, 'NOT FOUND'); continue; }
    console.log(`\n${id} name=${n.name} face=${n.face||'-'} char=${!!n.char} r18=${!!n.r18} jump=${n.jump||'-'} end=${!!n.end} len=${[...n.text].length}`);
    console.log(`text: ${n.text}`);
    [...n.text].forEach((ch, i) => { if (i % 10 === 0) process.stdout.write(`\n${String(i).padStart(2)}:`); process.stdout.write(` ${ch}`); });
    console.log('');
  }
};
show('sakura', ['a168', 'a247']);
// セレナの22字行は全件表示（前ランで14件と計測、IDは未確定のため動的に抽出）
const sg = GAMES.find(x => x.id === 'serena');
const s22 = sg.scenes.filter(n => n.text && n.name && [...n.text].length === 22).map(n => n.id);
console.log('\nserena 22-char ids:', s22.join(','));
show('serena', s22);
