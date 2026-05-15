<!-- purpose: 当前 sprint 用户级操作步骤清单 -->

# TODO

**创建时间**: 2026-05-15 11:46:39
**更新时间**: 2026-05-15 13:30:00

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
- [ ] `decorations: false` + 自绘顶部 toolbar（拖动 / 折叠 / 关闭）— 待后续
- [ ] 折叠成小条形态 — 待后续
- [ ] 手动 light/dark toggle — 待后续

## 注意事项
- 内容字段全程当 raw text 处理，**不要**引入 react-markdown / remark / 任何 HTML sanitizer
- copy 按钮调 `navigator.clipboard.writeText`，不要走 execCommand 老 API
- 手动验证 GUI 的步骤：项目根目录 `pnpm tauri dev`，应出现 360×480 窗口标题 "Perch"，切到其他 app 时不消失
