# -*- coding: utf-8 -*-
"""W2 凛 B5: 「翌朝」と「彼女宣言」の二重演じの解消。
c41x→c28（彼の部屋の朝「おはよう、悠太。……今日からわたしは、あなたの彼女」）
→c181（「――研究室の朝。」と場面を切り直し）→c182（再び「おはよう、悠太」）
と、同じ朝・同じ挨拶が2回提示されていた。
優奈 B6（d179/d180）・セレナ B6（e180/e181）と同型の対応。
c181 を場面転換のない同一の朝の続きに、c182 を繰り返しの挨拶を省いた
会話の続きに書き換える。text のみ 2 ノード（他作品・構造は無変更）。
c184「隣の席はあなたのものよ」は研究室の席モチーフ（E4で評価）として残置。
"""
import io, sys

PATH = "data.js"

REPLACEMENTS = {
"c181": ("――研究室の朝。凛さんは隅で、コーヒーを淹れていた。眼鏡の奥の瞳が、朝の光に少しだけ潤んでいる。",
          "研究室に着くと、凛さんは隅で、コーヒーを淹れていた。眼鏡の奥の瞳が、朝の光に少しだけ潤んでいる。"),
"c182": ("おはよう、悠太。……ふふ、昨日の夜は、よく眠れた？　わたしは、なんだか全然眠れなくて。",
          "ねえ悠太、昨日の夜は、よく眠れた？　わたしは、なんだか全然眠れなくて。"),
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
    with io.open(PATH, "w", encoding="utf-8") as f:
        f.write(src)
    print(f"OK: {len(REPLACEMENTS)} nodes rewritten")

if __name__ == "__main__":
    main()
