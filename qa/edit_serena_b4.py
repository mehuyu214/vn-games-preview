# -*- coding: utf-8 -*-
"""W2 セレナ B4: 庭園散歩シーンの二重提示の解消。
e39 と e218 は GOOD ルートで連続（pos 4・5）し、本文がほぼ完全一致
（e218 は e39 の文に夕日の一文を足しただけ）で同じ散歩を要約と本編で
2 回見せていた。e39 を散歩への誘いの場面に書き換え、e218 を場面の
開幕として残す。e230 の紅茶残留「二人分の紅茶の湯気ならぬ」は現行文で
既に解消済み（白いバラの香りのみに）。e237→e40 の継ぎ目は、散歩の締め
から同じ庭園での母の話への自然な流れのため残置。
text のみ変更。ノードID・構造は不変。"""
import io, sys

PATH = "data.js"

REPLACEMENTS = {
"e39": ("ある日の授業後、セレナに誘われて庭園を歩いた。バラのアーチの下、彼女は少し寂しそうに微笑む。",
          "授業が終わると、セレナがそっと俺の袖を引いた。「ねえ先生、少しだけ、庭園を歩きませんか」"),
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
