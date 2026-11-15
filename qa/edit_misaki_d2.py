# -*- coding: utf-8 -*-
"""W2 美咲 D2: 悠太の人物像が希薄（発話は全252ノード中31ノードのみ。
「なぜ夜勤バイトをしているのか、学生なのか、将来をどう考えているのか」
は一切描かれず、妊娠と開店の決断にも主体的な悩みや行動を持たない）。
再計測：悠太の生活基盤への言及は全編で 0 件。夜勤手当の重要性は b65
（月に三万近く減る）で示されるが、なぜ夜勤を選んだか・生活費をどう
まかなっているかは不明。b01（冒頭の地の文。夜勤バイト3か月目）に、
手当目当てで夜勤を選び、生活費はこのバイト一本でまかなっている一文を
追加し、悠太の生活基盤を冒頭で地に足をつける。b65 の金銭懸念・b64 の
昼シフト移行とも整合（手当が減るからこそ b65 で渋る）。
学生かどうか・将来設計は依然として未言及で残置。
text のみ変更。ノードID・構造は不変。全員成人・合意ありは維持。"""
import io, os, sys

PATH = "data.js"

REPLACEMENTS = {
"b01": ("深夜1時のコンビニ。客足の途絶えた店内に、蛍光灯の低い唸りだけが響く。\\n俺の夜勤バイトも、今日で3か月目になった。",
        "深夜1時のコンビニ。客足の途絶えた店内に、蛍光灯の低い唸りだけが響く。\\n俺の夜勤バイトも、今日で3か月目になった。夜勤を選んだのは手当がつくからで、生活費はこのバイト一本でまかなっている。"),
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
