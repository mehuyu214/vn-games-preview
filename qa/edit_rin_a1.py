# -*- coding: utf-8 -*-
"""W2 凛・A1 選択肢の序盤集中の解消。
再計測: 凛は選択肢が c07@57・c17@66 の2か所のみで、以後約185ノードは
選択肢ゼロの一本道（桜・美咲・優奈 A1 と同じ構造）。
挿入箇所: c114（引っ越しの下見の帰り道。凛が「段ボール、何箱に
なると思う？　当ててみて。」と直接問いかけており、選択肢化に最も
自然な場面。現行は c115 で悠太が一方的に「20箱？　いや、30箱は
超えそうです」と答えるだけ）。
設計（桜 a253/a264-a269・美咲 b202/b257-b261・優奈 d200/d255-d259
と同じ実績ある方式）:
- c114 に jump:"c259" を追加。
- c259（新規・選択肢ノード）: 「20箱くらいかな」（boxguess:1→c115
  既存の悠太の台詞へ）／「30箱は超えそう」（boxguess:0→c260）の2択。
- c260: 悠太が本棚の量から30箱超えと見積もる → c116（既存の
  「正解は40箱よ」へ）。どちらの経路でも正解は40箱で c116 以後の
  流れ・c163 以後の段ボールの言及は不変。
- c116 に jump:"c261" を追加。
- c261（新規・分岐ノード）: boxguess>=1 なら c262、さもなくば c117。
- c262: 悠太が控えめに20箱と見積もったことへの凛のからかいと
  喜びの回収 → c117。
新規ノードは凛 scenes 末尾（c258 の後）へ追加し、既存の配列順・
フォールスルーは不変。ノードIDは既存不変。全員成人・合意ありは維持。
"""
import io, sys

PATH = "data.js"

NEW_NODES = '''    { id: "c259", choice: [
      { text: "20箱くらいかな", jump: "c115", set: { boxguess: 1 } },
      { text: "本棚の量からして、30箱は超えそう", jump: "c260", set: { boxguess: 0 } }
    ] },
    { id: "c260", name: "悠太", text: "本棚の量からして、30箱は超えそうです。……いや、もっとあるかも。", jump: "c116" },
    { id: "c261", branch: { flag: "boxguess", min: 1, then: "c262", else: "c117" } },
    { id: "c262", face: "smile", name: "凛", text: "20箱ですって？　……ふふ、わたしの本を甘く見たわね。……でも、控えめに見積もってくれる優しさは、嫌いじゃないわ。", jump: "c117" }'''

C258 = '{ id: "c258", face: "shy", name: "凛", text: "……ねえ、悠太。あなたが先に言ってくれて、本当によかった。……わたし一人じゃ、あの言葉、最後まで言えなかったかもしれないから。", jump: "c22" }'

REPLACEMENTS = [
    ('c114 jump',
     '段ボール、何箱になると思う？　当ててみて。" },',
     '段ボール、何箱になると思う？　当ててみて。", jump: "c259" },'),
    ('c116 jump',
     'ふふ、冗談。半分は、わたしが持つわ。" },',
     'ふふ、冗談。半分は、わたしが持つわ。", jump: "c261" },'),
    ('append nodes',
     C258,
     C258 + ',\n' + NEW_NODES),
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
    print(f"OK: {len(REPLACEMENTS)} edits applied (c114/c116 jumps, 4 new nodes c259-c262)")

if __name__ == "__main__":
    main()
