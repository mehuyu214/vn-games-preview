// W2 凛の28字行 c16／c28／c33／c52／c74／c107／c143／c146 の分割（文面不変・分割のみ）
// 実測（qa/measure_rin28_c16_c28_c33_c52_c74_c107_c143_c146.js、台詞＝話者ありのみ）：
// - 凛の台詞の最長は28字（10件：c16・c28・c33・c52・c74・c107・c143・c146・c179・c212）。
//   桜の台詞最長は26字（a166・a200・a300）、美咲12字、優奈12字、セレナ25字（e14）。
//   c16 は凛、元の後続は c17。「消して。今すぐ。なかったことにして、」（18字）で分割。
//   c28 は悠太、元の後続は c29。「怒るなら、理由ごと怒ってください。」（17字）で分割。
//   c33 は悠太、元の後続は c34。「（この沈黙、ただ事じゃない。」（14字）で分割。
//   c52 は悠太、元の後続は c53。「照合助手の業務範囲内です。」（13字）で分割。
//   c74 は悠太、元の後続は c75。「（鋭い。直感の精度だけは一流」（14字）で分割。
//   c107 は悠太、元の後続は c108。「事実ですから。n数1の、」（12字）で分割。
//   c143 は悠太、元の後続は c144。「訂正理由の文書、凛さんの名前だけで」（17字）で分割。
//   c146 は悠太、元の後続は c147。「凛さん。あの夜のアクセスログ、」（15字）で分割。
// 方式は qa/edit_sakura27_a71_a188_a223_a243.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード c509〜c516（凛）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_rin28_c16_c28_c33_c52_c74_c107_c143_c146.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['rin', 'c16', 'c509', 18, '消して。今すぐ。なかったことにして、', 'お願いだから、悠太。'],
  ['rin', 'c28', 'c510', 17, '怒るなら、理由ごと怒ってください。', 'お願いします、凛さん。'],
  ['rin', 'c33', 'c511', 14, '（この沈黙、ただ事じゃない。', '覚悟して聞こう、何が来ても）'],
  ['rin', 'c52', 'c512', 13, '照合助手の業務範囲内です。', '文句は言わせませんよ、誰にも。'],
  ['rin', 'c74', 'c513', 14, '（鋭い。直感の精度だけは一流', 'なんだよな、この子は本当に）'],
  ['rin', 'c107', 'c514', 12, '事実ですから。n数1の、', '確かな真実ってやつです、凛さん。'],
  ['rin', 'c143', 'c515', 17, '訂正理由の文書、凛さんの名前だけで', '出す気ですか、本気で。'],
  ['rin', 'c146', 'c516', 15, '凛さん。あの夜のアクセスログ、', '実は残してあります、全部。'],
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
console.log('OK: split c16->c509, c28->c510, c33->c511, c52->c512, c74->c513, c107->c514, c143->c515, c146->c516');
