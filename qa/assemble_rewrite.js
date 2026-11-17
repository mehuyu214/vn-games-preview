// rewrite/frag_X.js + frag_X_meta.json を data.js に組み立てる
// 使い方: node qa/assemble_rewrite.js （全作品） / node qa/assemble_rewrite.js sakura （1作品のみ）
const fs = require('fs');
const only = process.argv[2] || null;
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));
const PREFIX = { sakura: 'a', misaki: 'b', rin: 'c', yuna: 'd', serena: 'e' };
let changed = 0;
for (const g of GAMES) {
  if (only && g.id !== only) continue;
  const p = PREFIX[g.id];
  const fragPath = `rewrite/frag_${p}.js`;
  const metaPath = `rewrite/frag_${p}_meta.json`;
  if (!fs.existsSync(fragPath)) { console.log(`${g.id}: no fragment, skipped`); continue; }
  const scenes = eval(fs.readFileSync(fragPath, 'utf8'));
  if (!Array.isArray(scenes) || !scenes.length) throw new Error(`${g.id}: fragment is not a non-empty array`);
  g.scenes = scenes;
  if (fs.existsSync(metaPath)) {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    if (meta.desc) g.desc = meta.desc;
    console.log(`${g.id}: scenes=${scenes.length} goodEnd=${meta.goodEnd} normalEnd=${meta.normalEnd} desc updated=${!!meta.desc}`);
  } else {
    console.log(`${g.id}: scenes=${scenes.length} (no meta)`);
  }
  changed++;
}
if (!changed) { console.log('nothing assembled'); process.exit(1); }
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('data.js written');
