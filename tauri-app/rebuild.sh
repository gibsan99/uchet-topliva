#!/bin/bash
# Пересборка приложения "Учёт топлива" после правок в "Учёт топлива.html"
# (dist/index.html — обычная копия, не симлинк — копировать нужно вручную перед запуском)
# Запуск: bash rebuild.sh
set -e

BASE="/Users/mackbookm4/Desktop/fuel app"

echo "→ Собираю .app (может занять до минуты)..."
source "$HOME/.cargo/env"
cd "$BASE/tauri-app/src-tauri"
cargo tauri build 2>&1 | tail -8

APP_BUILT="$BASE/tauri-app/src-tauri/target/release/bundle/macos/Учёт топлива.app"
DEST="$HOME/Desktop/Учёт топлива.app"
if [ -d "$APP_BUILT" ]; then
  rm -rf "$DEST"
  cp -R "$APP_BUILT" "$DEST"
  echo "✓ Готово. Обновлённое приложение: $DEST"
else
  echo "⚠ Сборка .app не найдена — проверьте вывод выше."
fi
