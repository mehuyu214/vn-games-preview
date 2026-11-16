# -*- coding: utf-8 -*-
"""W2 桜 D3（続）: 悠太の家族軸の残留解消。
先行作業（8c919d6）で a06 に「実家の両親も、俺が地元に戻ってきたのを喜んでくれた。」
を追加済みだが、以降 261 ノードで両親は一度も再登場しない（「両親」a06 のみ・
「家族」0件）。a06 の伏線が回収されないままになっている。
a171（胎動の夜・秋、悠太の台詞）に実家の両親への妊娠報告と父の反応を 1 文追加し、
a06 の伏線を回収する。父親になる実感の転換点としても機能する。
text のみ 1 ノード。ノードID不変・全員成人・合意ありは維持。"""
import io, os, sys

PATH = "data.js"

REPLACEMENTS = {
"a171": ("ああ……ほんとだ。……小さな命が、さくらの中で……俺の手のひらに、確かに伝わってくる。",
         "ああ……ほんとだ。……小さな命が、さくらの中で……俺の手のひらに、確かに伝わってくる。実家の両親に報告したとき、父さんまで声を震わせて喜んでくれたんだ。"),
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
