import type { CapacitorConfig } from '@capacitor/cli';

// VN ARCADE — Capacitor 設定
//
// webDir は packaging/www（sync_www.sh の出力先）を指す。
// 本体の配布対象ファイルはここに集約されており、Capacitor は
// そのままアプリ内に同梱（オフライン動作）する。
//
// localStorage について:
//   Capacitor のデフォルトでは WebView 内のオリジンが
//   https://localhost（androidScheme: 'https'）になり、
//   localStorage はアプリのデータ領域に永続化される。
//   ただし WebView のストレージは OS の判断で消える可能性が
//   ブラウザよりは低いもののゼロではないため、セーブデータの
//   エクスポート機能（本体 SYSTEM 設定に実装済み）と併用するのが安全。
//   詳細は packaging/capacitor/README.md を参照。
const config: CapacitorConfig = {
  appId: 'com.mehuyu214.vnarcade',
  appName: 'VN ARCADE',
  webDir: '../www',
  server: {
    androidScheme: 'https',
  },
};

export default config;
