// 残留候補の再計測 第3弾（2026-11-17 03:4x ラン用）
// 候補: 優奈C3 中核の身体描写 / 凛C3 発表当日の伝聞 / 美咲B3 b128 / 優奈C4 d161
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, ''));
const DATA = {};
for (const g of GAMES) DATA[g.id] = { nodes: g.scenes };
function find(work, id) { return DATA[work].nodes.find(n => n.id === id); }
function grep(work, re) { return DATA[work].nodes.filter(n => n.text && re.test(n.text)).map(n => n.id); }

console.log('--- 優奈C3 中核の身体描写 ---');
console.log('「胸、少し張ってきた」:', grep('yuna', /胸、少し張ってきた/));
console.log('「お腹」:', grep('yuna', /お腹/));
for (const id of ['d132','d169','d207','d245']) console.log(id + ':', JSON.stringify(find('yuna',id)?.text));
console.log('--- 凛C3 発表当日の伝聞 ---');
console.log('「輝いていた」:', grep('rin', /輝いていた/));
console.log('「最前列」:', grep('rin', /最前列/));
console.log('c85:', JSON.stringify(find('rin','c85')?.text));
console.log('c200:', JSON.stringify(find('rin','c200')?.text));
console.log('c186:', JSON.stringify(find('rin','c186')?.text));
console.log('c188:', JSON.stringify(find('rin','c188')?.text));
console.log('--- 美咲B3 b128 ---');
console.log('b128:', JSON.stringify(find('misaki','b128')?.text));
console.log('b163-b180 ブロック導入 b163:', JSON.stringify(find('misaki','b163')?.text));
console.log('「ケーキ」:', grep('misaki', /ケーキ/));
console.log('--- 優奈C4 d161 ---');
console.log('d161:', JSON.stringify(find('yuna','d161')?.text));
console.log('d199:', JSON.stringify(find('yuna','d199')?.text));
console.log('「本の香り」:', grep('yuna', /本の香り/));
console.log('--- 凛E2 揺さぶり候補 ---');
console.log('c70:', JSON.stringify(find('rin','c70')?.text));
console.log('c79:', JSON.stringify(find('rin','c79')?.text));
console.log('c80:', JSON.stringify(find('rin','c80')?.text));
console.log('「遅れ」:', grep('rin', /遅れ/));
