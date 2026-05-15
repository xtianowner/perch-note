<!-- purpose: 当前 sprint 用户级操作步骤清单 -->

# TODO

**创建时间**: 2026-05-15 11:46:39
**更新时间**: 2026-05-15 12:25:00

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
- [ ] 待用户手动测：输入条目、复制按钮、相对时间显示

### S3 数据层（in-memory → SQLite 切换）
- [ ] 接入 `tauri-plugin-sql`
- [ ] 建表 SQL（见设计文档 §5）
- [ ] Rust 侧 `entry-repo` 模块实现 CRUD
- [ ] 把 App.tsx 里的 `useState<Entry[]>` 换成 SQLite-backed hook，UI 一行不动

### S5 打包
- [ ] macOS dmg 签名（暂用 ad-hoc 签名，开源后再申 dev cert）
- [ ] Windows msi

## Phase 2 美化阶段（待 Phase 1 全闭环后启动）
- [ ] `decorations: false` + 自绘顶部 toolbar（拖动 / 折叠 / 关闭）
- [ ] 折叠成小条形态
- [ ] 主题（深色 / 浅色 / 半透明）
- [ ] 视觉打磨（间距 / 字号 / 颜色）

## 注意事项
- 内容字段全程当 raw text 处理，**不要**引入 react-markdown / remark / 任何 HTML sanitizer
- copy 按钮调 `navigator.clipboard.writeText`，不要走 execCommand 老 API
- 手动验证 GUI 的步骤：项目根目录 `pnpm tauri dev`，应出现 360×480 窗口标题 "Perch"，切到其他 app 时不消失
