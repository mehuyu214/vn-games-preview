# Capacitor（Android）向けメモ

このディレクトリは Capacitor 構成の**雛形**です。`android/` プラットフォームは
まだ生成していません（`npx cap add android` で生成します。生成物は大きいため、
必要になった時点で各自の環境で作成してください）。

## セットアップ手順（想定）

前提: Node.js 20 前後、JDK 21（Android Studio 同梱のもの）、Android SDK。
Capacitor 7 系を想定しています。要件の正確なバージョンは
[Capacitor 公式ドキュメント](https://capacitorjs.com/docs/getting-started/environment-setup)
で必ず確認してください（この雛形作成時点では実機ビルド未検証です）。

```bash
cd packaging
bash sync_www.sh                 # www/ を最新化
cd capacitor
npm install
npx cap add android              # android/ を生成（初回のみ）
npx cap sync android             # www/ の内容を android 側へ反映
npx cap open android             # Android Studio で開く
# または CLI だけで debug APK:
cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

本体（シナリオ・エンジン）を更新したら、`bash sync_www.sh` → `npx cap sync android`
を再実行しないとアプリ側に反映されません。

## Android 向けの注意点

### 画面・操作
- 本体は 16:9 ステージ＋cqw 単位で拡縮する設計で、横画面前提のレイアウトです。
  縦持ちでは上下に余白が出ます。横画面固定にしたい場合は
  `android/app/src/main/AndroidManifest.xml` の Activity に
  `android:screenOrientation="landscape"` を追加してください（未設定の雛形では回転可）。
- フルスクリーン化（ステータスバー／ナビゲーションバー非表示）は標準の
  Capacitor だけでは行いません。必要なら Android Studio 側でテーマ調整するか、
  `@capacitor/status-bar` 等のプラグイン導入を検討してください（この雛形には未導入）。
- タップ操作はそのまま使えます。本体 UI はタッチ前提で検証済みのサイズですが、
  ノッチ／パンチホール端末では `viewport-fit=cover` の余白の出方を実機で確認してください。

### セーブデータ（localStorage）
- Capacitor の WebView では localStorage はアプリ専用領域に保存され、
  通常の利用では永続します。ただし以下のケースで消える可能性があります:
  - アプリのアンインストール、端末の「ストレージを消去」
  - WebView 実装の更新やストレージ逼迫時の OS による削除（低容量端末）
- 本体にはセーブデータのエクスポート／インポート（SYSTEM 設定、JSON）が
  実装済みなので、バックアップ手段として案内するのが安全です。
- 将来 IndexedDB へ移行する場合はこの限りではありません（現状は localStorage 設計）。

### 音声まわり
- BGM・ボイスは同梱ファイル（assets/audio/voice は www/ に含まれる）から
  再生され、オフラインで動作します。ファイルは合計 140MB 超あるため、
  APK サイズも同程度以上になります。配布方法（ストア／直接配布）に応じて
  許容できるか確認してください。
- 端末のメディア音量・サイレントモードの扱いは WebView の標準挙動に従います。

### 署名・配布
- `assembleDebug` の APK はデバッグ署名のため、そのまま配布する用途には向きません。
  正式配布には keystore による release 署名が必要です
  （`./gradlew assembleRelease` ＋署名設定。keystore はリポジトリに含めないこと）。
- Google Play 配布の場合は APK ではなく AAB（`bundleRelease`）が必要です。
- appId は `com.mehuyu214.vnarcade` としています。公開前に所有ドメイン等に
  合わせて変更する場合は `capacitor.config.ts` と android 側の両方を揃えてください
  （公開後の appId 変更は別アプリ扱いになります）。

## 検証済み事項（2026-11-12、A3）

- GitHub Actions（A2、run 43147533570）で `cap add android` →
  `assembleDebug` が成功し、デバッグ APK（144MB）が成果物化された。
- タッチ操作：Playwright モバイルエミュレーション（Pixel 7、タッチ有効）
  で `qa/test_a3_android.py` 21/21 合格。タップのみでポータル→年齢
  ゲート→タイトル→本編→選択肢→クイックセーブ／スロット保存まで到達。
- 永続化：同テストでリロード後も `vna_saves_v1` が残存し、タイトル
  の LOAD から保存シーンへ復帰できることを確認。Capacitor の
  WebView は `server.androidScheme: 'https'` によりオリジン
  `https://localhost` で localStorage がアプリ領域に永続化される設計。
- `bash sync_www.sh` の出力（208ファイル・約143MB）が本体と一致することを確認。

## 未検証事項

- この雛形は実機／エミュレータでのビルド・起動を確認していません。
  初回は必ずローカル環境で `assembleDebug` が通ることと、実機で
  起動・セーブ保存・BGM 再生ができることを確認してください。
