# -*- coding: utf-8 -*-
"""W2 セレナ C5（残置）：中核部の身体描写の反復。
レビュー C5「テンプレート中核の身体描写『ほら、ここ、熱くなってますわ』
（e132 系）は日取り決定の夜から結婚式前夜まで一字一句同じで、お腹の
変化は中核部に一切現れない」。先行ラン（ae71665）で e238 へ胎動を追加、
e200 の導入を書き分けて妊娠経過の身体描写は進んだが、中核文そのもの
の反復は未対応。着手前の再計測：e132（pos 182）と e208（pos 219、
リハーサルの夜）の冒頭は既に書き分け済みだが、中核の一文
「ほら、ここ、熱くなってますわ」は両ノードで一字一句同じ。e208 は
e256（pos 192、診療所での医師の診断＝妊娠の確定）の後であり、e238
（結婚式前夜）では胎動も描かれているため、e208 の中核文にお腹の変化
を入れるのが整合する。e208 の中核文を「ほら、ここも、お腹の子と同じ
くらい、熱くなってますわ」へ書き換え、冒頭・締めは維持。e132 は原型
のまま残し、反復は 1 回の対比として読める形にする。text のみ変更。
ノードID・構造は不変。全員成人・合意ありは維持。"""
import io, os, sys

PATH = "data.js"

REPLACEMENTS = {
"e208": ("ねえ、見て……今日、教会で歩いたわたくしと、同じ体ですわ。……ほら、ここ、熱くなってますわ。……ねえ悠太、今夜も、触って……確かめて？",
        "ねえ、見て……今日、教会で歩いたわたくしと、同じ体ですわ。……ほら、ここも、お腹の子と同じくらい、熱くなってますわ。……ねえ悠太、今夜も、触って……確かめて？"),
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
