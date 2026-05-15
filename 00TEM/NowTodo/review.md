<!-- purpose: 阶段复盘 + 调度日志 -->

# Review

**创建时间**: 2026-05-15 11:46:39
**更新时间**: 2026-05-15 13:00:00

## 阶段总结

### 2026-05-15 项目立项
- 用户提出"永远置顶 + 时间戳记录"的桌面工具需求
- 通过 4 个澄清问题确定：项目名 Perch / 数据形态混合 / 技术栈 Tauri+React / 立即建仓
- 用户补充关键需求：**纯文本存储 + 一键复制纯文本**，避免 markdown 语法污染 → 已写入设计文档 §3 §5 §9

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

## 调度日志

<!-- format: yyyy-mm-dd hh:mm  task=<id>  agent=<name>  reason=<...>  user_correction=<none | ...> -->

（暂无 — 项目初始化阶段未派 subagent）
