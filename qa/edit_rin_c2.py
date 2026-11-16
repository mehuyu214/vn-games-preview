# -*- coding: utf-8 -*-
"""W2 凛 C2: 妊娠経過の身体指標の停滞の解消。
再計測: 「つわり」0件・「胎動」0件・「通院／産科／検診／病院」0件。
「お腹」は c97/c99（pos 170-172「まだ平らな」）→ c177（β）→ c242以降（δ
「大きくなったお腹」）とあるが、αブロック（c125-142）とγブロック
（c201-218、新居の最初の夜）にはお腹への言及が皆無で、「平らな」から
「大きくなった」へ中間段階なしに跳ぶ。
c204（γブロック導入の地の文、pos 217）に中間段階を1文追加する。
「二人の鼓動が重なった」→「ふくらみ始めたお腹に手を当てると、
小さな胎動がそっと返ってきた。」c203 の「三人の暮らし」とも接続し、
c205 の「この部屋での、最初の夜よ」へ自然に続く。
全員成人・合意ありは維持。text のみ変更。ノードID・構造は不変。
残置：つわり／通院の明示は依然 0 件（別ランで検討）。"""
import io, sys

PATH = "data.js"

REPLACEMENTS = {
"c204": ("凛は段ボールの山を眺め、俺の肩にそっと頭をもたせかけた。新しい部屋の静けさの中、二人の鼓動が重なった。",
          "凛は段ボールの山を眺め、俺の肩にそっと頭をもたせかけた。新しい部屋の静けさの中、ふくらみ始めたお腹に手を当てると、小さな胎動がそっと返ってきた。"),
}

def main():
    with io.open(PATH, encoding="utf-8") as f:
        src = f.read()
    for nid, (old, new) in REPLACEMENTS.items():
        # text フィールドの引用符付き完全一致で置換（他ノードへの誤爆防止）
        needle = '"' + old + '"'
        n = src.count(needle)
        if n != 1:
            print(f"FAIL {nid}: count={n}")
            sys.exit(1)
        src = src.replace(needle, '"' + new + '"', 1)
    with io.open(PATH, "w", encoding="utf-8") as f:
        f.write(src)
    print(f"OK: {len(REPLACEMENTS)} nodes rewritten")

if __name__ == "__main__":
    main()
