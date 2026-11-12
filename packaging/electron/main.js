// VN ARCADE — Electron メインプロセス
//
// 読み込み方式について:
//   file:// ではなくカスタムプロトコル "app://bundle/" で同梱 www/ を配信する。
//   理由は localStorage の永続性:
//   - file:// では Chromium がオリジンを不透明扱いし、localStorage が
//     ファイル間共有になったり、環境によって保存が不安定になる。
//   - "app" スキームを standard + secure として登録すると
//     オリジンが "app://bundle" に固定され、localStorage / sessionStorage が
//     通常の Web サイトと同じ規則で userData 配下に永続化される。
//     （セーブスロット・コンフィグ・既読管理はすべて localStorage 前提の設計）
//   - アプリを更新しても productName が同じ限り userData は引き継がれる。
//
//   ファイルの返却には net.fetch(file://...) を使う。これは Electron 公式の
//   推奨パターンで、大きな音声ファイル（BGM の MP3）の Range リクエストにも
//   正しく応答できる（<audio> のシーク・ストリーミング再生に必要）。

'use strict';

const { app, BrowserWindow, Menu, protocol, net } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const SCHEME = 'app';
const HOST = 'bundle';

// www/ の場所: パッケージ時は Resources/www（extraResources で配置）、
// 開発時は packaging/www（sync_www.sh の出力先）。
const wwwDir = app.isPackaged
  ? path.join(process.resourcesPath, 'www')
  : path.join(__dirname, '..', 'www');

protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

function registerAppProtocol() {
  protocol.handle(SCHEME, (request) => {
    const url = new URL(request.url);
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return new Response('Bad Request', { status: 400 });
    }
    if (pathname === '/' || pathname === '') pathname = '/index.html';

    const filePath = path.normalize(path.join(wwwDir, pathname));
    // パストラバーサル防止: www/ の外は絶対に返さない
    if (filePath !== wwwDir && !filePath.startsWith(wwwDir + path.sep)) {
      return new Response('Forbidden', { status: 403 });
    }
    return net
      .fetch(pathToFileURL(filePath).toString())
      .catch(() => new Response('Not Found', { status: 404 }));
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 760,
    minWidth: 960,
    minHeight: 540,
    resizable: true,
    backgroundColor: '#111014',
    autoHideMenuBar: false,
    webPreferences: {
      // 同梱コンテンツだけを表示する前提。Node 連携は一切使わない。
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // 外部リンクや想定外の遷移でウィンドウを離れないようにする
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(`${SCHEME}://${HOST}`)) event.preventDefault();
  });

  win.loadURL(`${SCHEME}://${HOST}/index.html`);
  return win;
}

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'ファイル',
      submenu: [isMac ? { role: 'close' } : { role: 'quit', label: '終了' }],
    },
    {
      label: '表示',
      submenu: [
        {
          label: '全画面表示',
          accelerator: 'F11',
          role: 'togglefullscreen',
        },
        { type: 'separator' },
        { label: '再読み込み', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '開発者ツール', accelerator: 'CmdOrCtrl+Shift+I', role: 'toggleDevTools' },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// 二重起動を防ぐ（セーブデータへの同時書き込み回避）
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    registerAppProtocol();
    buildMenu();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
