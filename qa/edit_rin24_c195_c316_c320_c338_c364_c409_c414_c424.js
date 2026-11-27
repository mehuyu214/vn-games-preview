// W2 凛の24字行 c195／c316／c320／c338／c364／c409／c414／c424 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin24_c195_c316_c320_c338_c364_c409_c414_c424.js、台詞＝name ありのみ）：
// - 凛の台詞の最長は24字（8件：c195・c316・c320・c338・c364・c409・c414・c424）。
//   桜23字、セレナ23字、美咲12字、優奈12字。
//   c195 は小野寺、jump=c313。「か、教授ぅ……すみません、」（13字）で分割。
//   c316 は悠太、jump=c274。「凛さんがいなくなるんですか、」（14字）で分割。
//   c320 は悠太、jump=c18。「この人に、何か起きてる。」（12字）で分割。
//   c338 は凛、jump=c273。「来春から、他大学のポストに行くわ、」（17字）で分割。
//   c364 は凛、jump=c118。「じゃあ共犯、確定ね、悠太。」（13字）で分割。
//   c409 は悠太、jump=c149。「貼り間違いの発生時刻まで」（12字）で分割。
//   c414 は悠太、jump=c177。「このまま終われば、全部」（11字）で分割。
//   c424 は凛、jump=c227。「今夜、私から言いたいことがあるの、」（17字）で分割。
// 方式は qa/edit_sakura24_a37_a79_a138_a255_serena24_e10_e111.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c533〜c540（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin24_c195_c316_c320_c338_c364_c409_c414_c424.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c195', 'c533', 13, 'か、教授ぅ……すみません、', 'ありがとうございます、'],
  ['rin', 'c316', 'c534', 14, '凛さんがいなくなるんですか、', '本当に、嘘みたいに。'],
  ['rin', 'c320', 'c535', 12, 'この人に、何か起きてる。', '絶対に、ただ事じゃない）'],
  ['rin', 'c338', 'c536', 17, '来春から、他大学のポストに行くわ、', '私、決めたの。'],
  ['rin', 'c364', 'c537', 13, 'じゃあ共犯、確定ね、悠太。', 'もう逃げられないわよ。'],
  ['rin', 'c409', 'c538', 12, '貼り間違いの発生時刻まで', '特定できますよ、これで。'],
  ['rin', 'c414', 'c539', 11, 'このまま終われば、全部', '終わるはずなんだ、きっと）'],
  ['rin', 'c424', 'c540', 17, '今夜、私から言いたいことがあるの、', '聞いてほしい。'],
];

for (const [gid, id, newId, cut, first, second] of SPLITS) {
  const g = GAMES.find(x => x.id === gid);
  const idx = g.scenes.findIndex(n => n.id === id);
  if (idx < 0) throw new Error(`not found: ${id}`);
  const node = g.scenes[idx];
  if (node.text.slice(0, cut) !== first || node.text.slice(cut) !== second) throw new Error(`text mismatch: ${id}`);
  if (node.choices || node.branch) throw new Error(`not a plain node: ${id}`);
  if (g.scenes.some(n => n.id === newId)) throw new Error(`id collision: ${newId}`);
  const origJump = node.jump || null;
  const origEnd = !!node.end;
  const succ = origJump ? g.scenes.find(n => n.id === origJump) : g.scenes[idx + 1];
  if (!origEnd && !succ) throw new Error(`no successor: ${id}`);
  node.text = first;
  node.jump = newId;
  if (origEnd) delete node.end;
  const secondNode = { id: newId, name: node.name, text: second };
  if (node.face) secondNode.face = node.face;
  if (node.char) secondNode.char = node.char;
  if (node.r18) secondNode.r18 = node.r18;
  if (origEnd) secondNode.end = true;
  else secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${origEnd ? '(end)' : succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split c195->c533, c316->c534, c320->c535, c338->c536, c364->c537, c409->c538, c414->c539, c424->c540');
