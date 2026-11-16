# -*- coding: utf-8 -*-
"""W2 美咲・A1 選択肢の序盤集中の解消。
再計測: 美咲は選択肢が b07@58・b17@67 の2か所のみで、以後約185ノードは
選択肢ゼロの一本道（桜 A1 と同じ構造）。桜は 2026-11-17 05:0x ランで
a253 に子の名前を選ぶ選択肢を追加済み。
挿入箇所: b202（食堂の名前を考えた夜。美咲が「食堂みさき」「朝ごはんの
店」「温かい台所」……ねえ、どれがいいと思う？」と直接問いかけており、
選択肢化に最も自然な場面。現行は b203 で悠太が一方的に「朝ごはんの店」
を指すだけ）。
設計（桜 a253/a264-a269 と同じ実績ある方式）:
- b202 に jump:"b257" を追加。
- b257（新規・選択肢ノード）: 「朝ごはんの店」がいいな（shopname:1→b203
  既存の悠太の台詞へ）／美咲が一番しっくりくる名前がいいよ（shopname:0→b258）の2択。
- b258: 悠太が選ぶのを美咲に委ねる → b259。
- b259: 美咲が「朝ごはんの店」にする、と決める → b204（既存のノートを
  閉じる地の文）へ。どちらの経路でも決まる名前は「朝ごはんの店」で
  b205 以後の流れ・b80 開店初日の看板は不変。
- b204 に jump:"b260" を追加。
- b260（新規・分岐ノード）: shopname>=1 なら b261、さもなくば b205。
- b261: 悠太が名前を選んでくれたことへの美咲の喜びの回収 → b205。
新規ノードは美咲 scenes 末尾（b256 の後）へ追加し、既存の配列順・
フォールスルーは不変。ノードIDは既存不変。全員成人・合意ありは維持。
"""
import io, sys

PATH = "data.js"

NEW_NODES = '''    { id: "b257", choice: [
      { text: "「朝ごはんの店」がいいな。美咲さんの朝ごはん、誰だって食べたくなるから", jump: "b203", set: { shopname: 1 } },
      { text: "美咲さんが一番しっくりくる名前がいいよ", jump: "b258", set: { shopname: 0 } }
    ] },
    { id: "b258", r18: true, name: "悠太", text: "どれも素敵だけど……美咲さんが一番しっくりくるのがいいな。俺は、美咲さんが選んだ名前が好きだよ。", jump: "b259" },
    { id: "b259", face: "smile", r18: true, name: "美咲", text: "……ふふ、ありがとう。……じゃあ、わたしが決めるね。「朝ごはんの店」にする。", jump: "b204" },
    { id: "b260", branch: { flag: "shopname", min: 1, then: "b261", else: "b205" } },
    { id: "b261", face: "smile", r18: true, name: "美咲", text: "……悠太くんが「朝ごはんの店」って言ってくれたとき、わたし、すごく嬉しかったの。……朝ごはんの店、みんなに食べてもらうの。", jump: "b205" }'''

B256 = '{ id: "b256", r18: true, name: "", text: "美咲さんは俺の腕の中で、やがて穏やかな寝息を立て始めた。エプロンが、月明かりにそっと白く浮かんでいた。", jump: "b80" }'

REPLACEMENTS = [
    ('b202 jump',
     '……ねえ、どれがいいと思う？" },',
     '……ねえ、どれがいいと思う？", jump: "b257" },'),
    ('b204 jump',
     '閉じたノートの向こうで、彼女の胸が小さく上下していた。" },',
     '閉じたノートの向こうで、彼女の胸が小さく上下していた。", jump: "b260" },'),
    ('append nodes',
     B256,
     B256 + ',\n' + NEW_NODES),
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
    print(f"OK: {len(REPLACEMENTS)} edits applied (b202/b204 jumps, 5 new nodes b257-b261)")

if __name__ == "__main__":
    main()
