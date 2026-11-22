// W2 優奈の同率最長台詞（d428／d429／d453／d476・20字）＋美咲の同率最長台詞（b256／b288・23字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d428_d429_d453_d476_b256_b288.js）：
// - 優奈 d428／d429／d453／d476 は20字で優奈の同率最長行（次点も20字の d528／d539／d561）。
//   d428 は優奈（face=sad・char=true を後半へ継承）、元の jump=d29 を後半へ引き継ぎ。「。」の後（8字）で分割。
//   d429 は悠太、元の jump=d35 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   d453 は優奈（face=sad・char=true を後半へ継承）、元の jump=d107 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   d476 は悠太、元の jump=d248 を後半へ引き継ぎ。「、」の後（7字）で分割。
// - 美咲 b256／b288 は23字で美咲の同率最長行（次点も23字の b332／b389／b479／b534／b539／b552）。
//   b256 は悠太、元の jump=b501 を後半へ引き継ぎ。「、」の後（8字）で分割。
//   b288 は美咲（face=surprise を後半へ継承）、元の jump=b529 を後半へ引き継ぎ。「。」の後（11字）で分割。
// 方式は qa/edit_d382_d395_d419_d423_b171_b173_b188_b198_b221_b234.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d747〜d750（優奈）・b675〜b676（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d428_d429_d453_d476_b256_b288.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd428', 'd747', 8, '返してください。', 'わたしを、信じてください'],
  ['yuna', 'd429', 'd748', 10, 'それは分かりました。', '無理に聞きはしません'],
  ['yuna', 'd453', 'd749', 9, '間違いありません。', 'あの字は、祖母の字です'],
  ['yuna', 'd476', 'd750', 7, '　同じ言葉が、', '告白に変わる日が来るとは）'],
  ['misaki', 'b256', 'b675', 8, '（店長の口癖が、', '初めて慰めに聞こえた夜だった。'],
  ['misaki', 'b288', 'b676', 11, 'これ……相沢さんから。', 'エアメール、届いてるよ。'],
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
  const succ = origJump ? g.scenes.find(n => n.id === origJump) : g.scenes[idx + 1];
  if (!succ) throw new Error(`no successor: ${id}`);
  node.text = first;
  node.jump = newId;
  const secondNode = { id: newId, name: node.name, text: second };
  if (node.face) secondNode.face = node.face;
  if (node.char) secondNode.char = node.char;
  if (node.r18) secondNode.r18 = node.r18;
  secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split d428->d747, d429->d748, d453->d749, d476->d750, b256->b675, b288->b676');
