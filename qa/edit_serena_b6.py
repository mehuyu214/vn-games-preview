# -*- coding: utf-8 -*-
"""W2 セレナ B6: 「翌朝」が二重に演じられる。
初夜の後、e38x（夜明け前まで）→e25（「おはようございます、悠太」）
で朝を迎えた直後、e180 へ跳んで再び「――庭園のテーブル。セレナは
朝食の準備をしていた」が始まり、e181「昨日の夜のこと、覚えてる？
わたくしは、もう一生忘れませんわ」と同じ朝・同じ感慨がもう一度
提示される。e180 の「――」付き場面見出しが、同じ朝の二度目の
開幕に見えるのが原因。e180 の text を、場面の再開幕ではなく
e25 の挨拶からの同一の朝の続きとして読める文へ書き換える
（「庭園のテーブルへ移ると、」で移動の接続を入れ、朝食の準備・
バラの香り・焼きたてのパンの匂いという良い日常素材は維持）。
e181 以後の朝食の会話はそのまま続く。text のみ変更。ノードID・
構造は不変。全員成人・合意ありは維持。"""
import io, os, sys

PATH = "data.js"

REPLACEMENTS = {
"e180": ("――庭園のテーブル。セレナは朝食の準備をしていた。バラの香りと、焼きたてのパンの匂いが漂う。",
        "庭園のテーブルへ移ると、セレナは朝食の準備をしていた。バラの香りと、焼きたてのパンの匂いが漂う。"),
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
