# -*- coding: utf-8 -*-
"""W2 死に love set の除去（桜 a08／a16、美咲 b17、凛 c17）。
前ラン（セレナ A2、qa/measure_serena_a2.js・qa/edit_serena_a2.py）の
同型対応。実測（qa/measure_misaki_rin_love.js、到達可能性ベース）：
- 桜：love を読む分岐ノードなし。a08／a16 の love set 4件は全て死に書き込み。
  a08 の promise は a19（branch flag=promise）が読むため残す。
- 美咲：love の読み手は b14（min=1）のみ。b07 の set は b14 に到達し有効。
  b17（b14 より後）の love=2／love=0 は以後読み手なしの死に書き込み。
- 凛：love の読み手は c16（min=1）のみ。c07 の set は c16 に到達し有効。
  c17（c16 より後）の love=2／love=2 は以後読み手なしの死に書き込み。
  c17 の said は c257（branch flag=said）が読むため残す。
- 優奈：d15 が d07／d12 の set を読むため残置なし。セレナ：e15 は前ランで除去済み。
改稿：data.js の上記8選択肢から love のみを除去（文面・jump・promise／said
は不変）。選択の結果は jump 自体が担う。ノードID不変（新規ノードなし）。
全員成人・合意ありは維持。なおセーブ欄の「好感度」表示は flags.love を
表示するため、除去した選択直後のセーブでは表示値が変わる（分岐への影響なし。
セレナ A2 と同じ扱い）。
検証：verify_data ALL OK、sim_all_routes は変更前後で完全一致
（全5作品 failed=0・両ED到達）を確認すること。
"""
import io, os, sys

PATH = "data.js"

REPLACEMENTS = [
    ('{ text: "「もちろん行くよ」と即答する", jump: "a09", set: { love: 1, promise: 1 } }',
     '{ text: "「もちろん行くよ」と即答する", jump: "a09", set: { promise: 1 } }'),
    ('{ text: "「予定見てからでいい？」と濁す", jump: "a10", set: { love: 0, promise: 0 } }',
     '{ text: "「予定見てからでいい？」と濁す", jump: "a10", set: { promise: 0 } }'),
    ('{ text: "「俺も同じだ」と気持ちを伝える", jump: "a17", set: { love: 2 } }',
     '{ text: "「俺も同じだ」と気持ちを伝える", jump: "a17" }'),
    ('{ text: "「今日はありがとう」と話を締める", jump: "a20", set: { love: 0 } }',
     '{ text: "「今日はありがとう」と話を締める", jump: "a20" }'),
    ('{ text: "「好きです。ずっと前から」と答える", jump: "b18", set: { love: 2 } }',
     '{ text: "「好きです。ずっと前から」と答える", jump: "b18" }'),
    ('{ text: "「尊敬してます」と無難に返す", jump: "b19", set: { love: 0 } }',
     '{ text: "「尊敬してます」と無難に返す", jump: "b19" }'),
    ('{ text: "「俺も凛さんが好きです」と先に言う", jump: "c18", set: { love: 2, said: 1 } }',
     '{ text: "「俺も凛さんが好きです」と先に言う", jump: "c18", set: { said: 1 } }'),
    ('{ text: "言葉を待つ", jump: "c19", set: { love: 2, said: 0 } }',
     '{ text: "言葉を待つ", jump: "c19", set: { said: 0 } }'),
]

def main():
    with io.open(PATH, encoding="utf-8") as f:
        src = f.read()
    for old, _new in REPLACEMENTS:
        if src.count(old) != 1:
            print(f"FAIL: count={src.count(old)} for {old[:40]}...")
            sys.exit(1)
    for old, new in REPLACEMENTS:
        src = src.replace(old, new, 1)
    tmp = PATH + ".tmp"
    with io.open(tmp, "w", encoding="utf-8") as f:
        f.write(src)
        f.flush()
        os.fsync(f.fileno())
    if os.path.getsize(tmp) != len(src.encode("utf-8")):
        print("FAIL: tmp size mismatch")
        sys.exit(1)
    os.replace(tmp, PATH)
    print("OK: removed dead love sets from a08/a16/b17/c17 (8 choices)")

if __name__ == "__main__":
    main()
