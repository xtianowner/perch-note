<!-- purpose: 项目入口 README, 用于 GitHub 公开主页和本地导航 -->

# Perch

> Always-on-top notepad with timestamps. Perch on your screen, jot anything, never lose a thought.

**创建时间**: 2026-05-15 11:46:39
**更新时间**: 2026-05-15 11:46:39

---

## What is Perch?

Perch 是一个跨平台（macOS / Windows）的桌面浮窗记录工具：

- **永远置顶**：不被其他窗口遮挡，焦点切换不隐藏
- **时间戳记录**：每条记录自动带创建时刻
- **混合数据形态**：默认追加时间流（timeline），允许回头编辑任意条目
- **本地优先**：数据存本地 SQLite，零云依赖
- **轻量常驻**：基于 Tauri，包体积 < 10MB，内存占用低

## Status

> 早期设计阶段 — 暂未发布二进制。

详见 [docs/design/](./docs/design/) 中的设计文档与路线图。

## Tech Stack

- **Shell**: [Tauri 2.x](https://tauri.app/) (Rust)
- **UI**: React 18 + TypeScript + Vite
- **Storage**: SQLite (via `tauri-plugin-sql`)
- **Build targets**: macOS (universal), Windows (x64)

## License

MIT (planned)
