# -*- coding: utf-8 -*-
"""W2 凛 A2: c17 選択肢の二重告白の解消。c20 の text のみ変更。
ノードID・構造は不変。

現状（実測）:
- c17 の2択はどちらも love=2 を set するが、said フラグが 1/0 で分かれ、
  c257 の分岐（said>=1 なら c258、さもなくば c22）で後続が変わる。
  c258「あなたが先に言ってくれて、本当によかった」は「先に言う」択専用の
  追加ノードで、レビュー指摘の「結果が変わらない」は現行データでは
  既に解消済み（c257/c258 分岐が存在する）。
- 残る実欠陥は c20 の二重告白のみ。「先に言う」択では悠太は選択肢文で
  既に「俺も凛さんが好きです」と告白済みなのに、c20 で再び
  「俺と付き合ってください」と言い直す。一方「言葉を待つ」択では
  c19「返事、聞かせて？」への返答として c20 が必要。
- 新文は両ルートで成立する相互確認の返答にし、「凛さん→凛」の
  呼び方の訂正も維持する（新文は最初から「凛」のみ）。
"""
import io, sys

PATH = "data.js"

REPLACEMENTS = {
"c20": ("……ありがとう、凛さん。……いえ、凛。俺と付き合ってください。",
        "……ありがとう、凛。……俺も、凛が好きだよ。……これから、よろしくね。"),
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
