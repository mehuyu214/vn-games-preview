// W2 各作品の最長台詞の分割（文面不変・分割のみ）
// 実測（qa/measure_d135_d197_a170_a221.js）：
// - 優奈 d135／d197 は46字で優奈の最長行（次点 d30／d35／d45:45字）。
//   d135 は園田の台詞、d197 は榊の台詞。いずれも face・char なし。
// - 桜 a170／a221 は45字で桜の最長行（次点 a154:44字）。いずれも藤堂の台詞で
//   face・char なし。いずれも句点の区切りで2ノードに分割する。
// 方式は qa/edit_d135c_d143b_d170_a150.js と同じ：前半ノードに jump、後半ノード
// （scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 新規ノード d344・d345（優奈）・a305・a306（桜）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d135_d197_a170_a221.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

const SPLITS = [
  // [作品ID, 対象ID, 新規ID, 前半テキスト, 後半テキスト]
  ['yuna', 'd135', 'd344',
    'ああ。梓さん、って言ったかな。本の話をすると目が輝く人だった。',
    '結局、その本は返しそびれてね。'],
  ['yuna', 'd197', 'd345',
    '祖母の日記に、ありました。『言えなかったことだけが、残る』って。',
    'その一文が、頭から離れなくて'],
  ['sakura', 'a170', 'a305',
    '店主。先代の件、ご存じでしょう。あのフィルムは、私の家の恥です。',
    '世に出れば、人が傷つきます'],
  ['sakura', 'a221', 'a306',
    '……父が、守られていたとは。先代は、我が家を脅すどころか。',
    '一生、秘密を抱えてくれたのですね'],
];

for (const [gid, id, newId, first, second] of SPLITS) {
  const g = GAMES.find(x => x.id === gid);
  const idx = g.scenes.findIndex(n => n.id === id);
  if (idx < 0) throw new Error(`not found: ${id}`);
  const node = g.scenes[idx];
  if (node.text !== first + second) throw new Error(`text mismatch: ${id}`);
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
  secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split d135->d344, d197->d345, a170->a305, a221->a306');
