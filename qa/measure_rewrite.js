// 書き直し前後の会話メトリクス比較（data.js を引数で指定、省略時は data.js）
// 使い方: node qa/measure_rewrite.js [datafile] [backupfile]
const fs = require('fs');
const file = process.argv[2] || 'data.js';
const bakFile = process.argv[3] || 'data.js.bak-20261117';
const load = f => eval(fs.readFileSync(f, 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));
const GAMES = load(file);
const VOICED = ['a101','a103','a105','a107','a109','a22','a24','a26','a28x','a30','a32','a34','a36','a38','a40','a54','a56','a58','a60','a62','a64','a66','a74','a76','a78','a80','a82','a84','a94','a97','a99'];
for (const g of GAMES) {
  const textNodes = g.scenes.filter(n => n.text);
  const dlg = textNodes.filter(n => n.name);
  const nar = textNodes.filter(n => !n.name);
  const chars = g.scenes.reduce((a, n) => a + (n.text || '').length, 0);
  const avgDlg = dlg.length ? dlg.reduce((a, n) => a + n.text.length, 0) / dlg.length : 0;
  const speakers = [...new Set(dlg.map(n => n.name))];
  let maxWin = 0;
  for (let i = 0; i < textNodes.length; i++) {
    const w = new Set();
    for (let j = i; j < Math.min(i + 20, textNodes.length); j++) if (textNodes[j].name) w.add(textNodes[j].name);
    if (w.size > maxWin) maxWin = w.size;
  }
  let sw = 0, pairs = 0;
  for (let i = 1; i < dlg.length; i++) { pairs++; if (dlg[i].name !== dlg[i - 1].name) sw++; }
  const ends = g.scenes.filter(n => n.end).map(n => n.id);
  console.log(`${g.id}: nodes=${g.scenes.length} chars=${chars} dialogue=${dlg.length} narration=${nar.length} narShare=${(nar.length / Math.max(1, textNodes.length)).toFixed(2)} avgDlgChars=${avgDlg.toFixed(1)} speakers=${speakers.length}(${speakers.join('/')}) maxWinSpeakers=${maxWin} switchRate=${pairs ? (sw / pairs).toFixed(2) : 'n/a'} ends=${ends.join(',')}`);
}
// 桜: ボイス付きノードの本文変更チェック（バックアップと比較）
try {
  const bak = load(bakFile);
  const bakSakura = bak.find(g => g.id === 'sakura');
  const newSakura = GAMES.find(g => g.id === 'sakura');
  const bakById = {}, newById = {};
  bakSakura.scenes.forEach(n => bakById[n.id] = n);
  if (newSakura) newSakura.scenes.forEach(n => newById[n.id] = n);
  const changed = [], missing = [], same = [];
  for (const id of VOICED) {
    if (!newById[id]) missing.push(id);
    else if ((newById[id].text || '') !== (bakById[id].text || '')) changed.push(id);
    else same.push(id);
  }
  console.log(`VOICED sakura: same=${same.length} changed=${changed.length} [${changed.join(',')}] missing=${missing.length} [${missing.join(',')}]`);
} catch (e) { console.log('VOICED check skipped:', e.message); }
