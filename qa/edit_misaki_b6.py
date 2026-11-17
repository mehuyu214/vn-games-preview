# -*- coding: utf-8 -*-
"""W2 美咲 B6 の残留「大きな乳房が、月明かりに白く浮かぶ」の書き分け。
実測（qa/measure_misaki_b6.js）：同句は美咲で b130（α・記念日の夜）と
b170（β・ベビー用品の夜）の2回残存し、文面は「頷くと、」の有無を除き同一。
両ブロックの導入（b125／b163）は光源を「真夜中のコンビニの灯り」と明示
しており、「月明かり」は場面の光源とも食い違う。
改稿（text のみ2ノード、jump・flag・ノードID不変）：
- b130（α）：光源を b125 と整合する「窓の外のコンビニの灯り」に差し替え。
- b170（β）：β固有の小道具「畳んだばかりの小さな肌着」を文に組み込み、
  b130 との書き分けを明確にする。
他作品の同句（a138／c132／d131／e131）は各1回で作品内の反復ではないため
不変。全員成人・合意ありは維持。
検証：verify_data ALL OK、sim_all_routes は変更前後で完全一致
（全5作品 failed=0・両ED到達）を確認すること。
"""
import io, os, sys

PATH = "data.js"

REPLACEMENTS = [
    ('{ id: "b130", r18: true, name: "", text: "頷くと、美咲さんはベッドに横たわり、自ら俺の服を脱がせていく。大きな乳房が、月明かりに白く浮かぶ。" }',
     '{ id: "b130", r18: true, name: "", text: "頷くと、美咲さんはベッドに横たわり、自ら俺の服を脱がせていく。大きな乳房が、窓の外のコンビニの灯りに白く浮かぶ。" }'),
    ('{ id: "b170", r18: true, name: "", text: "ベッドに横たわり、美咲さんは自ら俺の服を脱がせていく。大きな乳房が、月明かりに白く浮かぶ。" }',
     '{ id: "b170", r18: true, name: "", text: "ベッドに横たわり、美咲さんは自ら俺の服を脱がせていく。畳んだばかりの小さな肌着の隣で、大きな乳房が白く浮かぶ。" }'),
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
    print("OK: rewrote b130/b170 (misaki B6 residue)")

if __name__ == "__main__":
    main()
