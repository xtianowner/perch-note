<!-- purpose: 当前 sprint 用户级操作步骤清单 -->

# TODO

**创建时间**: 2026-05-15 11:46:39
**更新时间**: 2026-05-15 12:05:00

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
- [ ] **需用户手动验证**：`pnpm tauri dev` 启动浮窗（CLI 环境无法测 GUI）

### S2 窗口行为
- [x] `tauri.conf.json` 设 `alwaysOnTop: true`、初始尺寸 360×480
- [ ] Mac 测试：与 Chrome / Claude Code 切换均不丢
- [ ] Win 测试（VM 或实机）
- ~~`decorations: false` + 自绘 toolbar~~ → 挪到 **Phase 2 美化阶段**，Phase 1 保留默认窗口装饰

### S3 数据层
- [ ] 接入 `tauri-plugin-sql`
- [ ] 建表 SQL（见设计文档 §5）
- [ ] Rust 侧 `entry-repo` 模块实现 CRUD

### S4 UI（Phase 1 功能链路，默认样式）
- [ ] `EntryList` + `InputBar` + `CopyButton`
- [ ] 时间戳格式化（相对时间）
- [ ] **纯文本渲染**：列表用 `white-space: pre-wrap` 的 `<div>`，禁止任何 markdown 库

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
