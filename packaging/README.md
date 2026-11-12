# VN ARCADE アプリ化パッケージング

ブラウザ版（GitHub Pages）の VN ARCADE を、Windows EXE / Android APK として
配布するためのパッケージング基盤です。本体ファイルは一切変更しておらず、
配布に必要なファイルだけを `www/` に集めて各ラッパーから参照します。

## 構成

```
packaging/
├── README.md               ← このファイル
├── sync_www.sh             ← 本体から配布対象だけを www/ に集めるスクリプト
├── www/                    ← 生成物（gitignore 対象）。約143MB / 208ファイル
├── electron/               ← Windows デスクトップ版（Electron + electron-builder）
│   ├── main.js
│   └── package.json        ← ビルド設定（build フィールド）を含む
├── capacitor/              ← Android 版の雛形（Capacitor）
│   ├── capacitor.config.ts
│   ├── package.json
│   └── README.md           ← Android 向けの注意点
└── workflows/
    └── build-apps.yml      ← GitHub Actions ワークフロー「案」
```

## www/ の作り方

```bash
bash packaging/sync_www.sh
```

本体ルートから以下の**配布対象だけ**を `packaging/www/` に同期します。
開発用ファイル（qa/、docs/、*.md、*.py、assets-raw/ など）は含みません。

- ファイル: `index.html`, `style.css`, `engine.js`, `data.js`, `voice_manifest.js`
- ディレクトリ: `assets/`, `audio/`, `voice/`

本体を更新したら、パッケージング前に必ずこのスクリプトを再実行してください。

## Electron 版（Windows）

### 読み込み方式（localStorage の永続性について）

`main.js` は同梱 www/ を **file:// ではなくカスタムプロトコル
`app://bundle/`** で配信します。理由:

- 本体のセーブ・コンフィグ・既読管理はすべて localStorage 前提です。
- file:// では Chromium がオリジンを不透明扱いし、localStorage の保存先が
  ファイル間で共有されたり、環境により不安定になります。
- `app` スキームを standard + secure な特権スキームとして登録すると
  オリジンが `app://bundle` に固定され、localStorage は通常の Web サイトと
  同じ規則で userData 配下（Windows では `%APPDATA%/VN ARCADE/`）に
  永続化されます。アプリを更新しても productName が同じ限り引き継がれます。
- ファイル返却には `net.fetch(file://...)`（Electron 公式の推奨パターン）を
  使うため、BGM の MP3 など大きな音声でも Range リクエストに応答でき、
  シーク再生が効きます。
- ウィンドウはリサイズ可、メニュー（表示 → 全画面表示 / F11）で全画面化、
  ネットワーク不要の完全オフライン動作です。Node 連携は無効化しています。

### ローカル実行・ビルド

```bash
bash packaging/sync_www.sh
cd packaging/electron
npm install
npm start          # 開発起動（www/ を直接参照）
npm run dist:win   # Windows 向けビルド（portable + NSIS の両方）
```

成果物の想定名: `VN-ARCADE-1.0.0-portable.exe`（単体・インストール不要）と
`VN-ARCADE-1.0.0-setup.exe`（NSIS インストーラ）。
ビルド設定は `packaging/electron/package.json` の `build` フィールドにあり、
www/ は extraResources として `resources/www` に配置されます。

## Capacitor 版（Android）

雛形のみです。手順と注意点（画面固定、セーブデータ、署名など）は
[`capacitor/README.md`](capacitor/README.md) を参照してください。
要点: `bash sync_www.sh` → `cd capacitor && npm install` →
`npx cap add android` → `npx cap sync android` → Android Studio で開くか
`cd android && ./gradlew assembleDebug` でデバッグ APK を作ります。

## GitHub Actions

`workflows/build-apps.yml` は**下書き**です。この場所では Actions に
認識されません。使う場合はリポジトリ直下の `.github/workflows/build-apps.yml`
へコピーしてください。内容:

- `electron-windows`（windows-latest）: www 同期 → Electron ビルド
  （portable + NSIS）→ Artifact 化。タグ時は Release に添付。
- `capacitor-android`（ubuntu-latest, JDK 21）: www 同期 →
  `cap add android` → debug APK ビルド → Artifact 化。タグ時は Release に添付。

## この環境で検証できたこと（2026-11-12）

- `sync_www.sh` の実行: www/ に 208ファイル・約143MB が集まり、
  ファイル数が本体側（assets 148 / audio 24 / voice 31 / ルート 5）と一致。
- `electron/main.js`: `node --check` で構文 OK。
- Electron: `npm install` 成功（electron 35.7.5、electron-builder 26.18.0）。
  Xvfb 上のヘッドレス起動でアプリが生存し続け、CDP 経由で
  `app://bundle/index.html` のロードとタイトル
  「VN Arcade — オンライン・ビジュアルノベル 5作品」の表示を確認。
- electron-builder の代替検証: Windows ターゲットはこの Linux 環境では
  ビルドできないため、`--linux dir` でパッケージングだけを実施し、
  `resources/app.asar` と `resources/www` が正しく配置されることを確認。
  生成した linux-unpacked 版も同様に起動・ロードを確認。
  （ビルド設定・extraResources の妥当性はこれで担保し、検証用の生成物は削除済み）
- Capacitor: `npm install` 成功（CLI 7.6.10）。
  ただし `capacitor.config.ts` を読むには TypeScript が必要だったため、
  devDependencies に `typescript` を追加済み（`npx cap --version` が通ることを確認）。
- `workflows/build-apps.yml`: YAML としてパース可能で、
  2 ジョブ（electron-windows / capacitor-android）の構造を確認。

## 未検証事項（正直な現状）

- **Windows 実機での確認はしていません。** EXE（portable / NSIS）の実ビルド、
  実機での起動、全画面表示、localStorage の永続化は Windows 環境での
  検証が必要です（上記の通り Linux 版で同等の仕組みまでは確認済み）。
- **Android のビルドはしていません。** この環境には Android SDK がないため、
  `cap add android` 以降（Gradle ビルド、実機／エミュレータでの起動、
  セーブ保存、BGM 再生）は未検証です。Capacitor の要件バージョン
  （JDK 等）も公式ドキュメントで再確認してください。
- コード署名（Windows）・リリース署名（Android）は未対応です。
  配布時は SmartScreen 警告やインストール制限の対象になりえます。
- アプリアイコンは未設定です（Electron / Android ともデフォルトアイコンのまま）。
- 自動更新（electron-updater 等）は未導入です。
- EXE / APK のサイズは www/ だけで約143MB あるため、それぞれ
  200MB 前後〜それ以上になる見込みです。

## 後片付けについて

検証で生成した `electron/node_modules`、`electron/dist`、
`capacitor/node_modules` は削除済みです（合計約800MB）。
再利用時は各ディレクトリで `npm install` し直してください。
`package-lock.json` は両ディレクトリに残してあります。
`www/` は生成物のまま残してあります（再生成は `bash packaging/sync_www.sh`）。
