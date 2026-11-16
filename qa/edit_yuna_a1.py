# -*- coding: utf-8 -*-
"""W2 優奈・A1 選択肢の序盤集中の解消。
再計測: 優奈は選択肢が d07@56・d12@60 の2か所のみで、以後約190ノードは
選択肢ゼロの一本道（桜・美咲 A1 と同じ構造）。
挿入箇所: d200（赤ちゃんの名前を決めた夜。優奈が「栞」「陽葵」「結」……
ねえ、どれがいいと思う？」と直接問いかけており、選択肢化に最も自然な
場面。現行は d201 で悠太が一方的に「栞」を指すだけ）。
設計（桜 a253/a264-a269・美咲 b202/b257-b261 と同じ実績ある方式）:
- d200 に jump:"d255" を追加。
- d255（新規・選択肢ノード）: 「栞」がいいな（babyname:1→d201
  既存の悠太の台詞へ）／優奈さんが一番しっくりくる名前がいいよ
  （babyname:0→d256）の2択。
- d256: 悠太が選ぶのを優奈に委ねる → d257。
- d257: 優奈が「栞」にする、と決める → d202（既存の名前の本を
  閉じる地の文）へ。どちらの経路でも決まる名前は「栞」で
  d203 以後の流れ・「栞」への言及は不変。
- d202 に jump:"d258" を追加。
- d258（新規・分岐ノード）: babyname>=1 なら d259、さもなくば d203。
- d259: 悠太が名前を選んでくれたことへの優奈の喜びの回収 → d203。
新規ノードは優奈 scenes 末尾（d254 の後）へ追加し、既存の配列順・
フォールスルーは不変。ノードIDは既存不変。全員成人・合意ありは維持。
"""
import io, sys

PATH = "data.js"

NEW_NODES = '''    { id: "d255", choice: [
      { text: "「栞」がいいな。優奈さんの言う通り、本の栞みたいな名前だ", jump: "d201", set: { babyname: 1 } },
      { text: "優奈さんが一番しっくりくる名前がいいよ", jump: "d256", set: { babyname: 0 } }
    ] },
    { id: "d256", r18: true, name: "悠太", text: "どれも素敵だけど……優奈さんが一番しっくりくるのがいいな。俺は、優奈さんが選んだ名前が好きだよ。", jump: "d257" },
    { id: "d257", face: "smile", r18: true, name: "優奈", text: "……ふふ、ありがとう。……じゃあ、わたしが決めるね。「栞」にする。", jump: "d202" },
    { id: "d258", branch: { flag: "babyname", min: 1, then: "d259", else: "d203" } },
    { id: "d259", face: "smile", r18: true, name: "優奈", text: "……悠太さんが「栞」って言ってくれたとき、わたし、すごく嬉しかったの。……この子が生まれたら、栞って呼んであげよ。", jump: "d203" }'''

D254 = '{ id: "d254", r18: true, name: "", text: "明日会える命の鼓動に耳を澄ませながら、二人は寄り添って眠りについた。栞の花束が、月明かりにそっと白く浮かんでいた。", jump: "d80" }'

REPLACEMENTS = [
    ('d200 jump',
     '……わたしは、栞がいいなって思ってるの。" },',
     '……わたしは、栞がいいなって思ってるの。", jump: "d255" },'),
    ('d202 jump',
     '――栞。その名を口の中で転がすたび、二人の胸に小さな灯りがともるようだった。" },',
     '――栞。その名を口の中で転がすたび、二人の胸に小さな灯りがともるようだった。", jump: "d258" },'),
    ('append nodes',
     D254,
     D254 + ',\n' + NEW_NODES),
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
    print(f"OK: {len(REPLACEMENTS)} edits applied (d200/d202 jumps, 5 new nodes d255-d259)")

if __name__ == "__main__":
    main()
