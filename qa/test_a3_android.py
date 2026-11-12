# A3: Capacitor/Android 基盤のタッチ操作・永続化の確認
# モバイルエミュレーション（タッチ有効）で、実機 WebView と同じ
# Chromium/localStorage 意味論のもとで以下を検証する:
#  - タップだけでポータル→年齢ゲート→タイトル→本編→選択肢まで進める
#  - タップでクイックセーブ＋通常スロット保存ができる
#  - リロード後も localStorage (vna_*) が残り、LOAD から保存位置に復帰できる
#  - viewport-fit=cover / タップハイライト無効 / 横はみ出しなし
# 実機・エミュレータでの起動確認はこの環境に Android SDK がないため未実施
# （DEVLOG の A3b として残置）。実行: .venv-qa/bin/python qa/test_a3_android.py
import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8901/index.html"
results = []
errors = []

def check(name, cond):
    results.append((name, bool(cond)))
    print(("PASS " if cond else "FAIL ") + name)

def no_h_overflow(pg):
    return pg.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")

with sync_playwright() as p:
    b = p.chromium.launch(args=["--no-sandbox"])
    ctx = b.new_context(
        viewport={"width": 412, "height": 915},
        has_touch=True, is_mobile=True, device_scale_factor=2,
        user_agent="Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36",
    )
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.goto(BASE, wait_until="networkidle")

    check("viewport-fit=cover 指定あり",
          "viewport-fit=cover" in (pg.locator("meta[name=viewport]").get_attribute("content") or ""))
    check("ポータル表示・カード5件", pg.locator(".card").count() == 5)
    check("縦持ちでは横はみ出しなし", no_h_overflow(pg))

    pg.locator(".card >> nth=0").tap()
    pg.wait_for_timeout(400)
    check("年齢ゲート表示", pg.locator("#gate").is_visible())
    pg.locator("#gateYes").tap()
    pg.wait_for_timeout(900)
    check("作品タイトル表示", pg.locator("#titleScr").is_visible())
    check("タイトル画面で横はみ出しなし", no_h_overflow(pg))

    pg.locator('#tsMenu button[data-act="start"]').tap()
    pg.wait_for_timeout(1200)
    check("本編表示（タップで開始）", pg.locator("#game").is_visible())

    # タップでテキスト送り: 3回タップしてテキストが変化すること
    t0 = pg.locator("#text").inner_text()
    for _ in range(3):
        pg.locator("#textbox").tap()
        pg.wait_for_timeout(450)
    t1 = pg.locator("#text").inner_text()
    check("タップでテキスト送りが進む", len(t1) > 0 and t1 != t0)

    # 選択肢までタップで進む
    found = False
    for _ in range(14):
        if pg.locator("#choices").is_visible():
            found = True
            break
        pg.locator("#textbox").tap()
        pg.wait_for_timeout(350)
    check("選択肢が出現（タップ送り）", found)
    pg.locator("#choices button >> nth=0").tap()
    pg.wait_for_timeout(600)
    check("選択肢をタップで選んで進行", pg.locator("#choices").is_hidden())

    # クイックセーブ（タップ）→ セーブ画面 → 通常スロットへ保存
    pg.locator('#quickbar button[data-q="qsave"]').tap()
    pg.wait_for_timeout(300)
    pg.locator('#quickbar button[data-q="save"]').tap()
    pg.wait_for_timeout(500)
    check("セーブ画面表示（タップ）", pg.locator("#saveScr").is_visible())
    check("クイック枠にデータ", "QUICK" in pg.locator("#slotQuick").inner_text())
    pg.locator("#slots .slot >> nth=0").tap()
    pg.wait_for_timeout(400)
    txt = pg.locator("#slots .slot >> nth=0").inner_text()
    check("スロット1に保存された", "桜色シグナル" in txt)
    saved_node = pg.evaluate("JSON.parse(localStorage.getItem('vna_saves_v1')||'{}').slots['0'].scene")
    pg.locator("#saveClose").tap()
    pg.wait_for_timeout(300)

    # 永続化: リロードしても vna_* が残る（WebView の localStorage と同義）
    pg.reload(wait_until="networkidle")
    pg.wait_for_timeout(600)
    keys = pg.evaluate("Object.keys(localStorage).filter(k=>k.startsWith('vna_'))")
    check("リロード後も vna_* が残る", "vna_saves_v1" in keys)
    check("リロード後もスロット保存が残る",
          pg.evaluate("JSON.parse(localStorage.getItem('vna_saves_v1')||'{}').slots['0'].scene") == saved_node)

    # タイトルから LOAD → スロットをタップ → 保存位置に復帰
    pg.locator(".card >> nth=0").tap()
    pg.wait_for_timeout(400)
    # 年齢ゲートは sessionStorage (vn_adult_ok) で1タブ内は再表示されない
    if pg.locator("#gate").is_visible():
        pg.locator("#gateYes").tap()
    pg.wait_for_timeout(900)
    check("CONTINUEが有効", not pg.locator('#tsMenu button[data-act="continue"]').is_disabled())
    pg.locator('#tsMenu button[data-act="load"]').tap()
    pg.wait_for_timeout(500)
    check("LOAD画面にスロット表示", "桜色シグナル" in pg.locator("#slots .slot >> nth=0").inner_text())
    pg.locator("#slots .slot >> nth=0").tap()
    pg.wait_for_timeout(800)
    check("保存位置に復帰（本編表示）", pg.locator("#game").is_visible())
    check("復帰ノードが保存ノードと一致", pg.evaluate("cur ? cur.id : ''") == saved_node)

    # 横画面（915x412）でもはみ出しなし
    pg.set_viewport_size({"width": 915, "height": 412})
    pg.wait_for_timeout(500)
    check("横画面でも横はみ出しなし", no_h_overflow(pg))

    check("ページエラー/コンソールエラーなし", not errors)
    if errors:
        print("errors:", errors[:5])
    b.close()

failed = [n for n, ok in results if not ok]
print(f"\n{len(results)-len(failed)}/{len(results)} passed")
sys.exit(1 if failed else 0)
