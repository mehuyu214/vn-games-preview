# -*- coding: utf-8 -*-
"""W2 凛・E2 展開の予測可能性の解消。
再計測: 「誤解/すれ違い/喧嘩/勘違い」は凛全254ノードで0件、「不安」も0件、
「違っていた」「がっかり」「陰性」も0件。c38x の希望表明→c70 の体調の変化
→c80 の陽性判明と、すべて予告通りに進行する。c70（体調の変化を告げる夜）
に仮定形の不安（「もし違っていたら」）を1文追加する。c80 の陽性判明が
その場での解消として機能する。c80 の「実はもう検査したの」とは矛盾しない
（検査の有無を断定せず、結果への不安だけを述べる）。c71 以後の夜の流れは
維持。全員成人・合意ありは維持。text のみ変更。ノードID・構造は不変。
"""
import io, sys

PATH = "data.js"

REPLACEMENTS = {
"c70": ("悠太……わたし、最近体がおかしいの。胸が張って、眠くて……もしかしたら、あの夜のことが。……ねえ、今夜も中に頂戴。確信に変えたいの。",
        "悠太……わたし、最近体がおかしいの。胸が張って、眠くて……もしかしたら、あの夜のことが。……でも、もし違っていたら。期待させてがっかりさせちゃうかもって、少しだけ怖いの。……ねえ、今夜も中に頂戴。確信に変えたいの。"),
}

def main():
    with io.open(PATH, encoding="utf-8") as f:
        src = f.read()
    for nid, (old, new) in REPLACEMENTS.items():
        needle = old + '"'
        n = src.count(needle)
        if n != 1:
            print(f"FAIL {nid}: count={n}")
            sys.exit(1)
        src = src.replace(needle, new + '"', 1)
    with io.open(PATH, "w", encoding="utf-8") as f:
        f.write(src)
    print(f"OK: {len(REPLACEMENTS)} nodes rewritten")

if __name__ == "__main__":
    main()
