# -*- coding: utf-8 -*-
"""W2 セレナ A6: NORMAL END（e18）の e15 経由での接続の粗さの解消。
レビュー A6「e15 経由（部屋への誘いを紳士的に断る）では、誘った彼女への
返答の場面が丸ごと飛ばされ、いきなり同じ別れの台詞に接続される。誘われて
断った直後の気まずさや彼女の反応は一切なく、1ノードの薄さと合わせて
先行作と同型の弱さが残る」への対応。
実測：e15 消極「「おやすみなさい」と紳士的に帰る」は jump:"e18" で
NORMAL END へ直行し、反応ノードは存在しない。対して e06 消極には
e08（セレナの落胆「そう、ですよね。失礼いたしました。」）があり、
e13 経由で e18 へ接続される。
改稿（A1 選択肢挿入と同じ実績ある方式）：新規ノード e261 をセレナ
scenes 配列末尾（e260 の後）へ追加し、e15 消極の jump を e18 → e261
へ変更。e261 は断られた直後のセレナの反応（はしゃぎすぎたことへの
詫び＋踊れたことへの幸せ）で、jump:"e18" により既存の別れの台詞へ接続。
e18 自体は無変更のため e06→e08→e13→e18 経路は不変。GOOD ルート
（e15 積極→e16）は不変。ノードID不変（新規 e261 のみ追加）。
全員成人・合意ありは維持。"""
import io, os, sys

PATH = "data.js"

OLD_CHOICE = '{ text: "「おやすみなさい」と紳士的に帰る", jump: "e18", set: { love: 0 } }'
NEW_CHOICE = '{ text: "「おやすみなさい」と紳士的に帰る", jump: "e261", set: { love: 0 } }'

OLD_TAIL = '    { id: "e260", face: "smile", name: "セレナ", text: "……ふふ、即答ですのね。……やっぱり、悠太はわたくしの気持ちがわかってますのね。", jump: "e90" }'
NEW_TAIL = OLD_TAIL + ',\n    { id: "e261", face: "sad", name: "セレナ", text: "……そう、ですわね。……ごめんなさい、わたくし、はしゃぎすぎましたわ。……でも、あなたと踊れただけで、わたくし、とっても幸せでしたの。", jump: "e18" }'

def main():
    with io.open(PATH, encoding="utf-8") as f:
        src = f.read()
    if src.count(OLD_CHOICE) != 1:
        print(f"FAIL choice: count={src.count(OLD_CHOICE)}")
        sys.exit(1)
    if src.count(OLD_TAIL) != 1:
        print(f"FAIL tail: count={src.count(OLD_TAIL)}")
        sys.exit(1)
    if '"e261"' in src:
        print("FAIL: e261 already exists")
        sys.exit(1)
    src = src.replace(OLD_CHOICE, NEW_CHOICE, 1)
    src = src.replace(OLD_TAIL, NEW_TAIL, 1)
    tmp = PATH + ".tmp"
    with io.open(tmp, "w", encoding="utf-8") as f:
        f.write(src)
        f.flush()
        os.fsync(f.fileno())
    if os.path.getsize(tmp) != len(src.encode("utf-8")):
        print("FAIL: tmp size mismatch")
        sys.exit(1)
    os.replace(tmp, PATH)
    print("OK: e15 choice rewired to e261, new node e261 appended")

if __name__ == "__main__":
    main()
