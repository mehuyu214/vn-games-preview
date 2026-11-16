# -*- coding: utf-8 -*-
"""W2 凛 E4: タイトルモチーフ「最終電車」の中盤での反復。c106 の text のみ変更。
ノードID・構造は不変。

現状（実測）:
- 「最終電車」は c06@56（冒頭・逃した夜）と c81@250（GOOD END・回収）のみ。
  中盤（pos 57〜249）での反復は 0 件。c81 の回収は前ランまでで完了済み。
- 「駅」は c90／c106／c113／c123（下見編）にあり、c106 は駅そのものが話題の
  ノードで、最終電車への言及を入れる自然な位置。

改稿:
- c106: 凛の街の品定めに「最終電車の時間も、もう覚えちゃった」を1文追加。
  c06 の「逃した夜」→ c106 の「新しい街で時間を覚えた」→ c81 の
  「窓の外を最終電車が通り過ぎていく」と三点でモチーフが弧を描く。
  計画的な凛の人物像とも整合。全員成人・合意ありは維持。
"""
import io, sys

PATH = "data.js"

REPLACEMENTS = {
"c106": ("ねえ悠太。見て、この街。研究所から駅まで徒歩10分。スーパーが二軒、図書館も近い。……住むには、悪くないわね。",
        "ねえ悠太。見て、この街。研究所から駅まで徒歩10分。スーパーが二軒、図書館も近い。……最終電車の時間も、もう覚えちゃった。住むには、悪くないわね。"),
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
