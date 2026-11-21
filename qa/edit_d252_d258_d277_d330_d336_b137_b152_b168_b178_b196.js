// W2 優奈の同率最長台詞（d252／d258／d277／d330／d336・22字）＋美咲の同率最長台詞（b137／b152／b168／b178／b196・25字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d252_d258_d277_d330_d336_b137_b152_b168_b178_b196.js）：
// - 優奈 d252／d258／d277／d330／d336 は22字で優奈の同率最長行（d348／d350／d354 も22字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   d252 は悠太、元の jump=d511 を後半へ引き継ぎ。「。」の後（10字）で分割。
//   d258 は優奈（face=ecstasy・char=true・r18=true を後半へ継承）、元の jump=d514 を後半へ引き継ぎ。「、」の後（12字）で分割。
//   d277 は悠太、元の jump=d498 を後半へ引き継ぎ。「。」の後（11字）で分割。
//   d330 は白鳥、元の jump=d156 を後半へ引き継ぎ。「くれ」の後（15字）で分割。
//   d336 は榊、元の jump=d90b を後半へ引き継ぎ。「一文」の後（15字）で分割。
// - 美咲 b137／b152／b168／b178／b196 は25字で美咲の同率最長行（b204／b210／b220 も25字で同率だが本ランは前ラン次回候補の5行のみ対象）。
//   b137 は悠太、元の jump=b489 を後半へ引き継ぎ。「、」の後（16字）で分割。
//   b152 は店長、元の jump=b343 を後半へ引き継ぎ。「』」の後（17字）で分割。
//   b168 は藤井、元の jump=b318 を後半へ引き継ぎ。「。」の後（6字）で分割。
//   b178 は悠太、元の jump=b377 を後半へ引き継ぎ。「。」の後（9字）で分割。
//   b196 は美咲（face=smile を後半へ継承）、jumpなし・後続 b197 へ jump。「。」の後（16字）で分割。
// 方式は qa/edit_d226_d232_d240_b104_b119_b136.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// d258 の r18 は後半ノードへも継承する（engine.js は n.r18 で R18表示モードを切替えるため）。
// 新規ノード d677〜d681（優奈）・b603〜b607（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d252_d258_d277_d330_d336_b137_b152_b168_b178_b196.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd252', 'd677', 10, '俺は何もしてないよ。', '届けたのは優奈さんです。'],
  ['yuna', 'd258', 'd678', 12, 'あっ……はぁ、悠太さん、', '好き……大好きです。'],
  ['yuna', 'd277', 'd679', 11, '届けたじゃないですか。', '園田さんに、ちゃんと。'],
  ['yuna', 'd330', 'd680', 15, '残りの半分は、誰かが持ってくれ', 'ればいい、とも'],
  ['yuna', 'd336', 'd681', 15, '日記に、どうしても気になる一文', 'がありまして。'],
  ['misaki', 'b137', 'b603', 16, 'じゃあ、傘は……落とし物の傘は、', 'どうなるんですか。'],
  ['misaki', 'b152', 'b604', 17, 'そう。『まあ、なんとかなるっしょ』', 'って、笑ってた。'],
  ['misaki', 'b168', 'b605', 6, '出発は月末。', '雨の日を、待ってるみたいだよ、あの人。'],
  ['misaki', 'b178', 'b606', 9, '裏に字があります。', '『相沢と、傘の持ち主、夏』って。'],
  ['misaki', 'b196', 'b607', 16, '供養の次は、傘磨きが得意なんだ。', '器用だね、悠太くん'],
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
console.log('OK: split d252->d677, d258->d678, d277->d679, d330->d680, d336->d681, b137->b603, b152->b604, b168->b605, b178->b606, b196->b607');
