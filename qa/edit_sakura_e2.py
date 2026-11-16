# -*- coding: utf-8 -*-
"""W2 桜 E2: 展開が完全に予測可能（a38 で妊娠希望が明言され、以後
逆転・意外性・誤解の解消が一度もない）。
再計測：桜編全体で「誤解/勘違い」0件、「喧嘩/言い合い/すれ違い/衝突」0件、
「まさか/予想外/意外」は a192 の1件のみ（褒め言葉の文脈で揺さぶりではない）。
唯一の事件は額縁のヒビ（a225-244、約10ノードで即解決）。
E3 は現行でほぼ解消済み：a225「写真展の当日」が当日を明示し、a86
「――回想：写真展の前日。」が回想を明示している。残る E3 の隙間
（回想からの復帰の明示）は a47「今日、ここに来るまで」・a50「ギャラリーへ」で
文脈上は足りており、本ランでは E2 を優先する。
a94（検査薬の夜）に、さくらの小さな疑いを1文追加する。a93 の
「もう一度だけ確かめたいことがあるの」の中身がここで明かされる形で、
「わたしの勢いに付き合ってくれてるだけじゃない？」という疑念を置き、
直後の a96「検査の結果なんて、どっちでもいい。俺はさくらと、ずっと
一緒にいたい。それだけだよ。」がその場で解消する。a107「陽性でも、
陰性でも……わたしは、悠太の子が欲しいの」とも接続。全員成人・
合意ありは維持。text のみ変更。ノードID・構造は不変。"""
import io, os, sys

PATH = "data.js"

REPLACEMENTS = {
"a94": ("悠太、来てくれた……。ねえ、見て。検査薬、ここにあるよ。でもね、使うのは、まだ後。……今夜はまず、わたしを抱いて？",
        "悠太、来てくれた……。ねえ、見て。検査薬、ここにあるよ。でもね、使うのは、まだ後。……その前に、確かめたいの。悠太は本当に、赤ちゃんが欲しいって思ってる？　わたしの勢いに、付き合ってくれてるだけじゃない……？　……今夜はまず、わたしを抱いて？"),
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
