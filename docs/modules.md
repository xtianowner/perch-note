<!-- purpose: 模块清单与契约登记表 -->

# Perch 模块登记

**创建时间**: 2026-05-15 11:46:39
**更新时间**: 2026-06-15 (修改时间显示 + 字体连续缩放 + 模糊搜索)

> 拆分模块时在此登记 ①模块名 ②输入/输出契约 ③依赖 ④复用入口。
> 第二个项目复用时升级到 `~/Documents/00-Tian/AI/modules/`。

## 当前模块

### 数据层 / 工具库

| 模块名 | 状态 | 角色 | 输入 / API | 输出 | 依赖 | 入口 |
|---|---|---|---|---|---|---|
| `db` (TS) | ✓ V1 | SQLite CRUD（前端直发 SQL，plugin-sql 经 IPC 在 Rust 端 sqlx 执行）。**`pinned` 列在 v1 迁移即存在（commit f17c9ff）；`sort_order` 由 v3 追加（ADD COLUMN DEFAULT 0，已有数据零丢失）**。排序键 `pinned DESC, sort_order ASC, created_at DESC` 同时落在 `listEntries` 的 ORDER BY 与 `sortEntries` 里，供 App 乐观更新复用；`persistOrder` 把一个 pin-组的新顺序按 index 写回 sort_order（两组各自从 0 编号，靠 pinned 主键隔离） | `listEntries()` / `insertEntry(content)` / `updateEntry(id, content, title)` / `setPinned(id, pinned)` / `persistOrder(orderedIds)` / `deleteEntry(id)` / `sortEntries(entries)` | `Entry[]` / `Entry` / `{updatedAt}` / `void` / `void` / `void`（软删） / `Entry[]` | `@tauri-apps/plugin-sql` | `src/lib/db.ts` |
| `time` (TS) | ✓ V1 | 相对/绝对时间格式化（无外部依赖；相对时间走 i18n）。`formatAbsoluteShort(ts, fmt)` 给 header 用紧凑绝对时间（local→`YYYY-MM-DD HH:MM` 去秒；iso→完整 ISO） | `formatRelative(ts)` / `formatAbsolute(ts)` / `formatAbsoluteShort(ts, fmt)` | string | `lib/i18n`, `lib/settings` (type) | `src/lib/time.ts` |
| `clipboard` (TS) | ✓ V1 | 复制文本拼装 + 预览 | `buildClipboardText(entry, settings)` / `previewClipboardText(settings)` / `formatTimestamp(ts, fmt)` | string | `lib/i18n`, `lib/settings`, `lib/types` | `src/lib/clipboard.ts` |
| `search` (TS) | ✓ V1 (2026-06-15) | 搜索匹配：`fuzzyMatch` 按空格拆 token，每 token 须为目标文本的**子串（大小写不敏感 contains）**，多 token AND；空查询匹配全部。`entryMatches` 对 `title\ncontent` 匹配。纯函数无副作用。**注**：曾用"有序子序列"被否定（短词如 todo/sub 在中英混排里几乎全中，失去过滤意义），改回子串包含 | `fuzzyMatch(query, text)` / `entryMatches(query, entry)` | boolean | `lib/types` | `src/lib/search.ts` |
| `highlight` (TSX) | ✓ V1 (2026-06-15) | 搜索命中卡内高亮：`highlightNodes(text, query, firstMarkRef?)` 把文本按命中区间（多 token、合并重叠、大小写不敏感、保留原文大小写）切成 string / `<mark className="search-mark">` 段，**直接渲染为只读视图的可见文字**（非 overlay）；首个 `<mark>` 接 `firstMarkRef` 供滚动定位。无命中返回原文 | `highlightNodes(text, query, firstMarkRef?)` | `ReactNode` | `react` (类型) | `src/lib/highlight.tsx` |
| `settings` (TS) | ✓ V1 | 用户偏好持久化（`localStorage`，key `perch.settings.v1`）；`loadSettings` 对所有枚举字段做白名单校验，非法值 fallback 到 DEFAULTS；**`fontScale`（连续 0.7–1.8）取代旧 3 档 `textSize`，旧值经 `LEGACY_TEXT_SIZE_SCALE` 自动迁移（small/medium/large→0.92/1/1.12），无需用户操作**。`clampFontScale` 钳制 + 2 位小数防浮点漂移 | `loadSettings()` / `saveSettings(s)` / `clampFontScale(v)` + `FONT_SCALE_MIN/MAX/STEP/DEFAULT` 常量 + `Settings` / `TimestampFormat` / `CopyPosition` 类型 | `Settings` 对象（含 `fontScale: number`） | `lib/i18n` (Lang) | `src/lib/settings.ts` |
| `i18n` (TS) | ✓ V1 | 中英字典 + 响应式语言切换 | `t(key, params?)` / `useT()` / `setLang(lang)` / `getLang()` + `Lang` 类型 | translated string / current Lang | `react` (`useSyncExternalStore`) | `src/lib/i18n.ts` |
| `types` (TS) | ✓ V1 | `Entry` 类型（id/title/content/createdAt/updatedAt/pinned/sortOrder） | — | — | — | `src/lib/types.ts` |

