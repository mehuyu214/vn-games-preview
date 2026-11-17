# VN Arcade 新UI 自動テスト（Playwright / ローカル配信）
import sys, json
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8901/index.html"
results = []
errors = []

def check(name, cond):
    results.append((name, bool(cond)))
    print(("PASS " if cond else "FAIL ") + name)

with sync_playwright() as p:
    b = p.chromium.launch(args=["--no-sandbox"])
    pg = b.new_page(viewport={"width": 1920, "height": 1080})
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.goto(BASE, wait_until="networkidle")

    check("ポータル表示・カード5件", pg.locator(".card").count() == 5)
    pg.screenshot(path="qa/shots/portal_1920.png")

    pg.click(".card >> nth=0")
    pg.wait_for_timeout(400)
    check("年齢ゲート表示", pg.locator("#gate").is_visible())
    pg.click("#gateYes")
    pg.wait_for_timeout(900)
    check("作品タイトル表示", pg.locator("#titleScr").is_visible())
    check("EXTRAはロック中", pg.locator('#tsMenu button[data-act="extra"]').is_disabled())
    pg.screenshot(path="qa/shots/title_sakura_1920.png")

    pg.click('#tsMenu button[data-act="start"]')
    pg.wait_for_timeout(1200)
    check("本編表示", pg.locator("#game").is_visible())
    check("1行目テキストあり", len(pg.locator("#text").inner_text()) > 0)
    pg.screenshot(path="qa/shots/game_1920.png")

    # 選択肢まで進める（書き直し版は最初の選択肢が a49＝48ノード先のため上限を拡大。
    # 旧版は a08＝7ノード先で 14 回で足りた。a01 は長文で複数ページに分かれる）
    found = False
    for i in range(100):
        if pg.locator("#choices").is_visible():
            found = True
            break
        pg.click("#textbox")
        pg.wait_for_timeout(320)
    check("選択肢が出現", found)
    pg.screenshot(path="qa/shots/choices_1920.png")
    pg.click("#choices button >> nth=0")
    pg.wait_for_timeout(600)
    check("選択肢を選んで進行", pg.locator("#choices").is_hidden())

    # クイックセーブ→セーブ画面
    pg.click('#quickbar button[data-q="qsave"]')
    pg.wait_for_timeout(300)
    pg.click('#quickbar button[data-q="save"]')
    pg.wait_for_timeout(500)
    check("セーブ画面表示", pg.locator("#saveScr").is_visible())
    check("クイック枠にデータ", "QUICK" in pg.locator("#slotQuick").inner_text())
    pg.screenshot(path="qa/shots/save_1920.png")
    pg.click("#saveClose")

    # 通常スロットにも保存
    pg.click('#quickbar button[data-q="save"]')
    pg.wait_for_timeout(400)
    pg.click("#slots .slot >> nth=0")
    pg.wait_for_timeout(400)
    txt = pg.locator("#slots .slot >> nth=0").inner_text()
    check("スロット1に保存された", "桜色シグナル" in txt)
    has_thumb = pg.locator("#slots .slot").nth(0).locator("img.thumb").count() == 1
    check("サムネイル付き", has_thumb)
    pg.click("#saveClose")

    # バックログ
    pg.click('#quickbar button[data-q="log"]')
    pg.wait_for_timeout(400)
    check("バックログ表示・行あり", pg.locator("#backlog").is_visible() and pg.locator(".log-line").count() > 3)
    pg.screenshot(path="qa/shots/log_1920.png")
    pg.click("#logClose")

    # コンフィグ
    pg.click('#quickbar button[data-q="config"]')
    pg.wait_for_timeout(300)
    check("コンフィグ表示", pg.locator("#configScr").is_visible())
    pg.screenshot(path="qa/shots/config_1920.png")
    pg.click("#configClose")

    # ボスキー
    pg.keyboard.press("Backspace")
    pg.wait_for_timeout(200)
    check("ボスキー表示", pg.locator("#bossScr").is_visible())
    pg.keyboard.press("Backspace")
    pg.wait_for_timeout(200)
    check("ボスキー解除", pg.locator("#bossScr").is_hidden())

    # a197の選択肢で「約束は約束だ。開けずに渡そう」を選んで trust=1 → a207分岐 else →
    # a277〜a297（選択肢なし28ノード）→ NORMAL END a297 到達（書き直し版の構造。
    # 旧版の a16／a20 は書き直しで消滅）。エンド到達後にタイトルへ戻るまで送る
    pg.evaluate("goTo('a197')")
    pg.wait_for_timeout(600)
    pg.click("#choices button >> nth=1")
    pg.wait_for_timeout(600)
    for _ in range(60):
        if pg.locator("#titleScr").is_visible():
            break
        if pg.locator("#game").is_visible():
            pg.click("#textbox")
        pg.wait_for_timeout(400)
    txt = pg.evaluate("localStorage.getItem('vna_progress_v1')") or ""
    check("エンディングが記録された", "a297" in txt)
    check("タイトルに戻った", pg.locator("#titleScr").is_visible())
    check("EXTRAが解放された", not pg.locator('#tsMenu button[data-act="extra"]').is_disabled())
    check("CONTINUEが有効", not pg.locator('#tsMenu button[data-act="continue"]').is_disabled())

    # EXTRA: フローチャート/ギャラリー/エンディング
    pg.click('#tsMenu button[data-act="extra"]')
    pg.wait_for_timeout(600)
    check("フローチャート表示", pg.locator(".flow-node").count() >= 4)
    pg.screenshot(path="qa/shots/flow_1920.png")
    pg.click('.extra-tabs button[data-tab="gallery"]')
    pg.wait_for_timeout(400)
    check("ギャラリー表示", pg.locator(".g-item").count() >= 5)
    pg.screenshot(path="qa/shots/gallery_1920.png")
    pg.click('.extra-tabs button[data-tab="ends"]')
    pg.wait_for_timeout(300)
    check("エンディング一覧", pg.locator(".end-row").count() == 2)
    pg.click("#extraClose")

    # ロード画面から復帰できる
    pg.click('#tsMenu button[data-act="load"]')
    pg.wait_for_timeout(400)
    pg.click("#slots .slot >> nth=0")
    pg.wait_for_timeout(800)
    check("ロードで本編復帰", pg.locator("#game").is_visible())

    # リロード後もポータルに達成チップ
    pg.goto(BASE, wait_until="networkidle")
    check("達成チップ表示", "END" in pg.locator(".card >> nth=0").inner_text())

    # 390x844 / 1366x768
    pg2 = b.new_page(viewport={"width": 390, "height": 844})
    pg2.on("pageerror", lambda e: errors.append("mobile: " + str(e)))
    pg2.goto(BASE, wait_until="networkidle")
    pg2.screenshot(path="qa/shots/portal_390.png")
    pg2.click(".card >> nth=0")
    pg2.wait_for_timeout(400)
    if pg2.locator("#gate").is_visible():
        pg2.click("#gateYes")
    pg2.wait_for_timeout(900)
    pg2.screenshot(path="qa/shots/title_390.png")
    pg2.click('#tsMenu button[data-act="start"]')
    pg2.wait_for_timeout(1200)
    pg2.screenshot(path="qa/shots/game_390.png")
    check("モバイルで本編表示", pg2.locator("#game").is_visible())
    pg3 = b.new_page(viewport={"width": 1366, "height": 768})
    pg3.goto(BASE, wait_until="networkidle")
    pg3.screenshot(path="qa/shots/portal_1366.png")
    b.close()

fails = [n for n, ok in results if not ok]
print("\n==== SUMMARY ====")
print(f"{len(results) - len(fails)}/{len(results)} passed")
if fails: print("FAILED:", fails)
if errors: print("PAGE ERRORS:", json.dumps(errors[:8], ensure_ascii=False))
sys.exit(1 if fails or errors else 0)
