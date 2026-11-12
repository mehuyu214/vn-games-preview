#!/usr/bin/env bash
# sync_www.sh — VN ARCADE 配布用 www/ を組み立てる
#
# 本体リポジトリ（このスクリプトの1つ上の階層）から、配布に必要なファイルだけを
# packaging/www/ へコピーする。Electron / Capacitor の両パッケージは
# この www/ を唯一のコンテンツソースとして参照する。
#
# 使い方:
#   bash packaging/sync_www.sh
#
# - 再実行すると www/ の中身は配布対象と完全一致するよう同期される
#   （対象外になったファイルは削除される）。
# - 開発用ファイル（qa/, docs/, *.md, *.py, assets-raw/ など）は含めない。

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEST="${SCRIPT_DIR}/www"

# 誤った場所を消さないための安全ガード
case "${DEST}" in
  */packaging/www) ;;
  *) echo "ERROR: unexpected DEST=${DEST}" >&2; exit 1 ;;
esac

mkdir -p "${DEST}"

# 配布対象ファイル（単体ファイル）
FILES=(
  index.html
  style.css
  engine.js
  data.js
  voice_manifest.js
)

# 配布対象ディレクトリ（丸ごと）
DIRS=(
  assets
  audio
  voice
)

for f in "${FILES[@]}"; do
  if [[ ! -f "${ROOT}/${f}" ]]; then
    echo "ERROR: ${ROOT}/${f} が見つかりません" >&2
    exit 1
  fi
  cp -f "${ROOT}/${f}" "${DEST}/${f}"
  echo "file: ${f}"
done

for d in "${DIRS[@]}"; do
  if [[ ! -d "${ROOT}/${d}" ]]; then
    echo "ERROR: ${ROOT}/${d} が見つかりません" >&2
    exit 1
  fi
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete "${ROOT}/${d}/" "${DEST}/${d}/"
  else
    rm -rf "${DEST:?}/${d}"
    cp -r "${ROOT}/${d}" "${DEST}/${d}"
  fi
  echo "dir:  ${d}/"
done

echo
echo "www/ を作成しました: ${DEST}"
du -sh "${DEST}" 2>/dev/null || true
find "${DEST}" -type f | wc -l | xargs echo "ファイル数:"
