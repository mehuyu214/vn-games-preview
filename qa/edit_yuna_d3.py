# -*- coding: utf-8 -*-
"""W2 優奈 D3: 悠太の人物像が希薄（現在の職業・生活基盤が全250ノード中 0 件）。
d41「受験も、就活も、ここで乗り越えてきたので」は過去の話で終わっており、
現在の仕事が不明。d40「悠太さんにも、そういう宝物、ある？」への答えに
現在の生活基盤を1文追加する。d42 の貸出カードの記録（成長を見守る）とも接続する。
残置: 悠太の年齢は依然として全編で未言及（就活を終えた新社会人であることからの推測のみ）。
text のみ変更。ノードID・構造は不変。"""
import io, sys

PATH = "data.js"

REPLACEMENTS = {
"d41": ("……あります。この図書館で過ごした時間、ですかね。受験も、就活も、ここで乗り越えてきたので。",
          "……あります。この図書館で過ごした時間、ですかね。受験も、就活も、ここで乗り越えてきたので。今は地元の会社に勤めていて、仕事帰りに寄るのが日課なんです。"),
}

def main():
    with io.open(PATH, encoding="utf-8") as f:
        src = f.read()
    for nid, (old, new) in REPLACEMENTS.items():
        # text フィールドの引用符付き完全一致で置換（他ノードへの誤爆防止）
        needle = '"' + old + '"'
        n = src.count(needle)
        if n != 1:
            print(f"FAIL {nid}: count={n}")
            sys.exit(1)
        src = src.replace(needle, '"' + new + '"', 1)
    with io.open(PATH, "w", encoding="utf-8") as f:
        f.write(src)
    print(f"OK: {len(REPLACEMENTS)} nodes rewritten")

if __name__ == "__main__":
    main()
