#!/usr/bin/env bash
# One-click launcher for Perch (Tauri desktop app on macOS).
# Usage:
#   ./start.sh           launch the installed /Applications/Perch.app (detached from terminal)
#   ./start.sh --build   rebuild from source, reinstall to /Applications, then relaunch
# Safe to re-run: launching while already running just brings the window to front.
set -euo pipefail

APP="/Applications/Perch.app"
BIN="$APP/Contents/MacOS/perch-app"

if [[ "${1:-}" == "--build" ]]; then
  command -v pnpm >/dev/null || { echo "❌ pnpm not found (this workspace requires pnpm, not npm)"; exit 1; }
  echo "==> Building release bundle (pnpm tauri build)..."
  pnpm tauri build
  echo "==> Stopping running instance (if any)..."
  pkill -f "$BIN" 2>/dev/null || true
  echo "==> Installing to /Applications..."
  rm -rf "$APP"
  cp -R src-tauri/target/release/bundle/macos/Perch.app /Applications/
fi

if [[ ! -d "$APP" ]]; then
  echo "❌ $APP not found. Build & install first:"
  echo "   ./start.sh --build"
  exit 1
fi

# `open` hands the process to launchd (PPID=1), so it survives closing this terminal.
open "$APP"

pid=""
for _ in 1 2 3 4 5; do
  pid="$(pgrep -f "$BIN" | head -1 || true)"
  [[ -n "$pid" ]] && break
  sleep 1
done

if [[ -z "$pid" ]]; then
  echo "⚠️  Launched but process not detected after 5s; check with: pgrep -fl -i perch"
  exit 1
fi

# Verify it is really detached ($PPID is a readonly bash builtin — don't assign to it).
parent_pid="$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ' || true)"
if [[ "$parent_pid" == "1" ]]; then
  echo "✅ Perch is running (PID $pid, parent launchd — survives closing this terminal)"
elif [[ -z "$parent_pid" ]]; then
  echo "⚠️  Perch (PID $pid) exited right after launch; check with: pgrep -fl -i perch"
  exit 1
else
  echo "⚠️  Perch is running (PID $pid) but its parent is $parent_pid, not launchd,"
  echo "    so it may die with this terminal. Relaunch detached with:"
  echo "    pkill -i perch-app && ./start.sh"
fi
