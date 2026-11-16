# -*- coding: utf-8 -*-
"""W2 セレナ E2: 展開が初夜の時点で最後まで確定している
（e35x の跡継ぎ希望表明→e63 の推測→e64 プロポーズ→e79「今夜、
きっと決まりましたね」と、すべて予告通りに進行し、逆転・誤解・
すれ違いは全編を通じて一度もない）。
再計測：「誤解/すれ違い/喧嘩/言い合い/衝突/勘違い/まさか/予想外/
意外」0件・「不安」は e64 の1件のみ（e63 の疑いを e64 が即解消
するもの）・「怖い/焦り/陰性/陽性/がっかり/違っていた」0件。
e63 の疑いは e64 でその場で解消済みのため、予告通りの弧の残る
弱点は e79 の「きっと決まりましたね」→e256 医師の確定までの
区間（pos 155→192）に揺さぶりが一度もないこと。e79（誓いの夜
の締め、pos 155）に、確かめていないことへの怖さを1文追加する。
「それでも、今夜、きっと決まりましたね」と願いの断定へ押し切
る形で、e79 の既存文の流れは維持。解消は既存の e256（診療所で
医師の診断、pos 192）が担う。text のみ変更。ノードID・構造は
不変。全員成人・合意ありは維持。"""
import io, os, sys

PATH = "data.js"

REPLACEMENTS = {
"e79": ("あぁ……いっぱい……今夜、きっと決まりましたね。……悠太、愛しています。わたしたちの子と一緒に、この館で幸せな家庭を築きましょう。",
        "あぁ……いっぱい……。……でも、まだ確かめたわけじゃありませんものね。もし今夜も違っていたら、と、少しだけ怖くなって――。……それでも、今夜、きっと決まりましたね。……悠太、愛しています。わたしたちの子と一緒に、この館で幸せな家庭を築きましょう。"),
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
