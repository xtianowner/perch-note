<!-- purpose: 模块清单与契约登记表 -->

# Perch 模块登记

**创建时间**: 2026-05-15 11:46:39
**更新时间**: 2026-05-15 12:35:00

> 拆分模块时在此登记 ①模块名 ②输入/输出契约 ③依赖 ④复用入口。
> 第二个项目复用时升级到 `~/Documents/00-Tian/AI/modules/`。

## 当前模块

| 模块名 | 状态 | 角色 | 输入 | 输出 | 依赖 | 入口 |
|---|---|---|---|---|---|---|
| `db` (TS) | ✓ S3 | SQLite CRUD（前端直发 SQL，plugin-sql 经 IPC 在 Rust 端执行） | `listEntries() / insertEntry(content)` | `Entry[]` / `Entry` | `@tauri-apps/plugin-sql` | `src/lib/db.ts` |
| `EntryList` (React) | ✓ Phase 1 | 列表渲染（V1 不做虚拟滚动） | `entries: Entry[]` | UI | react | `src/components/EntryList.tsx` |
| `EntryItem` (React) | ✓ Phase 1 | 单条渲染 + 时间戳 + copy | `entry: Entry` | UI | react | `src/components/EntryItem.tsx` |
| `InputBar` (React) | ✓ Phase 1 | 输入框 + Enter 提交 + IME 友好 | `onSubmit(text: string)` | 提交事件 | react | `src/components/InputBar.tsx` |
| `CopyButton` (React) | ✓ Phase 1 | 一键复制纯文本 + 视觉反馈 | `text: string` | clipboard 写入 | navigator.clipboard | `src/components/CopyButton.tsx` |
| `time` (TS) | ✓ Phase 1 | 相对/绝对时间格式化（无外部依赖） | `timestamp: number` | string | — | `src/lib/time.ts` |
| `types` (TS) | ✓ | `Entry` 类型 | — | — | — | `src/lib/types.ts` |
| `window-manager` (Rust) | 待 Phase 2 | 控制窗口折叠/透明度等 | Tauri command | window state | tauri 2.x | `src-tauri/src/window.rs` |

## 弃用决策

- ~~`entry-repo` (Rust)~~ — 原计划 Rust 侧封装 CRUD。**改为 `db` (TS) + tauri-plugin-sql**：plugin 已封装 IPC 与 sqlx，前端直发 SQL 更短链路；如未来需复杂事务/全文搜索再切回手写 Rust command。

## 复用候选

- `CopyButton` — 任何记录类工具通用，V2 可考虑升级到全局 modules。
- `time` — 跨项目高频需求，升级候选。
