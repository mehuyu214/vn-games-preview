# -*- coding: utf-8 -*-
"""W2 凛 D5: 交際深化後の「凛さん」呼称の逆行の残りの解消。
再計測: レビュー D5 で挙げられた c127／c165／c203 は先行作業で「凛」に修正済み。
しかし子供部屋ブロック（c239–c256、pos 232〜）の c241（pos 234、悠太発話）に
「凛さん」が残存。妊娠後期・同棲後の場面で敬称に戻るのは距離感の逆行。
c241 の呼称を「凛」に統一する。c240（星柄の壁紙の自慢）・c242（お腹の子と
三人でいるような静かな鼓動）との接続は維持。全員成人・合意ありは維持。
text のみ変更。ノードID・構造は不変。"""
import io, sys

PATH = "data.js"

REPLACEMENTS = {
"c241": ("凛さん……ほんとに、綺麗ですね。……星柄の壁紙、この子、きっと気に入りますよ。……俺も、手伝いますよ。",
          "凛……ほんとに、綺麗ですね。……星柄の壁紙、この子、きっと気に入りますよ。……俺も、手伝いますよ。"),
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
