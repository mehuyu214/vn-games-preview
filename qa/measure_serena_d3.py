# -*- coding: utf-8 -*-
"""W2 セレナ D3 / C5 残置の再計測スクリプト。data.js の現状を数えるだけ。"""
import io, re, sys

src = io.open("data.js", encoding="utf-8").read()

def nodes():
    return [m.group(0) for m in re.finditer(r'\{ id: "(e\d+)"[^}]*\}', src)]

ns = nodes()
print("e nodes:", len(ns))
print("悠太発話:", sum(1 for n in ns if 'name: "悠太"' in n))
print("セレナ発話:", sum(1 for n in ns if 'name: "セレナ"' in n))
print("マルタ言及:", sum(1 for n in ns if "マルタ" in n))
print("マルタ台詞「いってらっしゃいませ」:", src.count("いってらっしゃいませ、お嬢様"))
print("雇われの身:", src.count("雇われの身の俺"))
print("旧文 e104:", src.count("使用人のマルタが、こっそりと見送ってくれた。」"))
print("新文 e104:", src.count("雇われの身の俺にまで気を配ってくれる彼女に、俺は小さく頭を下げた。"))
