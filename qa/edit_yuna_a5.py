# -*- coding: utf-8 -*-
"""W2 優奈 A5: NORMAL END（d20）への接続の唐突さの解消（優奈編）。
レビュー A5「NORMAL END（d20）への接続がどちらの経路でも唐突。
経路B（d12で家への誘いを辞退）では、豪雨と『傘が一本だけ』という
d11 の問題提起が未解決のまま、即座に図書館での別れの台詞（d20）へ
切断される。雨の中をどう帰ったのかは描かれない。経路A（d07で消極側）
では d09 の『じゃあ、今日はここまでにしましょう』の直後に同じ d20
が接続され、二重に閉めの挨拶を聞く形になる」への対応。

実測（着手前）:
- 経路A: d07 消極 → d09「じゃあ、今日はここまでにしましょう。
  雨、降ってきちゃったみたいだけど、大丈夫？」→ d15（love<2）→ d20。
- 経路B: d11「困ったわ、傘が一本だけなの。……ねえ悠太さん。今日は
  わたしの家に寄っていかない？」→ d12 辞退 → d15 → d20。
- d20 現行文は「今日は手伝ってくれてありがとう。……また本を借りに
  来てね、悠太さん。」で、両経路とも雨・傘への言及がなく、経路Aでは
  d09 に続く2度目の閉めの挨拶になっている。
- A6（d42 face=angry／d143 face=sleepy）は現行 face=smile で解消済み、
  B3（d100=d33x／d102=d35x の全文一致）も解消済み、D4 の集中形
  （d104–d123／d217 ブロックの「……」開始）は 0 件で解消済みのため、
  本ランは A5 を選択。

改稿（text のみ 1 ノード、他作品・構造は無変更）:
- d20: 感謝は残しつつ、雨への返答として傘を貸す一文を挿入。経路Aでは
  d09「大丈夫？」への答えになり、経路Bでは d11「傘が一本だけ」の
  解決になる（優奈は閉館まで図書館に残るため、唯一の傘を悠太に貸す）。
  別れの挨拶は「また本を借りに来てね」の1回に絞り、二重の閉めを弱める。
  END マーカー行は無変更。
"""
import io, os, sys

PATH = "data.js"

REPLACEMENTS = {
"d20": ("今日は手伝ってくれてありがとう。……また本を借りに来てね、悠太さん。\\n【NORMAL END ― 閉館後の図書室】",
        "今日は手伝ってくれてありがとう。……雨、気をつけて帰ってね。傘、貸してあげるから。……また本を借りに来てね、悠太さん。\\n【NORMAL END ― 閉館後の図書室】"),
}

def main():
    with io.open(PATH, encoding="utf-8") as f:
        src = f.read()
    for nid, (old, new) in REPLACEMENTS.items():
        n = src.count(old)
        if n != 1:
            print(f"FAIL {nid}: count={n}")
            sys.exit(1)
        src = src.replace(old, new, 1)
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
