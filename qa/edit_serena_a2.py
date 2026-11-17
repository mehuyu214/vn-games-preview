# -*- coding: utf-8 -*-
"""W2 セレナ A2: e13/e15 の love フラグの死に設定の解消。
レビュー A2「e13 は e06 の選択結果を love 経由で再判定しているだけ。
e15 積極側の set（love=2）は以後分岐ノードがないため一度も読まれない
書き込み専用フラグ。e15 消極側の set（love=0）もエンジンの applySet が
max 仕様のため love=1 を下げられず死に設定」への対応。
実測（qa/measure_serena_a2.js）：
- セレナで love を読む分岐は e13（min=1）のみで、e15 より後に読み手なし。
  e15 の love=2／love=0 はどちらも以後一度も読まれない死に書き込み。
- e13 は合流点として正当：e06 積極経路（e07→e09→e10→e11→e12→e13）と
  消極経路（e08→e13）の両方が到達し、then→e14→e15／else→e18（NORMAL END）
  の両側が通る。e13 自体は残す。
- e15 の後に love=2 の非自明な読み手を置くことはできない：e15 積極以外に
  e16 へ到達する経路がなく、e16 以後の分岐は常に then になるため。
  したがって死に書き込み自体を除去するのが誠実な対応。
改稿：
- data.js：e15 の2選択肢から死に set（love=2／love=0）を除去。
  選択肢の文面・jump（e16／e261）は不変で、選択の結果は jump 自体が担う。
  ノードID不変（新規ノードなし）。全員成人・合意ありは維持。
- engine.js：applySet の love max 特例を除去し、全フラグを代入仕様に統一
  （別途編集。love=0 の書き込みが以後は実際に love を下げる）。
  全5作品の分岐到達への影響はないことを sim の前後比較で確認する。
  （桜は love の読み手なし、美咲・凛は読み手が書き込みより前、優奈 d15 は
  min=2 で max時 love=1／代入時 love=0 のいずれも else、セレナは e13 が
  e15 より前。）
"""
import io, os, sys

PATH = "data.js"

OLD_POS = '{ text: "「今夜、あなたの部屋へ行ってもいいですか」", jump: "e16", set: { love: 2 } }'
NEW_POS = '{ text: "「今夜、あなたの部屋へ行ってもいいですか」", jump: "e16" }'
OLD_NEG = '{ text: "「おやすみなさい」と紳士的に帰る", jump: "e261", set: { love: 0 } }'
NEW_NEG = '{ text: "「おやすみなさい」と紳士的に帰る", jump: "e261" }'

def main():
    with io.open(PATH, encoding="utf-8") as f:
        src = f.read()
    if src.count(OLD_POS) != 1:
        print(f"FAIL positive: count={src.count(OLD_POS)}")
        sys.exit(1)
    if src.count(OLD_NEG) != 1:
        print(f"FAIL negative: count={src.count(OLD_NEG)}")
        sys.exit(1)
    src = src.replace(OLD_POS, NEW_POS, 1)
    src = src.replace(OLD_NEG, NEW_NEG, 1)
    tmp = PATH + ".tmp"
    with io.open(tmp, "w", encoding="utf-8") as f:
        f.write(src)
        f.flush()
        os.fsync(f.fileno())
    if os.path.getsize(tmp) != len(src.encode("utf-8")):
        print("FAIL: tmp size mismatch")
        sys.exit(1)
    os.replace(tmp, PATH)
    print("OK: removed dead love sets from e15 choices (love=2 / love=0)")

if __name__ == "__main__":
    main()
