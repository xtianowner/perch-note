#!/usr/bin/env bash
# One-click launcher for Perch (Tauri desktop app on macOS).
# Usage:
#   ./start.sh           launch the installed /Applications/Perch.app (detached from terminal)
#   ./start.sh --build   rebuild from source, reinstall to /Applications, then relaunch
set -euo pipefail

APP="/Applications/Perch.app"
BIN="$APP/Contents/MacOS/perch-app"

if [[ "${1:-}" == "--build" ]]; then
  echo "==> Building release bundle (pnpm tauri build)..."
  pnpm tauri build
  echo "==> Installing to /Applications..."
  rm -rf "$APP"
  cp -R src-tauri/target/release/bundle/macos/Perch.app /Applications/
  pkill -i perch-app 2>/dev/null || true
fi

if [[ ! -d "$APP" ]]; then
  echo "❌ $APP not found. Build & install first:"
  echo "   ./start.sh --build"
  exit 1
fi

# `open` hands the process to launchd (PPID=1), so it survives closing this terminal.
open "$APP"
sleep 1

PID="$(pgrep -f "$BIN" | head -1 || true)"
if [[ -n "$PID" ]]; then
  echo "✅ Perch is running (PID $PID, detached from terminal)"
else
  echo "⚠️  Launched but process not detected yet; check with: pgrep -fl -i perch"
  exit 1
fi
