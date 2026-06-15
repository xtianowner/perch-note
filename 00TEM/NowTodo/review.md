<!-- purpose: 阶段复盘 + 调度日志 -->

# Review

**创建时间**: 2026-05-15 11:46:39
**更新时间**: 2026-06-15

## 阶段总结

### 2026-06-15 修改时间显示 + 字体连续缩放 + 模糊搜索
- 用户需求 2.1/2.2/2.3：① header 显示绝对修改时间而非仅"15h前" ② mac 无法 `⌘+` 缩放 → 要连续字体缩放 ③ 模糊搜索
- **开工前先备份**：用户要求确认数据无误再开发 → `.backup` 快照 `perch.db`（31 行 / 6 有效）+ JSON 导出 + localStorage，落 `00TEM/AgentBus/artifacts/0615-1108-perch-backup/`，integrity_check=ok、行数对齐后用户确认
- 用 AskUserQuestion 定 3 个设计岔口：绝对·相对并排 / `⌘+/−/0` 连续缩放(0.7–1.8) / `⌘F` 唤起搜索
- **实现**（Phase 1 功能链路，复用 design tokens，**未碰数据层/迁移/复制规则**）：`time.formatAbsoluteShort` + `search.ts` 子序列模糊匹配 + `settings.fontScale`（旧 textSize 自动迁移）+ 全局键盘 + SearchBar；搜索时禁拖拽防污染 sort_order
- **多 agent 对抗审查**（Workflow，6 维度 × 对抗验证，38 agents / 32 发现 → 确证 12）：修 savedFlash 卸载守卫、formatAbsoluteShort(iso) 压缩、迁移钳制；验证数据零风险 + 搜索不破坏乐观更新
- **依用户决策**：Copy/Delete 改纯图标（否定 Phase-2"图标+文字"，腾 header 空间）；**顺手修旧 pin 功能 bug**（编辑中途置顶丢屏幕编辑 → pin 前先 flush 草稿）
- 验证：`tsc` + `vite build` 全通过（JS 265KB gzip 84KB，零新依赖）；GUI 手感需用户 `pnpm tauri dev` 实测
- 文档：modules / ui.md 同步

### 2026-05-26 置顶 + 拖动排序 + 文档整理
- 用户需求：① 置顶重要记录 ② 拖动调整顺序 ③ 文档整理到最新 + 删历史残留
- **置顶**：发现 `pinned` 列自 v1 迁移（commit f17c9ff）即存在 → **零迁移、零数据丢失**，纯前端接通；PinButton 复用 `copy-btn` 模式，置顶项 accent 左边条
- **拖动排序**：用 AskUserQuestion 与用户确认"分区拖动"（置顶区/普通区各自独立，不跨区）；新增 migration **v3 `add_sort_order_column`**（追加列 DEFAULT 0，旧数据回落 `created_at DESC`）；用 `@dnd-kit`（手柄绑定 + 键盘可达，避开原生 DnD 的脆弱 hack）—— 本项目首个运行时 UI 依赖
- **踩坑**：项目是 pnpm workspace，`npm install` 在 arborist 阶段崩 → 改用 `pnpm add`（已记入项目记忆）
- 验证：`tsc` + `vite build` + `cargo check` 全通过；GUI 拖拽手感需用户 `pnpm tauri dev` 实测
- **文档整理**：README ×2 / design / ui.md / modules / todo / tasks 同步；删除 `docs/audit/`（4 篇未跟踪的一次性审查报告，bug 修复已沉淀进代码 + git 历史）
- 本轮无 Agent tool 委托（主 agent 直接做），故无新增调度日志

### 2026-05-15 项目立项
- 用户提出"永远置顶 + 时间戳记录"的桌面工具需求
- 通过 4 个澄清问题确定：项目名 Perch / 数据形态混合 / 技术栈 Tauri+React / 立即建仓
- 用户补充关键需求：**纯文本存储 + 一键复制纯文本**，避免 markdown 语法污染 → 已写入设计文档 §3 §5 §9

### 2026-05-15 Phase 2 polish v3（字号档位 + 文字呼吸空间）
- 用户两个需求：① 加"调整文本大小"功能 ② 文字与边框距离再调 → 第三次派 polisher（commit `3803b5a`）
- 字号方案：**3 档 select**（Small/Medium/Large，scale 0.92/1.0/1.12），CSS 变量 `--text-scale` 乘到 `--fs-11/12/13/14` 实现等比缩放
  - 注入方式：`<div class="app" data-text-size={value}>` 根属性 + `[data-text-size="..."]` CSS 选择器
  - 微 label（entry-count / settings-label / fs-10）刻意不缩放，保 hierarchy
  - 默认 medium = 当前体验；Settings 中实时预览 + cancel 回滚（同 v2 lang 行为）
