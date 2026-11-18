// W2 優奈の同率最長台詞（d72／d86／d93・40字）＋美咲の最長台詞（b95／b103／b131／b160／b168／b180／b233／b249・38字）の分割（文面不変・分割のみ）
// 実測（qa/measure_d72_d86_d93_b95_b103_b131_b160_b168_b180_b233_b249.js）：
// - 優奈 d72／d86／d93 は40字で優奈の最長行（d117／d169／d182／d193c／d215 も40字で同率だが本ランは前ラン次回候補の3行のみ対象）。
//   d72・d86 は優奈（face=serious・char=true）、d93 は榊（face・char なし）。
// - 美咲 b95／b103／b131／b160／b168／b180／b233／b249 は38字で美咲の最長行。b233 は美咲（face=surprise）。
//   b160 は「！」直後の全角スペースを後半へ（b276 と同じ方式）。
// 方式は qa/edit_d32_d53_d55_d58_d71b_c284.js と同じ：前半ノードに jump、
// 後半ノード（scenes 配列末尾へ追加）に元の後続ノードへの jump を付ける。
// 分割位置は文字インデックスで指定し、原文を slice するため文面の転記ミスは起きない。
// 新規ノード d401〜d403（優奈）・b314〜b321（美咲）。ノードID不変（既存IDの変更なし）。
// 全員成人・合意ありは維持。
// 使い方: node qa/edit_d72_d86_d93_b95_b103_b131_b160_b168_b180_b233_b249.js
const fs = require('fs');
const GAMES = eval(fs.readFileSync('data.js', 'utf8').replace(/^const GAMES = /, '').replace(/;\s*$/, ''));

// [作品ID, 対象ID, 新規ID, 分割インデックス, 前半, 後半]（前半・後半は注記用。実処理は slice）
const SPLITS = [
  ['yuna', 'd72', 'd401', 24, '園田さん、その席は指定席では、ありませんけれど。', '……まあ、いつものことですけれど'],
  ['yuna', 'd86', 'd402', 24, '閉館ですよ。……ですが、ご用件だけなら伺います。', 'その顔では、放っておけませんから'],
  ['yuna', 'd93', 'd403', 27, 'だから存在しないんです。目録に無い本を、探しています。', '祖母が残した、たった一冊を'],
  ['misaki', 'b95', 'b314', 22, 'ただいまー。傘、今度はちゃんと持ってきたよ。', '学習した。先週はひどかったからね'],
  ['misaki', 'b103', 'b315', 23, 'さあ。そこは寝たふりを決め込まれちゃってねえ。', '聞き返したら、目を閉じちゃった'],
  ['misaki', 'b131', 'b316', 26, '二人とも、ちょっと聞いてほしいっしょ。大事な話だよ。', '座って、落ち着いて聞いて'],
  ['misaki', 'b160', 'b317', 23, '閉店！？　あたしの縄張りが消えちゃうじゃない！', '　この辺、夜はあたしの庭なのに'],
  ['misaki', 'b168', 'b318', 25, '出発は月末。雨の日を、待ってるみたいだよ、あの人。', '天気予報とにらめっこだって'],
  ['misaki', 'b180', 'b319', 22, '読みますか。……美咲さん、手、震えてますよ。', '大丈夫ですか、俺が持ちましょうか'],
  ['misaki', 'b233', 'b320', 20, '……え。私に、ですか。そんな、悪いです。', '受け取れません。あなたこそ、雨なのに'],
  ['misaki', 'b249', 'b321', 24, '（言えなかった。お礼も、父のことも、手紙もない。', '……俺も、何も言えなかった）'],
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
  secondNode.jump = succ.id;
  g.scenes.push(secondNode);
  console.log(`${id} -> ${newId} -> ${succ.id} (${first.length}+${second.length} chars)`);
}
fs.writeFileSync('data.js', 'const GAMES = ' + JSON.stringify(GAMES, null, 2) + ';\n');
console.log('OK: split d72->d401, d86->d402, d93->d403, b95->b314, b103->b315, b131->b316, b160->b317, b168->b318, b180->b319, b233->b320, b249->b321');
