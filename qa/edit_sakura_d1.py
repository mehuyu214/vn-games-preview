# -*- coding: utf-8 -*-
"""W2 桜 D1: 関係進展が一足飛びで葛藤がない（a17告白→a18相思相愛→
a21同夜に俺の部屋→a22初体験まで、逡巡・ためらい・価値観のすり合わせが一切ない）。
再計測：桜編全体で「ためらい」0件。a17/a18/a21/a22 の間に躊躇いの描写はなく、
「不安」「怖い」は写真展へのもの（a87/a228/a238）のみ。
a21（地の文）に玄関での立ち止まりと、さくらが「勢いじゃない、5年考えてきた答え」と
言い切る一節を追加し、初夜への段取りを入れる。a22「今日は帰りたくない。
5年分、ずっと我慢してきたの」と接続。全員成人・合意ありは維持。
text のみ変更。ノードID・構造は不変。"""
import io, os, sys

PATH = "data.js"

REPLACEMENTS = {
"a21": ("閉館後、二人で並んで歩いた桜並木。どちらからともなく手が触れ、指が絡んだ。\\n――その夜、さくらは俺の部屋に寄っていった。",
        "閉館後、二人で並んで歩いた桜並木。どちらからともなく手が触れ、指が絡んだ。\\n――その夜、さくらは俺の部屋に寄っていった。玄関で立ち止まった俺に、さくらは少し俯いて、それからまっすぐ顔を上げた。「……ねえ悠太。今日のことは勢いじゃないの。5年、ずっと考えてきた答えだから。……だから、ためらわないで？」"),
}

def main():
    with io.open(PATH, encoding="utf-8") as f:
        src = f.read()
    for nid, (old, new) in REPLACEMENTS.items():
        needle = '"' + old + '"'
        n = src.count(needle)
        if n != 1:
            print(f"FAIL {nid}: count={n}")
            sys.exit(1)
        src = src.replace(needle, '"' + new + '"', 1)
    # 一時ファイルへ書き出して検証してから置き換える（直接 open("w") は
    # 書き込み失敗時に元ファイルを 0 バイト化するため使わない）。
    tmp = PATH + ".tmp"
    with io.open(tmp, "w", encoding="utf-8") as f:
        f.write(src)
        f.flush()
        os.fsync(f.fileno())
    if os.path.getsize(tmp) != len(src.encode("utf-8")):
        print("FAIL: tmp size mismatch")
        sys.exit(1)
    os.replace(tmp, PATH)
    print(f"OK: {len(REPLACEMENTS)} nodes rewritten")

if __name__ == "__main__":
    main()
