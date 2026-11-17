# -*- coding: utf-8 -*-
"""W2 書き直し版の全文一致テキスト残留の解消（桜・美咲）。
実測（qa/measure_rewrite_quality.js）：
- 桜：店主の「一杯どうだ。自信作だ」が a62／a185／a227 の3回、
  「……一杯どうだ。自信作だ」が a79／a270 の2回。旧版では全文一致
  10組→0組に解消済みの方針で、書き直し版での再発。決め台詞の反復
  ギャグではあるが各場面の直後ノード（ミキのツッコミ／悠太の独白）が
  場面ごとに違うため、店主の台詞も各場面に合わせて書き分ける。
- 美咲：b122／b123 が全文一致。b108 の選択肢による並行ルート
  （b109-b115 経由は b115→b123、b116-b122 経由は b122→b124）で
  両方とも到達する。b115 が既に口頭で問いかけているルート1側の
  b123 を、結論づける独白に書き分ける。
改稿（text のみ6ノード、jump・flag・ノードID不変）：
- a62（搬入祝い）：「搬入祝いだ。一杯どうだ。自信作だ」
  （直後 a63「店主、それ祝杯のつもり！？」と整合）
- a79（昔話の逸らし）：「……昔話はこのへんにして。一杯どうだ、冷えてるぞ」
  （直後 a80「話を逸らす速度だけは一流だ」と整合）
- a185（氷の代わり）：「氷はないがな。冷たいのならある。一杯どうだ」
  （直後 a186「店主、氷の代わりがそれ！？」と整合）
- a227（藤堂の決意の後）：「……決まったな。一杯どうだ。今日のは特別だ」
  （直後 a228「いただきます。あ、これは」と整合）
- a270（妊娠報告の祝杯）：「……めでたい。一杯どうだ。今日のは祝杯だ」
  （直後 a271「店主、今のは祝杯なの！？」と整合）
- b123（ルート1の独白）：「（引き継いだのは、傘だけじゃない。……この店そのものだ）」
検証：verify_data ALL OK、sim_all_routes は変更前後で完全一致
（全5作品 failed=0・両ED到達）を確認すること。
注意：書き直し版 data.js は JSON 形式（"id": "a62"）のため照合は
id 行＋text 行の2行ブロックで行う。
"""
import io, os, sys

PATH = "data.js"

REPLACEMENTS = [
    ('        "id": "a62",\n        "name": "店主",\n        "text": "一杯どうだ。自信作だ"',
     '        "id": "a62",\n        "name": "店主",\n        "text": "搬入祝いだ。一杯どうだ。自信作だ"'),
    ('        "id": "a79",\n        "name": "店主",\n        "text": "……一杯どうだ。自信作だ"',
     '        "id": "a79",\n        "name": "店主",\n        "text": "……昔話はこのへんにして。一杯どうだ、冷えてるぞ"'),
    ('        "id": "a185",\n        "name": "店主",\n        "text": "一杯どうだ。自信作だ"',
     '        "id": "a185",\n        "name": "店主",\n        "text": "氷はないがな。冷たいのならある。一杯どうだ"'),
    ('        "id": "a227",\n        "name": "店主",\n        "text": "一杯どうだ。自信作だ"',
     '        "id": "a227",\n        "name": "店主",\n        "text": "……決まったな。一杯どうだ。今日のは特別だ"'),
    ('        "id": "a270",\n        "name": "店主",\n        "text": "……一杯どうだ。自信作だ"',
     '        "id": "a270",\n        "name": "店主",\n        "text": "……めでたい。一杯どうだ。今日のは祝杯だ"'),
    ('        "id": "b123",\n        "name": "悠太",\n        "text": "（前の店主が、今の店長に引き継いだ、ってことか？　傘ごと、この店を）"',
     '        "id": "b123",\n        "name": "悠太",\n        "text": "（引き継いだのは、傘だけじゃない。……この店そのものだ）"'),
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
    print("OK: rewrote a62/a79/a185/a227/a270/b123 (dup-text residue)")

if __name__ == "__main__":
    main()
