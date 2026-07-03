#!/usr/bin/env bash
# One-click launcher for Perch (Tauri desktop app on macOS).
# Usage:
#   ./start.sh           launch the installed /Applications/Perch.app (detached from terminal)
#   ./start.sh --build   rebuild from source, reinstall to /Applications, then relaunch
# Safe to re-run: launching while already running just brings the window to front.
set -euo pipefail

# Anchor relative paths (pnpm tauri build, bundle output) to the repo root,
# so invoking from a subdir can't build in one place and cp from another.
CDPATH='' cd "$(dirname "$0")"

APP="/Applications/Perch.app"
BIN="$APP/Contents/MacOS/perch-app"
SRC="src-tauri/target/release/bundle/macos/Perch.app"

if [[ "${1:-}" == "--build" ]]; then
  command -v pnpm >/dev/null || { echo "❌ pnpm not found (this workspace requires pnpm, not npm)"; exit 1; }
  echo "==> Building release bundle (pnpm tauri build)..."
  pnpm tauri build
  # Validate the build output BEFORE any destructive step, so a failed/odd
  # build can never leave the user with the app killed and uninstalled.
  [[ -d "$SRC" ]] || { echo "❌ Build output $SRC not found; leaving $APP untouched."; exit 1; }
  echo "==> Stopping running instance (if any)..."
  pkill -f "$BIN" 2>/dev/null || true
  # Wait until the old process is really gone: otherwise `open` may just
  # activate the dying instance, and the check below could see its PID.
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    pgrep -f "$BIN" >/dev/null 2>&1 || break
    sleep 0.5
  done
  if pgrep -f "$BIN" >/dev/null 2>&1; then
    pkill -9 -f "$BIN" 2>/dev/null || true
    sleep 1
  fi
  if pgrep -f "$BIN" >/dev/null 2>&1; then
    echo "❌ Old instance refuses to exit; leaving $APP untouched."; exit 1
  fi
  echo "==> Installing to /Applications..."
  rm -rf "$APP"
  cp -R "$SRC" /Applications/
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
