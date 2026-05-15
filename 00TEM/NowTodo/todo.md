<!-- purpose: 当前 sprint 用户级操作步骤清单 -->

# TODO

**创建时间**: 2026-05-15 11:46:39
**更新时间**: 2026-05-15 11:50:00

## V1 MVP（已经按顺序排好）

### S0 仓库初始化
- [x] 建项目骨架
- [x] 设计文档定稿
- [x] git init + 首次 commit

### S1 Tauri scaffold
- [ ] `pnpm create tauri-app` 在当前目录初始化（注意不要覆盖 README / docs / 00TEM）
- [ ] 选择 React + TypeScript + Vite 模板
- [ ] 验证 `pnpm tauri dev` 能起来一个 hello world

### S2 窗口行为
- [ ] `tauri.conf.json` 设 `alwaysOnTop: true`、初始尺寸 360×480、`decorations: false`（自绘 toolbar）
- [ ] Mac 测试：与 Chrome / Claude Code 切换均不丢
- [ ] Win 测试（VM 或实机）

### S3 数据层
- [ ] 接入 `tauri-plugin-sql`
- [ ] 建表 SQL（见设计文档 §5）
- [ ] Rust 侧 `entry-repo` 模块实现 CRUD

### S4 UI
- [ ] `EntryList` + `InputBar` + `CopyButton`
- [ ] 时间戳格式化（相对时间）
- [ ] **纯文本渲染**：列表用 `white-space: pre-wrap` 的 `<div>`，禁止任何 markdown 库

### S5 打包
- [ ] macOS dmg 签名（暂用 ad-hoc 签名，开源后再申 dev cert）
- [ ] Windows msi

## 注意事项
- 内容字段全程当 raw text 处理，**不要**引入 react-markdown / remark / 任何 HTML sanitizer
- copy 按钮调 `navigator.clipboard.writeText`，不要走 execCommand 老 API
