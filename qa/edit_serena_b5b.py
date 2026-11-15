# -*- coding: utf-8 -*-
"""W2 セレナ B5（残り）: バラ園の夢の二重表明の解消。
e151（pos 38、午後の紅茶）で夢は既に初披露され、e152 で悠太は
「俺、最初のお客さんになります」、e154 でセレナは「一番最初のお客さん
になって」と約束済み。ところが翌朝の朝食ブロック e185（pos 103）は
「ねえ悠太、わたくしの夢、ご存知かしら」と初披露の体裁で夢を語り直し、
e186「バラ園ですか」も初聞きの返答になっている。e185・e186 を、この前
の会話への言及に書き換え、二重表明を解消する。e187「その庭園でね、
いつか、わたくしたちの結婚式を挙げるの」は夢の延長としての願望のため
残置（e234 の結婚の約束は既に書き換え済み）。text のみ変更。
ノードID・構造は不変。"""
import io, sys

PATH = "data.js"

REPLACEMENTS = {
"e185": ("ねえ悠太、わたくしの夢、ご存知かしら。……この庭園を、もっとたくさんの人に開くの。バラ園としてね。",
          "ねえ悠太、この前お話ししたバラ園のこと、覚えていらっしゃいますわね。……あの庭園を、もっとたくさんの人に開くの。バラ園としてね。"),
"e186": ("バラ園ですか。……セレナなら、きっと素敵な庭園になりますよ。",
          "もちろんです。……この前も言いましたけれど、セレナなら、きっと素敵な庭園になりますよ。"),
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
