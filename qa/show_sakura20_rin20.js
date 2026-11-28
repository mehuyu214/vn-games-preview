// W2 分割対象8件の全文・文字単位ダンプ（桜 a48/a270/a275/a293、凛 c68/c106/c129/c133）
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));
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
show('sakura', ['a48', 'a270', 'a275', 'a293']);
show('rin', ['c68', 'c106', 'c129', 'c133']);
