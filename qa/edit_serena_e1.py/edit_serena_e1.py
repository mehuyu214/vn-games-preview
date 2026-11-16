# -*- coding: utf-8 -*-
"""W2 セレナ E1（告白後の対立・障害の皆無）の解消。
再計測: 対立/反対/つわり/体調/すれ違い/喧嘩/誤解/勘違い はセレナ全250ノードで
0件。「不安」は e64 の1件のみ、「怖い」は e11 の1件のみ、「違っていた」は
e79 の1件のみ。告白後、家族・仕事・体調・周囲の反応といった壁は最後まで
登場しない。e104（週末の買い物、pos 179）の末尾に、館を出る二人へ向けられる
使用人たちの視線（好奇の目・訝しむ目）を1文追加する。セレナが振り返らず
俺の袖を引いて歩き出す形で同ノード内に解消し、新たな未回収の糸は残さない。
e105 の「久しぶりですの。……わくわくしますわ」へ自然に接続する。
全員成人・合意ありは維持。text のみ変更。ノードID・構造は不変。
"""
import io, sys

PATH = "data.js"

REPLACEMENTS = {
"e104": ("――雇われの身の俺にまで気を配ってくれる彼女に、俺は小さく頭を下げた。",
        "――雇われの身の俺にまで気を配ってくれる彼女に、俺は小さく頭を下げた。館を出る俺たちの背中に、使用人たちの視線が集まっていた。好奇の目も、訝しむ目もある。――だが、セレナは振り返らず、俺の袖をそっと引いて歩き出した。"),
}

def main():
    with io.open(PATH, encoding="utf-8") as f:
        src = f.read()
    for nid, (old, new) in REPLACEMENTS.items():
        needle = old + '"'
        n = src.count(needle)
        if n != 1:
            print(f"FAIL {nid}: count={n}")
            sys.exit(1)
        src = src.replace(needle, new + '"', 1)
    with io.open(PATH, "w", encoding="utf-8") as f:
        f.write(src)
    print(f"OK: {len(REPLACEMENTS)} nodes rewritten")

if __name__ == "__main__":
    main()
