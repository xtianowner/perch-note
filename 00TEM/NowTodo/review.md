<!-- purpose: 阶段复盘 + 调度日志 -->

# Review

**创建时间**: 2026-05-15 11:46:39
**更新时间**: 2026-05-15 13:15:00

## 阶段总结

### 2026-05-15 项目立项
- 用户提出"永远置顶 + 时间戳记录"的桌面工具需求
- 通过 4 个澄清问题确定：项目名 Perch / 数据形态混合 / 技术栈 Tauri+React / 立即建仓
- 用户补充关键需求：**纯文本存储 + 一键复制纯文本**，避免 markdown 语法污染 → 已写入设计文档 §3 §5 §9

### 2026-05-15 Phase 2 美化启动 + i18n + InputBar resize
- 用户显式说"本次开始美化，优化 UI 设计，搞得漂亮一点，简约风格" → 按 CLAUDE.md §8 强制走 frontend-phase2-polisher（commit `5226174`）
- 同轮顺手做：① InputBar textarea 可拖拽 resize（max 60vh） ② 加中英文切换（Settings 里 Language 选项 + 实时切换 UI 字符串）
- polisher 主要决策（详见 `docs/ui.md`）：
  - CSS custom properties design tokens（4/8/12/16 间距 + 11/12/13/14 字号 + 4/6 圆角 + 120/180ms 过渡）
  - 单 accent 策略：浅色 `#2563eb` / 深色 `#3b82f6`，其余 zinc 灰阶
  - Inter + system-ui fallback（不引 Google CDN，离线启动友好）
  - `lucide-react` 替换所有 emoji 字符图标（Settings/X/Copy/Check）— 唯一新增依赖
  - 深色模式用 `#18181b / #232327` 暖深灰，避开纯黑
- i18n 架构：`src/lib/i18n.ts` 用 `useSyncExternalStore` 全局订阅；`t()` 顶层可用（`time.ts` / `clipboard.ts`），`useT()` 让组件订阅；Settings 取消时 lang preview 回滚
- 既有 localStorage 兼容：旧 settings 自动补 `lang: "en"` 默认值
- bundle 变化（远低于 +30% 上限）：JS 201.27→207.30KB (+3.0%) / gzip 63.35→65.68KB (+3.7%) / CSS 4.92→9.63KB

## 调度日志

2026-05-15 13:30  task=phase2-ui-polish  agent=frontend-phase2-polisher  reason=用户显式启动 Phase 2 美化 + 同轮 InputBar resize + i18n  user_correction=none

### 2026-05-15 编辑交互简化（去 edit/save 按钮 + 15s 自动保存）
- 用户反馈"edit / save 太麻烦"，希望"开放式框框，随时改"
- 改为：textarea 永远 open 可改；不再有 view/edit 二态切换、不再有 edit/save/cancel 按钮、不再有 Cmd+Enter / Esc 快捷键
- 自动保存策略（三重）：
  1. **15s debounce**：每次 keystroke 重置定时器，停手 15s 后保存
  2. **blur 立即保存**：焦点离开 textarea 立即 flush
  3. **unmount 兜底**：组件卸载时 flush（关窗 / 列表重排 / 路由切换时都覆盖）
- 写入门控：空内容 / 与原内容相同 → 不发 DB 请求（避免无效写）
- 视觉反馈：保存成功后 header 闪 "✓ saved" 1.5s 后消失
- 实现要点：用 useRef 持有最新 draft/onUpdate/entry.content，使 flush 成为稳定引用（避免 stale closure 和 effect 抖动）
- 删除的 UI 元素：`.entry-editing` 类、`.entry-edit-textarea`、`.entry-edit-hint`、`.entry-edit-keys`、view 模式的 `.entry-content` div
- 设计文档 docs/design/0515-1146-design.md §6 UI 草图里画的 "[edit] 按钮 + 双击编辑" 已过时，待 V1 闭环时整体更新

### 2026-05-15 S4-bis 编辑 + 复制规则 + Settings 面板
- 用户在 S3 落地后反馈三个需求：① 条目不能二次编辑 ② 复制时要带"最后编辑时间戳（规范格式）" ③ 加一段用户自定义文本，可选放在 content 前 / 后 ④ 上述控制放进小 settings，不挤主页
- 编辑路径：双击 content（或 edit 按钮）→ textarea；Cmd/Ctrl+Enter 保存（IME 安全），Esc 取消；编辑后 entry header 显示 "(edited)" + 改用 `updatedAt` 计算相对时间
- DB 加 `updateEntry(id, content)`：UPDATE 内容 + `updated_at = now`，前端 patch local state
- 复制结构：
  - 自定义文本空：`<ts>\n<content>`
  - 自定义文本"前"：`<custom>\n\n<ts>\n<content>`
  - 自定义文本"后"：`<ts>\n<content>\n\n<custom>`
  - 时间戳取 `updatedAt`（用户硬需求），默认 local `YYYY-MM-DD HH:mm:ss`，Settings 可切 ISO 8601
