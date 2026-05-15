<!-- purpose: 模块清单与契约登记表 -->

# Perch 模块登记

**创建时间**: 2026-05-15 11:46:39
**更新时间**: 2026-05-15 11:50:00

> 拆分模块时在此登记 ①模块名 ②输入/输出契约 ③依赖 ④复用入口。
> 第二个项目复用时升级到 `~/Documents/00-Tian/AI/modules/`。

## 当前模块（V1 待实现）

| 模块名 | 角色 | 输入 | 输出 | 依赖 | 入口 |
|---|---|---|---|---|---|
| `window-manager` (Rust) | 控制窗口置顶/折叠/透明度 | Tauri command 调用 | window state 变更 | tauri 2.x | `src-tauri/src/window.rs` |
| `entry-repo` (Rust) | SQLite CRUD 封装 | `{create, list, update, delete, pin}` | `Entry` rows | tauri-plugin-sql | `src-tauri/src/repo.rs` |
| `EntryList` (React) | 列表渲染 + 虚拟滚动 | `entries: Entry[]` | UI | react | `src/components/EntryList.tsx` |
| `InputBar` (React) | 输入框 + 提交 | `onSubmit(text: string)` | 提交事件 | react | `src/components/InputBar.tsx` |
| `CopyButton` (React) | 一键复制纯文本 | `text: string` | clipboard 写入 + 视觉反馈 | navigator.clipboard | `src/components/CopyButton.tsx` |
| `time-format` (TS) | 相对/绝对时间格式化 | `timestamp: number` | string | dayjs | `src/lib/time.ts` |

## 复用候选

- `CopyButton` —— 任何记录类工具通用，V2 可考虑升级到全局 modules。
- `time-format` —— 跨项目高频需求，升级候选。
