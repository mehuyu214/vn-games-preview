// 残留候補の再計測 第2弾（2026-11-17 03:4x ラン用）
// 候補: 優奈D2/E3 d80現行 / 優奈C3 経過月数 / 優奈C4 位置関係 /
//       凛C1/C3/C5 / 凛D1 研究軸 / 凛E2 / 美咲残留 / 桜残留 / セレナ残留
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, ''));
const DATA = {};
for (const g of GAMES) DATA[g.id] = { nodes: g.scenes };
function find(work, id) { return DATA[work].nodes.find(n => n.id === id); }
function grep(work, re) { return DATA[work].nodes.filter(n => n.text && re.test(n.text)).map(n => n.id); }

console.log('--- 優奈 d80 GOOD END 現行 ---');
console.log(JSON.stringify(find('yuna','d80')?.text));
console.log('「一番最初のお客さん」:', grep('yuna', /一番最初のお客さん/));
console.log('「読み聞かせの会」:', grep('yuna', /読み聞かせの会/));
console.log('--- 優奈C3 経過月数 ---');
console.log('「か月」:', grep('yuna', /か月/));
console.log('「妊娠」出現数:', grep('yuna', /妊娠/).length);
console.log('--- 優奈C4 位置関係 ---');
console.log('d237:', JSON.stringify(find('yuna','d237')?.text));
console.log('「図書館の灯り」:', grep('yuna', /図書館の灯り/));
console.log('--- 凛C1 卒業・就職 ---');
console.log('c43:', JSON.stringify(find('rin','c43')?.text));
console.log('c65:', JSON.stringify(find('rin','c65')?.text));
console.log('「卒業」:', grep('rin', /卒業/));
console.log('「入所」:', grep('rin', /入所/));
console.log('--- 凛C3 学会発表当日 ---');
console.log('c41x:', JSON.stringify(find('rin','c41x')?.text));
console.log('「学会発表」:', grep('rin', /学会発表/));
console.log('「打ち上げ」:', grep('rin', /打ち上げ/));
console.log('「温泉」:', grep('rin', /温泉/));
console.log('--- 凛C5 同棲の条件 ---');
console.log('c66:', JSON.stringify(find('rin','c66')?.text));
console.log('c125:', JSON.stringify(find('rin','c125')?.text));
console.log('--- 凛D1 研究軸（c80以降の研究・学会・就職言及） ---');
console.log('c80以降の「研究」:', DATA.rin.nodes.filter(n => n.text && /研究/.test(n.text) && n.id >= 'c80' && !/^c[0-9]+x$/.test(n.id)).map(n => n.id));
console.log('c80以降の「学会」:', DATA.rin.nodes.filter(n => n.text && /学会/.test(n.text)).map(n => n.id));
console.log('--- 凛E2 予測可能性 ---');
console.log('「誤解/すれ違い/喧嘩/勘違い」:', grep('rin', /誤解|すれ違い|喧嘩|勘違い/));
console.log('「不安」:', grep('rin', /不安/));
console.log('--- 美咲 残留 ---');
console.log('b80 GOOD END:', JSON.stringify(find('misaki','b80')?.text));
console.log('「子が欲しい」:', grep('misaki', /子が欲しい/));
console.log('「ケーキの甘い香り」:', grep('misaki', /ケーキの甘い香り/));
console.log('b19 NORMAL END:', JSON.stringify(find('misaki','b19')?.text));
console.log('--- 桜 残留 ---');
console.log('a85 GOOD END:', JSON.stringify(find('sakura','a85')?.text));
console.log('「……」開始:', DATA.sakura.nodes.filter(n => n.text && n.text.startsWith('……')).map(n => n.id).length);
console.log('--- セレナ 残留 ---');
console.log('e80 GOOD END:', JSON.stringify(find('serena','e80')?.text));
console.log('「子が欲しい」:', grep('serena', /子が欲しい/));
console.log('「バラの香り」系:', grep('serena', /バラの香り/));
console.log('「誤解/すれ違い/喧嘩/勘違い」:', grep('serena', /誤解|すれ違い|喧嘩|勘違い/));