### UI 组件

| 模块名 | 状态 | 角色 | 输入 (props) | 输出 | 依赖 | 入口 |
|---|---|---|---|---|---|---|
| `EntryList` (React) | ✓ V1 | 列表渲染；按 `pinned` 拆成「置顶 / 其他」两个 `SortableSection`（各自独立 `DndContext`，**跨区拖动天然不可能**）；有置顶项时显示分区标签；空态按 `searchActive` 显示 `search.noResults` 或 `list.empty`。**`searchActive` 时把 `dndDisabled` 透传到子项禁用拖拽**（过滤子集上拖动会写错邻居的 sort_order）。拖放后调 `onReorder(该区新 id 顺序)` | `entries: Entry[]`, `settings`, `searchActive?`, `onUpdate`, `onDelete`, `onPin`, `onReorder(orderedIds)` | UI | `react`, `EntryItem`, `useT`, `@dnd-kit/core`, `@dnd-kit/sortable` | `src/components/EntryList.tsx` |
| `EntryItem` (React) | ✓ V1 | 单条 live textarea + title input + header（拖动手柄 + **`绝对修改时间 · 相对时间`** / saved-mark / edited 标记；tooltip 给完整 修改/创建 时间） + Pin/Delete/Copy actions；`useSortable({disabled: dndDisabled})` 接 dnd-kit，**drag listeners 只绑在手柄上**，`dndDisabled` 时隐藏手柄；置顶项根节点带 `is-pinned`；内部管理 15 s 自动保存 / blur / unmount flush；flush 三道护栏 — `inflightRef` 串行化并发写、`persistedContentRef/persistedTitleRef` 作"上次成功写入"基准、`deletedRef` 短路已删 entry 的 unmount cleanup `highlightQuery` 非空时内容区切成**只读高亮视图 `.entry-content-view`**（`<mark>` 画在真实文字上 + 自动滚动到首个命中），点击 → `editing` 切回 textarea focus，blur 回视图 | `entry: Entry`, `settings`, `dndDisabled?`, `highlightQuery?`, `onUpdate(id, content, title)`, `onDelete(id)`, `onPin(id, pinned)` | UI；通过 `onUpdate`/`onPin` 回写 | `CopyButton`, `DeleteButton`, `PinButton`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `lib/time`, `lib/clipboard`, `useT` | `src/components/EntryItem.tsx` |
| `PinButton` (React) | ✓ V1 | 置顶切换按钮（图标-only，`copy-btn pin-btn` 变体；`is-pinned` 时填充图标 + accent 色）；纯受控，状态由父级 `entry.pinned` 决定 | `pinned: boolean`, `onToggle: () => void` | toggle 事件 | `lucide-react` (`Pin`), `useT` | `src/components/PinButton.tsx` |
| `InputBar` (React) | ✓ V1 | 底部输入框，`Enter` 提交、`Shift+Enter` 换行、IME composing 期间不提交、`autoFocus` | `onSubmit(text: string)` | 提交事件 | `useT` | `src/components/InputBar.tsx` |
| `SearchBar` (React) | ✓ V1 (2026-06-15) | 顶栏搜索输入框（`⌘F` / 搜索图标唤起，挂载即 autofocus）；`Esc` 关闭；显示匹配条数。受控，过滤逻辑在 App | `value`, `onChange(v)`, `count`, `onClose()` | UI / 查询事件 | `lucide-react` (`Search`/`X`), `useT` | `src/components/SearchBar.tsx` |
| `CopyButton` (React) | ✓ V1 (commit ced2dbd) | 通用复制按钮 + 视觉反馈（✓ 1.2 s）。**采用闭包 `buildText` 而非静态 text**，点击瞬间重新计算 → 复制 live draft | `buildText: () => string` | clipboard 写入 | `lucide-react`, `useT`, `navigator.clipboard` | `src/components/CopyButton.tsx` |
| `DeleteButton` (React) | ✓ V1 | 软删除二步确认按钮（首次点变红 "Confirm"，4 s 倒计时；超时自动还原；卸载清理 timer） | `onConfirm: () => void` | confirm 事件 | `lucide-react`, `useT` | `src/components/DeleteButton.tsx` |
| `SettingsPanel` (React) | ✓ V1 | Settings modal — 语言 / **字体步进器（− % + 复位）** / 时间戳格式 / 自定义文本 / 位置 + 实时 clipboard preview；语言在 Save 前 live preview、Cancel 回滚；**字体缩放即时生效（`onFontScale` 直写 + 持久化，不走 draft/save），`save()` 用 live `fontScale` 而非 draft 快照避免被旧值覆盖** | `settings`, `fontScale`, `onSave(next)`, `onFontScale(v)`, `onClose()` | UI；通过 `onSave`/`onFontScale` 回写 | `lucide-react`, `previewClipboardText`, `useT`, `setLang`, `lib/settings` (clamp/常量) | `src/components/Settings.tsx` |

