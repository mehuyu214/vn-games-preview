// W2 セレナ A2 の計測：e13/e15 の love フラグの死に設定。
// レビュー A2「e13 は e06 の選択結果を love 経由で再判定しているだけ。
// e15 積極側の set（love=2）は以後分岐ノードがないため一度も読まれない
// 書き込み専用フラグ。e15 消極側の set（love=0）もエンジンの applySet が
// max 仕様のため love=1 を下げられず死に設定」への対応の実測。
// 計測項目：
//  (1) e15 の2選択肢の set（love の値）
//  (2) e15 より後（プレイ順）に love を読む分岐ノードの有無
//  (3) e13 の合流点性：e06 積極経路（e07→e09→e10→e11→e12→e13）と
//      消極経路（e08→e13）の両方が e13 に到達し、then/else 両側が通ること
//  (4) engine.js の applySet の love max 特例の有無
//  (5) 他作品の同型の死に書き込み（以後読み手のない love set）の洗い出し
const fs = require('fs');
const src = fs.readFileSync('data.js', 'utf-8');
const GAMES = eval(src + ';GAMES');
const eng = fs.readFileSync('engine.js', 'utf-8');
const sim = fs.readFileSync('qa/sim_all_routes.js', 'utf-8');

function find(g, id) { return g.scenes.find(s => s.id === id); }
const g = GAMES.find(x => x.id === 'serena');
const e15 = find(g, 'e15');
console.log('e15 choices:', JSON.stringify(e15.choice));

// (2) love を読む分岐ノードを列挙（プレイ順の位置付き）
const loveReaders = g.scenes.filter(s => s.branch && s.branch.flag === 'love')
  .map(s => s.id + ' min=' + s.branch.min);
console.log('serena love readers:', loveReaders.join(', ') || 'none');
// e15 より後に love を読む分岐があるか：セレナの分岐ノードは e13 のみ
const branchIds = g.scenes.filter(s => s.branch).map(s => s.id);
console.log('serena branch nodes:', branchIds.join(', '));

// (3) e13 合流点の確認：e07/e08 からの到達
function nextIds(n) {
  const out = [];
  if (n.jump) out.push(n.jump);
  if (n.choice) n.choice.forEach(c => out.push(c.jump));
  if (n.branch) { out.push(n.branch.then, n.branch.else); }
  // jump/choice/branch がなければ配列順の次ノードへフォールスルー
  if (!n.jump && !n.choice && !n.branch && !n.end) {
    const i = g.scenes.findIndex(s => s.id === n.id);
    if (i >= 0 && i + 1 < g.scenes.length) out.push(g.scenes[i + 1].id);
  }
  return out;
}
function reaches(fromId, targetId) {
  const seen = new Set(); const q = [fromId];
  while (q.length) {
    const id = q.shift();
    if (id === targetId) return true;
    if (seen.has(id)) continue; seen.add(id);
    const n = find(g, id); if (!n) continue;
    nextIds(n).forEach(x => q.push(x));
  }
  return false;
}
console.log('e07 -> e13:', reaches('e07', 'e13'), '| e08 -> e13:', reaches('e08', 'e13'));
console.log('e13 then e14 -> e15:', reaches('e14', 'e15'), '| e13 else e18 is END:', !!find(g, 'e18').end);

// (4) applySet の max 特例
console.log('engine applySet has love max special-case:', /Math\.max\(flags\[k\], s\[k\]\)/.test(eng));
console.log('sim applySet has love max special-case:', /Math\.max\(flags\[k\], s\[k\]\)/.test(sim));

// (5) 他作品：love を書くが以後読まれない set の洗い出し
// 各作品で love を読む分岐ノードの最後の位置（配列順ではなくプレイ到達順で近似：
// 分岐ノードより後に現れる choice の set が読み手なし）
for (const gg of GAMES) {
  const readers = gg.scenes.filter(s => s.branch && s.branch.flag === 'love').map(s => s.id);
  const lastReaderIdx = Math.max(-1, ...readers.map(id => gg.scenes.findIndex(s => s.id === id)));
  const dead = [];
  gg.scenes.forEach((s, i) => {
    if (!s.choice) return;
    s.choice.forEach((c, ci) => {
      if (c.set && typeof c.set.love === 'number') {
        // 分岐ノードの配列位置より後に置かれた choice の love set は
        // その作品の love 読み手より後（＝以後読まれない候補）
        if (i > lastReaderIdx) dead.push(s.id + '[' + ci + '] love=' + c.set.love);
      }
    });
  });
  console.log(gg.id, 'love readers:', readers.join(',') || 'none',
    '| love writes after last reader (array order):', dead.join(', ') || 'none');
}
