# -*- coding: utf-8 -*-
"""W2 セレナ D1（関係進展の一足飛び）の再計測スクリプト。data.js の現状を数えるだけ。"""
import io, re, sys

src = io.open("data.js", encoding="utf-8").read()

def nodes():
    return [m.group(0) for m in re.finditer(r'\{ id: "(e\d+)"[^}]*\}', src)]

ns = nodes()
print("e nodes:", len(ns))
print("「身分なんて関係ない」:", src.count("身分なんて関係ない"))
print("「身分が違います」:", src.count("身分が違います"))
print("「身分」:", src.count("身分"))
print("旧文 e11:", src.count("セレナ。俺も同じ気持ちです。身分なんて関係ない。俺はあなたが好きだ。"))
print("新文 e11:", src.count("正直、怖いよ。俺は雇われの家庭教師で、君はヴェルディアの令嬢だ。"))
print("e62「決断は、思ったより重かった」:", src.count("決断は、思ったより重かった"))
