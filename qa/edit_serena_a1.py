# -*- coding: utf-8 -*-
"""W2 セレナ・A1 選択肢の序盤集中の解消。
再計測: セレナは選択肢が e06@55・e15@63 の2か所のみで、以後約185ノードは
選択肢ゼロの一本道（桜・美咲・優奈・凛 A1 と同じ構造）。
挿入箇所: e88（誓いの夜。セレナが「ねえ悠太。結婚式のこと、考えて
くれた？　わたし、庭園で挙げたいの。バラのアーチの下で、あなたと
誓いを交わすの」と直接問いかけており、選択肢化に最も自然な場面。
現行は e89 で悠太が一方的に「いいな。バラのアーチか」と答えるだけ）。
設計（桜 a253/a264-a269・美咲 b202/b257-b261・優奈 d200/d255-d259・
凛 c114/c259-c262 と同じ実績ある方式）:
- e88 に jump:"e257" を追加。
- e257（新規・選択肢ノード）: 「もちろん、庭園のバラのアーチで」
  （weddingarden:1→e89 既存の悠太の台詞へ）／「教会で挙げるのも
  素敵だと思う」（weddingarden:0→e258）の2択。
- e258: 悠太が教会も素敵だがやはりセレナにはバラのアーチが似合うと
  言い、庭園で挙げることに決める → e89。どちらの経路でも結婚式は
  庭園のバラのアーチの下で、e254／e80 以後の流れは不変。
- e89 に jump:"e259" を追加。
- e259（新規・分岐ノード）: weddingarden>=1 なら e260、さもなくば e90。
- e260: 庭園を即答で選んでくれたことへのセレナの喜びの回収 → e90。
新規ノードはセレナ scenes 配列末尾（e255 の後）へ追加し、既存の配列順・
フォールスルーは不変。ノードIDは既存不変。全員成人・合意ありは維持。
"""
import io, sys

PATH = "data.js"

NEW_NODES = '''    { id: "e257", choice: [
      { text: "もちろん、庭園のバラのアーチで", jump: "e89", set: { weddingarden: 1 } },
      { text: "教会で挙げるのも素敵だと思う", jump: "e258", set: { weddingarden: 0 } }
    ] },
    { id: "e258", name: "悠太", text: "教会も素敵だけど……やっぱりセレナには、バラのアーチが似合うよ。庭園で挙げよう。", jump: "e89" },
    { id: "e259", branch: { flag: "weddingarden", min: 1, then: "e260", else: "e90" } },
    { id: "e260", face: "smile", name: "セレナ", text: "……ふふ、即答ですのね。……やっぱり、悠太はわたくしの気持ちがわかってますのね。", jump: "e90" }'''

E255 = '{ id: "e255", r18: true, name: "", text: "セレナは明日着るドレスに一度だけ目をやり、俺の胸に頬を寄せてそっと目を閉じた。――白いバラのアーチの下、明日の朝が二人を待っている。", jump: "e80" }'

REPLACEMENTS = [
    ('e88 jump',
     'バラのアーチの下で、あなたと誓いを交わすの。……ふふ、気が早いかしら。" },',
     'バラのアーチの下で、あなたと誓いを交わすの。……ふふ、気が早いかしら。", jump: "e257" },'),
    ('e89 jump',
     '誓いの夜は、まだ終わってないだろ？" },',
     '誓いの夜は、まだ終わってないだろ？", jump: "e259" },'),
    ('append nodes',
     E255,
     E255 + ',\n' + NEW_NODES),
]

def main():
    with io.open(PATH, encoding="utf-8") as f:
        src = f.read()
    for label, old, new in REPLACEMENTS:
        n = src.count(old)
        if n != 1:
            print(f"FAIL {label}: count={n}")
            sys.exit(1)
        src = src.replace(old, new, 1)
    with io.open(PATH, "w", encoding="utf-8") as f:
        f.write(src)
    print(f"OK: {len(REPLACEMENTS)} edits applied (e88/e89 jumps, 4 new nodes e257-e260)")

if __name__ == "__main__":
    main()
