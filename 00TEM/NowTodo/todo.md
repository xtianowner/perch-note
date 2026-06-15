<!-- purpose: 当前 sprint 用户级操作步骤清单 -->

# TODO

**创建时间**: 2026-05-15 11:46:39
**更新时间**: 2026-06-15

## V1 MVP（已经按顺序排好）

### S0 仓库初始化
- [x] 建项目骨架
- [x] 设计文档定稿
- [x] git init + 首次 commit

### S1 Tauri scaffold
- [x] `pnpm create tauri-app` 在临时目录初始化后 merge 进 Perch/（避开 README/docs/00TEM）
- [x] 选择 React + TypeScript + Vite 模板（Tauri 2.x）
- [x] 配置改名 productName/title → "Perch"，identifier com.tian.perch
- [x] `pnpm install` + `pnpm build`（vite）+ `cargo check`（src-tauri）全部通过
- [x] `pnpm tauri dev` 启动浮窗（用户已确认窗口弹出）

### S2 窗口行为
- [x] `tauri.conf.json` 设 `alwaysOnTop: true`、初始尺寸 360×480
- [ ] Mac 测试：与 Chrome / Claude Code 切换均不丢（待用户切窗体验后确认）
- [ ] Win 测试（VM 或实机）
- ~~`decorations: false` + 自绘 toolbar~~ → 挪到 **Phase 2 美化阶段**，Phase 1 保留默认窗口装饰

### S4 UI 骨架（Phase 1，先于 S3，用 in-memory 存储）
- [x] 删 Tauri demo（greet command / 三 logo / "Welcome to Tauri+React"）
- [x] `EntryList` + `EntryItem` + `InputBar` + `CopyButton` 组件分层
- [x] 时间戳格式化（`lib/time.ts`，相对时间 + hover 绝对时间）
- [x] **纯文本渲染**：`white-space: pre-wrap` 的 `<div>`，无 markdown 库
- [x] flex 布局自适应任意窗口尺寸（列表区滚动 + 输入栏固定底部）
- [x] IME 友好（中文输入法 composing 时 Enter 不提交）
- [x] 深色模式 (`prefers-color-scheme: dark`)

### S4-bis 编辑 + 复制规则 + Settings（Phase 1 功能完整化）
- [x] ~~双击 / edit / save / cancel 切换~~ → 改为**开放式 textarea，永远可改**
- [x] 自动保存：每次改动 15s debounce → 落 DB；blur 立即保存；unmount 兜底 flush
- [x] 保存成功后 entry header 闪现 "✓ saved" 1.5s
- [x] 编辑后 entry 显示 "(edited)" 标记，相对时间改用 `updatedAt`
- [x] DB `updateEntry(id, content)`，写入 `updated_at = now`
- [x] 空内容 / 无变化 → 不触发 DB 写入
- [x] 复制规则：时间戳（取 `updatedAt`）永远附带，默认 local 格式 `2026-05-15 12:35:00`
- [x] 自定义文本（localStorage 持久化）+ 位置切换（before/after content）
- [x] Settings 面板：右上角齿轮触发的 modal，含 timestamp 格式 / 自定义文本 / 位置 + 实时 clipboard preview
- [x] 新增模块：`lib/settings.ts`、`lib/clipboard.ts`、`components/Settings.tsx`
- [ ] 待用户手动测：输入即改、停手 15s 自动保存、blur 立即保存、复制带时间戳、Settings 调自定义文本前/后

### S3 数据层（in-memory → SQLite 切换）
- [x] 接入 `tauri-plugin-sql` v2.4.0（features sqlite）+ JS 端 `@tauri-apps/plugin-sql`
- [x] 建表 SQL（entries 表 + 2 索引；走 plugin 的 migrations API，version=1）
- ~~Rust 侧 `entry-repo` 模块实现 CRUD~~ → 弃用，改用 `src/lib/db.ts` 前端直发 SQL（见 docs/modules.md 弃用决策）
- [x] App.tsx 改成 `useEffect` 启动加载 + insert 后追加；loading / error 状态分支
- [x] capabilities 加 sql:default / allow-execute / allow-select / allow-load / allow-close
- [ ] **需用户手动验证**：杀掉旧 `pnpm tauri dev`、重启（Rust 改动 HMR 不生效）；输入条目后关窗、再开，数据应当还在

### S4-ter 标题 / 删除 / 计数（功能扩展）
- [x] DB migration v2：`ALTER TABLE entries ADD COLUMN title TEXT NOT NULL DEFAULT ''`
- [x] `Entry` type 加 `title`，`db.ts` 全链路传递 + 新增 `deleteEntry(id)`（软删，写 `deleted_at`）
- [x] EntryItem 加 title 输入框（单行 input，可选），与 content 共享自动保存（15s/blur/unmount）
- [x] DeleteButton 组件：2 步确认（首次点变红 "Confirm"，4s 内再点真删；不点自动恢复）
- [x] 顶部右上角实时显示条目数 "N entries" / "共 N 条"
- [x] 复制规则更新：当 title 非空，title 紧贴 timestamp 之上（仍纯文本）
- [x] i18n 新增 keys（app.count / entry.delete / entry.titlePlaceholder 等）
- [ ] **需用户重启 dev**：Rust schema 改动 → 杀掉旧 `pnpm tauri dev` 重启，migration v2 自动跑

