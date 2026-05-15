<!-- purpose: English README (linked from the Chinese main README) -->

> 中文版 → [README.md](./README.md)

# Perch

> Always-on-top notepad with timestamps. Perch on your screen, jot anything, copy it as clean plain text.

A tiny cross-platform desktop floating notepad. Stays on top of every window, captures quick thoughts with automatic timestamps, and copies cleanly as plain text — no markdown surprises when you paste into Slack / a code comment / an email.

## Features

- **Always on top** — never hidden when you switch to Chrome, Slack, your terminal, etc.
- **Auto-timestamped entries** — every note records when it was last edited
- **Open editing** — every entry is a live textarea; type and walk away, autosave kicks in after 15s (also on blur and on close)
- **Per-entry title** (optional)
- **Soft delete** with 2-tap inline confirmation
- **One-click copy as plain text** — title + timestamp + content; no markdown rendering anywhere, what you typed is what you paste
- **Custom clipboard suffix/prefix** — append a signature, a tag, anything; pick before or after the body
- **Local-first** — data lives in SQLite under your app data dir; no account, no sync, no telemetry
- **i18n** — English / 中文
- **Light & dark** — follows system preference, designed in both
- **Adjustable text size** — Small / Medium / Large via Settings

## Status

V1 MVP — runs from source on macOS and Windows. Pre-built binaries not yet shipped.

See [`docs/design/0515-1146-design.md`](./docs/design/0515-1146-design.md) for the full product brief and roadmap.

## Tech stack

| Layer | Choice |
|---|---|
| Shell | [Tauri 2](https://tauri.app/) (Rust) |
| UI | React 19 + TypeScript + Vite 7 |
| Storage | SQLite via `tauri-plugin-sql` |
| Icons | `lucide-react` |
| Targets | macOS (universal), Windows (x64) |

## Getting started

### Prerequisites

- Node 20+ (tested on 24)
- pnpm 9+ (`corepack enable` will do)
- Rust stable (1.77+, install via [rustup](https://rustup.rs/))
- macOS: Xcode Command Line Tools (`xcode-select --install`)
- Windows: Visual Studio Build Tools 2022 (Desktop C++)

### Run

```bash
git clone https://github.com/xtianowner/perch-note.git
cd perch-note
pnpm install
pnpm tauri dev
```

A 360 × 480 always-on-top window will appear. Type into the bottom bar, hit Enter, watch it land in the list above. Open Settings (⚙ top-right) to tweak language, copy format, text size, etc.

### Build

```bash
pnpm tauri build
```

Outputs to `src-tauri/target/release/bundle/` (macOS `.app` / `.dmg`, Windows `.msi`).

## Project layout

```
perch-note/
├── src/                  # React UI (TypeScript)
│   ├── components/       # EntryList, EntryItem, InputBar, CopyButton, ...
│   ├── lib/              # db, i18n, settings, clipboard, time, types
│   └── App.{tsx,css}
├── src-tauri/            # Rust shell + SQLite migrations
├── docs/                 # Design / UI / module / env docs
└── 00TEM/                # Internal workflow (todos, reviews) — kept in repo for transparency
```

## Data location

| OS | Path |
|---|---|
| macOS | `~/Library/Application Support/com.tian.perch/perch.db` |
| Windows | `%APPDATA%\com.tian.perch\perch.db` |

It's a plain SQLite file. Back it up, inspect it with `sqlite3`, copy it between machines — it's yours.

## Roadmap

- [ ] Pre-built signed binaries (macOS `.dmg` + Windows `.msi`)
- [ ] Global hotkey to focus the window
- [ ] System tray + collapse-to-strip mode
- [ ] Custom title bar (drop the system chrome)
- [ ] Search / tag / pin
- [ ] Export (JSON / txt / CSV)
- [ ] Optional sync

## Contributing

Issues and PRs welcome. Please open an issue before large changes so we can align on direction.

## License

[MIT](./LICENSE) © 2026 Tian