- padding 调整 11 处（呼吸空间）：
  - entry-textarea / entry-title 4/8 → 6/10
  - input-textarea 8/12 → 10/12
  - entry-item 顶 padding 8 → 10
  - copy-btn 3/8 → 4/10
  - icon-btn 24 → 26
  - settings 表单控件 6/8 → 7/10
  - settings primary button 6/12 → 7/14
  - entry-list 16/8 → 18/12
- bundle 变化：CSS 11.59→11.72KB (+0.13KB) / JS 209.43→210.45KB (+1.02KB，新 textSize 字段 + select + 4 i18n key)
- HMR 友好；既有 localStorage `perch.settings.v1` 自动补 `textSize: 'medium'`，旧用户兼容

### 2026-05-15 Phase 2 polish v2（文字间距 + 风格 + 新元素融合）
- 用户在功能扩展后要"优化文字间距、风格设计" → 第二次派 polisher（commit `aeb4009`）
- 核心调整（详见 `docs/ui.md` v2 polish 段）：
  - title input 从 `fs-14/600` 降到 `fs-13/600`，用字重而非字号区分层级，小窗里不再压过 textarea
  - 新增 `--danger / --danger-hover / --danger-soft / --danger-soft-strong` 4 个 token，DeleteButton 4 处 hardcoded `#dc2626`/`#f87171` 全归 token
  - body line-height 1.5 → 1.55；body 加 `text-rendering: optimizeLegibility`
  - entry-time 加 `tabular-nums` 稳右栏；entry-count 收紧到 `fs-10 / tracking 0.08em / opacity 0.85`，从"标签"降到"角落徽标"
  - entry-item 下 padding +4px、header `min-h 18→20`、title↔textarea margin +2px，整体密度更舒展
  - 全局 focus halo 统一 3px；saved-mark 改用 `translateY` GPU 友好
  - DeleteButton confirming 加 `font-weight: 600` 作色之外的第二视觉信号
- bundle 变化：JS **0 变化**（纯 CSS polish）/ CSS 10.93→11.59KB (+0.66KB)
- HMR 友好，dev 窗口自动刷新
- v3 若做"清空全部"等危险主按钮可直接 `background: var(--danger)`

### 2026-05-15 标题 / 删除 / 计数（功能扩展）
- 用户新需求：① 删除某一记录 ② 给每条记录加标题 ③ 统计当前有多少条
- 这是功能改动（含 schema migration），不是 polish — 主 agent 自己做（避免再 spawn agent 的 brief 开销），但严守 polisher 留下的 design tokens / i18n 体系
- DB migration v2：`ALTER TABLE entries ADD COLUMN title TEXT NOT NULL DEFAULT ''`（旧数据自动补空串）
- 软删 (`UPDATE deleted_at = now`)，list query 已过滤 IS NULL，旧 schema 字段直接可用
- DeleteButton 2 步 inline 确认（首次点变红 "Confirm"，4s 窗口；过期自动复位）— 比原生 confirm() dialog 视觉好
- title 是单行 `<input>` 在 textarea 上方，与 content 一起走自动保存（合并到一个 flush）
- 复制规则微调：title 非空时紧贴 ts 之上，外层 custom prefix/suffix 不变 — 用户可在 list 里直接试复制看效果（preview 仍保留空 title 简洁）
- 顶部 entry-count 用 absolute 定位在 settings-trigger 左侧，`uppercase` + `tabular-nums` 跟随 polisher 11px 微 label 风格
- bundle 变化：JS 207.30→209.43KB (+1.0%) / gzip 65.68→66.30KB (+0.9%) / CSS 9.63→10.93KB

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
2026-05-15 14:15  task=phase2-polish-v2  agent=frontend-phase2-polisher  reason=主 agent 加完 title/delete/count 后用户要"优化文字间距 + 风格"，把新元素融入设计体系 + 整体微调  user_correction=none
2026-05-15 14:40  task=phase2-polish-v3  agent=frontend-phase2-polisher  reason=新增"调整文本大小"功能 + 用户反馈"文字贴边距离需再调"  user_correction=none
2026-05-22 10:18  task=audit-code        agent=general-purpose             reason=用户要求审 bug + 代码问题；落 docs/audit/0522-1018-code-audit.md  user_correction=none
2026-05-22 10:18  task=audit-docs        agent=general-purpose             reason=用户强调文档 vs 代码一致性、避免虚构；落 docs/audit/0522-1018-docs-audit.md  user_correction=none
2026-05-22 10:25  task=fix-bugs-major    agent=general-purpose             reason=用户授权直接修 4 个 major bug（M1-M4），同时严令不动 SQLite 数据库文件、不动 migrations  user_correction=none
2026-05-22 10:30  task=audit-docs-pass2  agent=general-purpose             reason=用户要求二次核查文档准确性（确保上轮 6 份文档修复 + 3 份代码修复后文档与代码完全一致）  user_correction=none
2026-06-15 11:15  task=review-2.1-2.3    agent=Workflow(perch-feature-review)  reason=ultracode 下对 2.1/2.2/2.3 改动跑 6 维度对抗审查 + 验证（38 子 agent，确证 12/32）  user_correction=none

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