### S5 打包
- [ ] macOS dmg 签名（暂用 ad-hoc 签名，开源后再申 dev cert）
- [ ] Windows msi

## Phase 2 美化（进行中 — 由 frontend-phase2-polisher 主导）
- [x] 整体视觉打磨：design tokens / 间距 / 字号 / 圆角 / 阴影 / 过渡（详见 `docs/ui.md`）
- [x] 深色模式优化（暖深灰系，非纯黑）
- [x] `lucide-react` 图标替换字符（Settings/X/Copy/Check）
- [x] 滚动条样式（细、半透明）
- [x] hover/focus 微动效（120/180ms）
- [x] InputBar textarea 可垂直 resize（max 60vh）
- [x] i18n 中英文切换（Settings 加 Language）
- [x] **v2 polish**：title input 字号字重微调 + `--danger` token 体系 + 文字 line-height/tracking 优化 + entry-count 收紧 + 全局 focus halo 统一
- [x] **v3 polish**：字号 3 档（Small/Medium/Large）通过 `--text-scale` 等比缩放 + 文字呼吸空间（11 处 padding 加大）
- [ ] `decorations: false` + 自绘顶部 toolbar（拖动 / 折叠 / 关闭）— 待后续
- [ ] 折叠成小条形态 — 待后续
- [ ] 手动 light/dark toggle — 待后续

## 功能扩展（2026-05-26）
### 置顶
- [x] 复用 v1 已存在的 `pinned` 列（零迁移）；`db.setPinned` + `sortEntries` 浮顶
- [x] PinButton（`copy-btn` 图标变体）+ 置顶项 accent 左边条
- [ ] **待用户手动测**：点置顶 → 条目浮到列表顶部；取消置顶 → 回落

### 拖动排序
- [x] migration v3 `add_sort_order_column`（追加列，旧数据零丢失）
- [x] `@dnd-kit` 手柄拖动；置顶区 / 普通区分区独立排序，不跨区
- [x] `db.persistOrder` 按新顺序写回 `sort_order`；`tsc` + `vite build` + `cargo check` 通过
- [ ] **待用户手动测**：`pnpm tauri dev` 拖动手柄调整顺序，关窗重开顺序保持

### 文档整理
- [x] README ×2 / design / ui.md / modules / 00TEM 同步置顶 + 拖动
- [x] 删除历史残留 `docs/audit/`（未跟踪的一次性审查报告）

## 功能扩展（2026-06-15）2.1 修改时间 + 2.2 字体缩放 + 2.3 搜索
### 开工前备份（已确认）
- [x] `.backup` 快照 `perch.db` + JSON 导出 + localStorage → `00TEM/AgentBus/artifacts/0615-1108-perch-backup/`（31 行 / 6 有效，integrity ok，用户确认）

### 2.1 修改时间显示
- [x] header 改 `绝对修改时间 · 相对时间`（绝对沿用 timestampFormat 去秒；iso 压缩为 `…THH:MMZ`）；tooltip 给完整 修改/创建 时间
- [ ] **待用户手测**：卡片头部能看到绝对修改时间；hover 看完整时间

### 2.2 字体连续缩放
- [x] `fontScale` 连续 0.7–1.8 取代 3 档 textSize（旧值自动迁移）；全局 `⌘=/⌘+/⌘-/⌘0` + 设置步进器；inline `--text-scale`
- [ ] **待用户手测**：`⌘+`/`⌘-` 放大缩小、`⌘0` 复位；设置面板步进器；重启后字号保持

### 2.3 模糊搜索
- [x] `⌘F` / 顶栏图标唤起，`Esc` 收起；子序列模糊匹配 title+content；搜索时禁拖拽防污染 sort_order
- [ ] **待用户手测**：`⌘F` 唤起、输入过滤、匹配数、`Esc` 收起；搜索时拖拽手柄消失

### 复查 + 修订（多 agent 对抗审查后）
- [x] Copy/Delete 改纯图标（腾 header 空间；否定 Phase-2 图标+文字，已记 ui.md）
- [x] 顺手修旧 pin bug：编辑中途置顶不再丢屏幕编辑（pin 前 flush 草稿）
- [x] savedFlash 卸载守卫 / iso 时间压缩 / 迁移值钳制
- [ ] **待用户手测**：编辑一条未失焦 → 点置顶 → 文本仍在；Copy/Delete 图标点击正常、Delete 二次确认显"再点确认"

## 注意事项
- 内容字段全程当 raw text 处理，**不要**引入 react-markdown / remark / 任何 HTML sanitizer
- copy 按钮调 `navigator.clipboard.writeText`，不要走 execCommand 老 API
- 手动验证 GUI 的步骤：项目根目录 `pnpm tauri dev`，应出现 360×480 窗口标题 "Perch"，切到其他 app 时不消失
