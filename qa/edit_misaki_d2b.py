# -*- coding: utf-8 -*-
"""W2 美咲 D2 残置：悠太が学生か・将来設計は依然として未言及。
再計測：「学生／大学／卒業／就職／夜間／授業」は全編 0 件。
「将来」は b190 の1件のみ（美咲の夢の文脈）。b01 には夜勤を選んだ
理由（手当・生活費はバイト一本）が追加済みだが、学生かどうかと
将来設計は未言及のまま。
b01（冒頭の地の文）に「大学には行っていない。将来のことは、まだ
何も決めていない。」を2文追加する。b64 の昼シフト移行・b65 の
金銭懸念とも整合し、22歳フリーターの美咲と対になる生活基盤が
冒頭で示される。将来未定の明示により、b190 以後の夢への関わりも
「決めていない男が彼女の夢に巻き込まれていく」線になる。
text のみ変更。ノードID・構造は不変。全員成人・合意ありは維持。"""
import io, os, sys

PATH = "data.js"

REPLACEMENTS = {
"b01": ("深夜1時のコンビニ。客足の途絶えた店内に、蛍光灯の低い唸りだけが響く。\\n俺の夜勤バイトも、今日で3か月目になった。夜勤を選んだのは手当がつくからで、生活費はこのバイト一本でまかなっている。",
        "深夜1時のコンビニ。客足の途絶えた店内に、蛍光灯の低い唸りだけが響く。\\n俺の夜勤バイトも、今日で3か月目になった。夜勤を選んだのは手当がつくからで、生活費はこのバイト一本でまかなっている。大学には行っていない。将来のことは、まだ何も決めていない。"),
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
