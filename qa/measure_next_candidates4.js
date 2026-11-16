// 次回候補の洗い直し（2026-11-17 04:4x ラン）
// 候補: (1) 桜 A2 a08 の現状 (W2a の a263 対応後) (2) 優奈 B5 締め文・モットーの反復残留
// (3) 全作品 A1 選択肢の配置 (序盤集中の現状) (4) 桜 E3 写真展当日の時系列
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf-8') + '; GAMES');
const byIdOf = g => { const m = {}; g.scenes.forEach(n => { m[n.id] = n; }); return m; };
function playOrder(g) {
  const byId = byIdOf(g); const order = []; const seen = new Set(); let cur = g.scenes[0];
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id); order.push(cur.id);
    if (cur.jump) cur = byId[cur.jump];
    else if (cur.choice) cur = byId[cur.choice[0].next];
    else if (cur.branch) cur = byId[cur.branch.then];
    else { const i = g.scenes.indexOf(cur); cur = g.scenes[i + 1]; }
  }
  return order;
}
function countIn(g, order, re, label) {
  const pos = {}; order.forEach((id, i) => { pos[id] = i; });
  const hits = g.scenes.filter(n => re.test(n.text || '')).map(n => n.id + '@' + pos[n.id]);
  console.log('  ' + label + ':', hits.length, '件', hits.join(' '));
  return hits;
}

// --- (3) A1: 全作品の選択肢配置 ---
console.log('=== A1 選択肢の配置 ===');
for (const g of GAMES) {
  const order = playOrder(g); const pos = {}; order.forEach((id, i) => { pos[id] = i; });
  const ch = g.scenes.filter(n => n.choice).map(n => n.id + '@' + pos[n.id] + '(' + n.choice.length + '択)');
  console.log(g.id, '全', g.scenes.length, 'ノード / プレイ順', order.length, '/ 選択肢:', ch.length, '件', ch.join(' '));
}

// --- (1) 桜 A2: a08 と a263 ---
console.log('=== 桜 A2 a08 / a263 ===');
const sak = GAMES.find(x => x.id === 'sakura'); const sById = byIdOf(sak);
const sOrder = playOrder(sak); const sPos = {}; sOrder.forEach((id, i) => { sPos[id] = i; });
for (const id of ['a08', 'a09', 'a10', 'a11', 'a16', 'a17', 'a19', 'a20', 'a21', 'a263']) {
  const n = sById[id];
  if (!n) { console.log(' ', id, 'なし'); continue; }
  console.log(' ', id, '@' + sPos[id], 'name=' + n.name, 'jump=' + (n.jump || ''), 'choices=' + (n.choice ? JSON.stringify(n.choice.map(c => ({ t: c.text, set: c.set, next: c.jump }))) : ''), 'branch=' + (n.branch ? JSON.stringify(n.branch) : ''));
  console.log('    text:', JSON.stringify((n.text || '').slice(0, 160)));
}

// --- (2) 優奈 B5 ---
console.log('=== 優奈 B5 締め文・モットー ===');
const yun = GAMES.find(x => x.id === 'yuna'); const yOrder = playOrder(yun);
countIn(yun, yOrder, /抱き合ったまま、二人は静かに眠りに落ちた/, '「抱き合ったまま、二人は静かに眠りに落ちた」');
countIn(yun, yOrder, /特等席はあなたのそば/, '「特等席はあなたのそば」');
countIn(yun, yOrder, /眠りに落ちた/, '「眠りに落ちた」全般');
for (const id of ['d141', 'd178', 'd216', 'd254', 'd27', 'd197']) {
  const n = byIdOf(yun)[id];
  console.log(' ', id, ':', JSON.stringify((n && n.text || '').slice(0, 120)));
}

// --- (4) 桜 E3: 写真展当日の時系列マーカー ---
console.log('=== 桜 E3 写真展当日の時系列 ===');
countIn(sak, sOrder, /写真展/, '「写真展」');
for (const id of ['a225', 'a43', 'a149', 'a86', 'a47', 'a187', 'a12']) {
  const n = sById[id];
  console.log(' ', id, '@' + sPos[id], ':', JSON.stringify((n && n.text || '').slice(0, 110)));
}
