# -*- coding: utf-8 -*-
"""W2 桜 D3: 悠太の人物像が希薄（「彼自身の事情（仕事、家族、将来設計、
戻ってきた土地への思い）は描かれない」）。
再計測：仕事は a178（勤務は地元に固定、育休）で言及済み。将来設計も a178
と a182（父親の自覚）で最低限の線あり。残るのは悠太自身の家族（実家の
両親）への言及で、桜編全体で 0 件。a132/a133/a135/a182 の「母さん／父親」
はすべて生まれてくる子をめぐる二人の話で、悠太の実家ではない。
a06（地元に戻ってきた経緯をさくらに話す地の文）に、実家の両親が
喜んでくれた一文を追加し、悠太の家族の存在を地に足をつける。
a21/a207 の「俺の部屋」は実家の自室として整合。全員成人・合意ありは維持。
text のみ変更。ノードID・構造は不変。"""
import io, os, sys

PATH = "data.js"

REPLACEMENTS = {
"a06": ("就職で地元に戻ってきたこと、来週から新社会人になることを話すと、さくらは目を輝かせた。",
        "就職で地元に戻ってきたこと、来週から新社会人になることを話すと、さくらは目を輝かせた。実家の両親も、俺が地元に戻ってきたのを喜んでくれた。"),
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
