// 書き直し版ベースラインの質的メトリクス：台詞平均・最長行・全文一致重複
// 使い方: node qa/measure_rewrite_quality.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));
for (const g of GAMES) {
  const dlg = g.scenes.filter(n => n.text && n.name);
  const avg = dlg.reduce((a, n) => a + n.text.length, 0) / dlg.length;
  const sorted = [...dlg].sort((a, b) => b.text.length - a.text.length);
  console.log(`== ${g.id}: nodes=${g.scenes.length} dlg=${dlg.length} avgDlg=${avg.toFixed(1)}`);
  console.log('  longest 8:');
  for (const n of sorted.slice(0, 8)) console.log(`    ${n.id} (${n.text.length}字, ${n.name}): ${n.text.slice(0, 60)}`);
  // 全文一致重複（同一テキストの台詞が複数ノード）
  const byText = {};
  for (const n of dlg) (byText[n.text] = byText[n.text] || []).push(n.id);
  const dups = Object.entries(byText).filter(([, ids]) => ids.length > 1);
  console.log(`  dup-text groups: ${dups.length}`);
  for (const [t, ids] of dups.slice(0, 10)) console.log(`    [${ids.join(', ')}] ${t.slice(0, 50)}`);
  // narration share
  const textNodes = g.scenes.filter(n => n.text);
  const nar = textNodes.filter(n => !n.name).length;
  console.log(`  narration share: ${(nar / textNodes.length).toFixed(2)}`);
}
