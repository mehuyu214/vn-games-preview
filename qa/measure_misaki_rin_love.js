// W2 美咲 b17／凛 c17／桜 a08・a16 の死に love set の計測。
// 前ラン（セレナ A2、qa/measure_serena_a2.js）と同じ手法：
// 各作品で love を読む分岐ノードを列挙し、各 love 書き込み choice から
// 到達可能な love 読み手があるか（プレイ到達順）を確認する。
// 読み手が到達不能ならその set は死に書き込み。
const fs = require('fs');
const src = fs.readFileSync('data.js', 'utf-8');
const GAMES = eval(src + ';GAMES');

function find(g, id) { return g.scenes.find(s => s.id === id); }
function nextIds(g, n) {
  const out = [];
  if (n.jump) out.push(n.jump);
  if (n.choice) n.choice.forEach(c => out.push(c.jump));
  if (n.branch) { out.push(n.branch.then, n.branch.else); }
  if (!n.jump && !n.choice && !n.branch && !n.end) {
    const i = g.scenes.findIndex(s => s.id === n.id);
    if (i >= 0 && i + 1 < g.scenes.length) out.push(g.scenes[i + 1].id);
  }
  return out;
}
function reaches(g, fromId, targetId) {
  const seen = new Set(); const q = [fromId];
  while (q.length) {
    const id = q.shift();
    if (id === targetId) return true;
    if (seen.has(id)) continue; seen.add(id);
    const n = find(g, id); if (!n) continue;
    nextIds(g, n).forEach(x => q.push(x));
  }
  return false;
}

for (const gid of ['sakura', 'misaki', 'rin', 'yuna', 'serena']) {
  const g = GAMES.find(x => x.id === gid);
  const readers = g.scenes.filter(s => s.branch && s.branch.flag === 'love')
    .map(s => s.id + '(min=' + s.branch.min + ')');
  console.log('=== ' + gid + ' love readers: ' + (readers.join(', ') || 'none'));
  g.scenes.forEach(s => {
    if (!s.choice) return;
    s.choice.forEach((c, ci) => {
      if (c.set && typeof c.set.love === 'number') {
        const reachable = readers
          .map(r => r.split('(')[0])
          .filter(rid => reaches(g, c.jump, rid));
        console.log('  write ' + s.id + '[' + ci + '] love=' + c.set.love +
          ' jump=' + c.jump + ' text=' + JSON.stringify(c.text) +
          ' | reachable love readers from jump: ' + (reachable.join(',') || 'NONE (dead)') +
          ' | other set keys: ' + Object.keys(c.set).filter(k => k !== 'love').join(','));
      }
    });
  });
}