- Settings 持久化：localStorage `perch.settings.v1`（不进 SQLite，避免污染数据 schema）
- Settings UI：右上角小齿轮（28×28，浮动 absolute）→ modal 居中，含 timestamp 格式 / 自定义文本 / 位置 + 实时 clipboard preview
- 新模块：`lib/settings.ts`、`lib/clipboard.ts`（含 `buildClipboardText` / `previewClipboardText`）、`components/Settings.tsx`
- **HMR 友好**：本次纯 TS 改动，用户的 dev 窗口自动刷新无需重启 tauri dev

### 2026-05-15 S3 接入 SQLite 持久化
- 走 `tauri-plugin-sql` v2.4.0（features=sqlite，底层 sqlx），不手写 rusqlite
- 迁移用 plugin 的 `Migration { version: 1 }` API：建 entries 表（id/content/created_at/updated_at/pinned/deleted_at）+ 2 索引
- 前端 `src/lib/db.ts` 封装 `listEntries()` / `insertEntry()`，App.tsx 用 useEffect 启动加载
- **设计偏差**：原 modules.md 列了 `entry-repo (Rust)` 模块；plugin-sql 让 TS 端直接发 SQL（IPC 走到 Rust 端 sqlx 执行），没必要再手写一层 Rust repo → 已在 docs/modules.md 标弃用，复杂事务/全文搜索时再切回手写
- DB 路径：`sqlite:perch.db` → 实际落到 macOS `~/Library/Application Support/com.tian.perch/perch.db`，Windows `%APPDATA%/com.tian.perch/perch.db`
- capabilities 加 sql:default + allow-execute/select/load/close（Tauri 2 严格权限模型）
- **未验证**：用户需杀掉旧 dev 重启（Rust 代码改动不走 HMR）后做端到端持久化测试

### 2026-05-15 S4 UI 骨架前置（Phase 1，in-memory）
- 用户首跑 dev 后发现 demo "Welcome to Tauri+React" 页在小窗里被挤压 → 直接前置 S4 UI 骨架，不留 demo 占位
- 删除：`greet` Rust command + 三个 logo svg + demo App.tsx/css
- 新增组件分层（为 Phase 2 美化预留）：`components/{EntryList,EntryItem,InputBar,CopyButton}.tsx` + `lib/{types,time}.ts`
- 布局：flex 纵向，列表 `flex:1 + overflow-y:auto`，输入栏 `flex:0 0 auto` 固定底部 → 任意窗口尺寸自适应
- 数据：`useState<Entry[]>` 临时内存存储，S3 切 SQLite 时只换 hook，UI 零改动
- 纯文本原则严格执行：`white-space: pre-wrap`，无 react-markdown / remark
- IME 防误触：`!e.nativeEvent.isComposing` 处理中文输入法 composing 状态下 Enter

### 2026-05-15 S1 Tauri scaffold
- 环境安装：corepack 启用 pnpm 11.1.2；rustup 装 stable 1.95.0；Xcode CLT 已就绪
- 脚手架策略：`pnpm create tauri-app` 不允许在非空目录 init，走临时目录 `_perch-scaffold/perch-app` 生成后 merge 回 Perch/，再删临时目录
- 配置定制：productName/title→Perch、identifier=com.tian.perch、size 360×480、alwaysOnTop=true、minSize 280×200
- 验证：`pnpm build`（vite，194KB gzip 61KB）✓；`cargo check`（首次拉全套 Tauri 依赖，编译 35s）✓
- **未验证项**：`pnpm tauri dev` GUI 启动 — 当前 CLI 环境无图形界面，需用户在本机手动跑一次确认浮窗行为
- **Phase 1 偏差记录**：todo.md 原 S2 含 "decorations:false + 自绘 toolbar"，按 CLAUDE.md §8 Phase 1 最简原则，已挪到 Phase 2，先用系统默认窗口装饰

<!-- 旧 ## 调度日志 段已迁至最新阶段段落上方，避免按时间倒序时被卷到底部 -->
<!-- format: yyyy-mm-dd hh:mm  task=<id>  agent=<name>  reason=<...>  user_correction=<none | ...> -->
