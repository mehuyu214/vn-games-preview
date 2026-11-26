# スキップ（既読のみ）の回帰テスト
# 注: a311 は 2026-11-18 の W2 分割で生まれた a05 の後半ノード（a05→a311→a06）。
# a325 は 2026-11-26 の W2 分割で生まれた a04 の後半ノード（a04→a325→a05）。
# 既読シードに後半ノードを含めないと未読として止まる（エンジンは正しい）。
from playwright.sync_api import sync_playwright

def run(p, seed):
    ctx = p.chromium.launch(args=["--no-sandbox"]).new_context(viewport={"width":1280,"height":720})
    if seed:
        ctx.add_init_script("localStorage.setItem('vna_read_v1', JSON.stringify({sakura:['a01','a02','a03','a04','a325','a05','a311']}))")
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://localhost:8901/index.html", wait_until="networkidle")
    pg.click(".card >> nth=0"); pg.wait_for_timeout(300)
    if pg.locator("#gate").is_visible(): pg.click("#gateYes")
    pg.wait_for_timeout(500)
    pg.click('#tsMenu button[data-act="start"]'); pg.wait_for_timeout(900)
    first = pg.evaluate("cur.id")
    pg.click('#quickbar button[data-q="skip"]')
    pg.wait_for_timeout(1600)
    last = pg.evaluate("cur.id")
    ctx.browser.close()
    return first, last, errs

with sync_playwright() as p:
    f1, l1, e1 = run(p, seed=False)
    print(f"未読のみ: start={f1} after_skip={l1} errors={e1}")
    assert l1 == "a01", "未読がスキップされた！"
    f2, l2, e2 = run(p, seed=True)
    print(f"a01-a05,a311既読: start={f2} after_skip={l2} errors={e2}")
    assert l2 == "a06", f"既読を抜けて未読で止まるはずが {l2}"
print("SKIP TESTS PASSED")
