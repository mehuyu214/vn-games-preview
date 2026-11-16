# -*- coding: utf-8 -*-
"""W2 美咲 E2: 展開が初夜の時点で最後まで確定している
（b34x／b60 で「孕ませて」と明言され、妊娠判明も b66 体調の変化→
b68 検査薬を試した（結果は内緒）と二重に予告されたうえでの b79 で、
驚きとして機能しない。逆転・誤解・すれ違いは全編を通じて一度もない）。
再計測：「誤解/すれ違い/喧嘩/勘違い/まさか/予想外/意外」0件・
「不安/怖い/焦り」0件・「陰性」0件・「陽性」は b79 の1件のみ。
b68（検査薬の夜、pos 147）に、陰性だったら悠太をがっかりさせて
しまうのではないかという美咲の疑いを1文追加する。b77「いるかも
しれないの」の不確かさとも整合し、b79 の陽性判明がその場での解消
として機能する。予告の二重構造は残るが、結果への疑いが一度だけ
挟まることで、b68→b79 の間に読み手の不確かさが生まれる。
text のみ変更。ノードID・構造は不変。全員成人・合意ありは維持。"""
import io, os, sys

PATH = "data.js"

REPLACEMENTS = {
"b68": ("今日はね、先に言っておく。……わたし、検査薬、試してみたの。結果は内緒。だから今夜は、答え合わせの前に、思い切り愛し合おう？",
        "今日はね、先に言っておく。……わたし、検査薬、試してみたの。結果は内緒。……もし陰性だったら、悠太くんをがっかりさせちゃうかな。……でも、だからこそ今夜は、答え合わせの前に、思い切り愛し合おう？"),
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
