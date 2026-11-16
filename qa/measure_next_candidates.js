// 残留候補の再計測（2026-11-17 03:4x ラン用）
// 候補: 凛C4 就職先表記揺れ / 優奈C6 呼称揺れ / 凛D5 凛さん逆行 /
//       優奈A6 face不整合 / 凛B3 ワインの香り / 優奈C5 電話→対面
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, ''));
const DATA = {};
for (const g of GAMES) DATA[g.id] = { nodes: g.scenes };
function find(work, id) {
  return DATA[work].nodes.find(n => n.id === id);
}
function grep(work, re) {
  return DATA[work].nodes.filter(n => n.text && re.test(n.text)).map(n => n.id);
}
console.log('--- 凛C4 就職先表記 ---');
console.log('c43:', JSON.stringify(find('rin','c43')?.text));
console.log('c65:', JSON.stringify(find('rin','c65')?.text));
console.log('「他県」:', grep('rin', /他県/));
console.log('「隣県」:', grep('rin', /隣県/));
console.log('--- 優奈C6 呼称 ---');
console.log('「悠太くん」:', grep('yuna', /悠太くん/));
console.log('d82:', JSON.stringify(find('yuna','d82')?.text));
console.log('--- 凛D5 凛さん逆行 ---');
console.log('「凛さん」:', grep('rin', /凛さん/));
for (const id of ['c127','c165','c203']) console.log(id + ':', JSON.stringify(find('rin',id)?.text));
console.log('--- 優奈A6 face不整合 ---');
console.log('d42:', JSON.stringify(find('yuna','d42')));
console.log('d143:', JSON.stringify(find('yuna','d143')));
console.log('--- 凛B3 ワインの香り ---');
console.log('「ワインの香り」:', grep('rin', /ワインの香り/));
console.log('--- 優奈C5 電話→対面 ---');
for (const id of ['d124','d125','d126','d127','d128','d129']) console.log(id + ':', JSON.stringify(find('yuna',id)?.text));
console.log('--- 優奈C1 d229 この子 ---');
console.log('d229:', JSON.stringify(find('yuna','d229')?.text));
console.log('d230:', JSON.stringify(find('yuna','d230')?.text));
console.log('--- 凛B2 子が欲しい ---');
console.log('「子が欲しい」:', grep('rin', /子が欲しい/));
console.log('--- 優奈B2 子が欲しい ---');
console.log('「子が欲しい」:', grep('yuna', /子が欲しい/));
console.log('--- 優奈B6 翌朝二重 ---');
console.log('d179:', JSON.stringify(find('yuna','d179')?.text));
console.log('d27:', JSON.stringify(find('yuna','d27')?.text));
