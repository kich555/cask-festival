#!/bin/bash
# 브랜드 가이드 HTML → A4 PNG(300dpi) + PDF. G마켓 산스 Medium/Bold가 설치돼 있어야 한다.
set -e
cd "$(dirname "$0")/../.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SRC="file://$PWD/scripts/brand-guide/guide.html"
OUT=public/exhibitor-assets
"$CHROME" --headless=new --disable-gpu --allow-file-access-from-files --hide-scrollbars \
  --force-device-scale-factor=3.125 --window-size=794,1123 \
  --screenshot="$OUT/cask-carnival-2026-brand-guide.png" "$SRC" 2>/dev/null
"$CHROME" --headless=new --disable-gpu --allow-file-access-from-files --no-pdf-header-footer \
  --print-to-pdf="$OUT/cask-carnival-2026-brand-guide.pdf" "$SRC" 2>/dev/null
ls -l "$OUT"/cask-carnival-2026-brand-guide.*
