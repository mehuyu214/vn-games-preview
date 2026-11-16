# -*- coding: utf-8 -*-
"""W2 桜 E1: 中盤の緊張の山の残留の解消。
告白後の緊張の山は、商店街のすれ違い（a119-a122、実装済み）と額縁のヒビ
（a225-a244）のみで、写真館ブロック a149-a168 は雰囲気シーンのまま。
a159（さくらの台詞、5年前に初めて現像した桜の写真を受け取った直後）に
展示への不安を 1 文追加する。直後の a160（店主の賛辞「あんたの桜は今や、
通りすがりの人の足を止める写真になったよ」）がその場で解消し、a162 の
「もっと大きな展示」宣言、a165 の「悠太といると、なんだか怖くない」へ
自然に接続する。新たな未回収の糸は残さない。
text のみ 1 ノード。ノードID不変・全員成人・合意ありは維持。
あわせて E4 は現行で解消済みと確認（「全部そこにある」a49 のみ 1 件、
「全部見て」0件、「5年間」は a13/a49 のみ）。"""
import io, os, sys

PATH = "data.js"

REPLACEMENTS = {
"a159": ("……ありがとうございます。……わたし、今日、写真展をやるんです。……この写真みたいに、誰かの心に残る写真を撮りたくて。",
         "……ありがとうございます。……わたし、今日、写真展をやるんです。……この写真みたいに、誰かの心に残る写真を撮りたくて。……でも、初めて現像したときの気持ち、まだちゃんと持ててるのかな。……今日の展示、ちょっとだけ怖いんです。"),
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