### Rust 端

| 模块名 | 状态 | 角色 | 输入 / API | 输出 | 依赖 | 入口 |
|---|---|---|---|---|---|---|
| `lib` (Rust) | ✓ V1 | 应用入口；注册 `tauri-plugin-opener` + `tauri-plugin-sql`；声明 migrations v1 (`create_entries_table` + 索引，含 `pinned`) / v2 (`add_title_column`) / v3 (`add_sort_order_column`)。**v1/v2/v3 SQL 字符串一经发布永不改字节**（sqlx 校验和） | `pub fn run()` | Tauri app | `tauri`, `tauri-plugin-opener`, `tauri-plugin-sql` | `src-tauri/src/lib.rs` |
| `main` (Rust) | ✓ V1 | bin 入口，调用 `perch_app_lib::run()` | — | — | `perch_app_lib` | `src-tauri/src/main.rs` |
| `window-manager` (Rust) | 待 V2 | 控制窗口折叠 / 透明度 / 自绘 toolbar | Tauri command（待定） | window state | `tauri@2` | `src-tauri/src/window.rs`（未创建） |

## 弃用 / 待清理

- ~~`entry-repo` (Rust)~~ — 原计划 Rust 侧封装 CRUD。**改为 `db` (TS) + tauri-plugin-sql**：plugin 已封装 IPC 与 sqlx，前端直发 SQL 更短链路；如未来需复杂事务/全文搜索再切回手写 Rust command。
- `tauri-plugin-opener`（"挂载未使用"）— `Cargo.toml` + `package.json` + `lib.rs` 都已注册，但前端零调用、capabilities 仍保留 `opener:default`。**若 V2 无外链打开需求，整套移除**（含 capability + 依赖 + plugin init）。

## 复用候选

- `CopyButton`（live-draft `buildText` 闭包模式）— 任何记录类工具通用，V2 可升级到全局 modules。
- `DeleteButton`（两步确认 + 倒计时还原）— 通用"危险动作"按钮模式。
- `time` — 跨项目高频需求，升级候选（但当前与 `lib/i18n` 耦合，复用前需解耦或带 i18n 一起升）。
- `i18n`（`t` / `useT` / `setLang` + `useSyncExternalStore` 订阅模型）— 轻量 i18n 方案，无 runtime 依赖（除 react），可独立提升为通用模块。
