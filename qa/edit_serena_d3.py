# -*- coding: utf-8 -*-
"""W2 セレナ D3（悠太の人物像の希薄さ）＋ C5 残置（マルタ未登場）の解消。
再計測: 悠太の発話は全250ノード中31ノード（セレナ104）のままで、e01「亡き恩師の
紹介で雇われた」以外に来歴・立場の描写なし。マルタは e104 の言及1件のみで、
一度も登場・発話せず。e104（週末の買い物、pos 179）はマルタが見送る場面で、
地の文にマルタの台詞を引用して初発話を与え、雇われの身の俺への気配りに
悠太が頭を下げる一文を足す。住み込みで働く雇われの立場への自覚と、
使用人との関係が一行で示され、D3 の立場の希薄さと C5 のマルタ未登場の
両方に寄与する。e105 以後の買い物ブロックの流れは維持。全員成人・合意ありは維持。
text のみ変更。ノードID・構造は不変。"""
import io, sys

PATH = "data.js"

REPLACEMENTS = {
"e104": ("――その週末。セレナに誘われ、麓の町へ買い物に出かけた。令嬢の外出は珍しく、使用人のマルタが、こっそりと見送ってくれた。",
          "――その週末。セレナに誘われ、麓の町へ買い物に出かけた。令嬢の外出は珍しく、使用人のマルタが、こっそりと見送ってくれた。「いってらっしゃいませ、お嬢様。……悠太様も、お気をつけて」――雇われの身の俺にまで気を配ってくれる彼女に、俺は小さく頭を下げた。"),
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
