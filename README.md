<!-- purpose: GitHub 公开主页 + 本地仓库导航（中文主版） -->

> English → [README.en.md](./README.en.md)

# Perch

> 永远置顶的桌面浮窗记事本。停在屏幕上，随手记录，**纯文本进、纯文本出**。

![Perch 桌面浮窗记事本界面：浅色窗口展示带时间戳的置顶笔记、搜索、设置与快速记录输入框](./docs/assets/perch-overview.png)

一个跨平台的小工具：常驻屏幕最顶层，写一句话自动带时间戳，复制出去**不带任何 markdown 字符污染** —— 粘贴到 Slack、代码注释、邮件里都干净如初。

> 截图使用演示内容，不包含真实笔记数据。

## 功能

- **永远置顶**：切到 Chrome / Claude Code / 终端，浮窗都不消失
- **修改时间显示**：每条记录头部并排显示**绝对修改时间 + 相对时间**（如 `2026-06-15 10:49 · 5 分钟前`）；hover 看完整 修改 / 创建 时间
- **模糊搜索 + 命中高亮**：`⌘F` 或顶栏 🔍 唤起，输入即过滤（标题 + 内容、大小写不敏感、空格分词 AND）；命中词在笔记**内部高亮并自动滚动定位**，`Esc` 收起
- **字体连续缩放**：`⌘ +` 放大 / `⌘ −` 缩小 / `⌘ 0` 复位（70%–180% 连续档，记忆到本地）—— 解决 macOS 下 Tauri 窗口无法用 `⌘+` 缩放的问题
- **开放式编辑**：每条 entry 都是一个 live textarea，输入即改，**停手 15 秒自动保存**（焦点离开、关窗时也兜底保存）
- **每条独立标题**（可选）
- **置顶**：重要记录一键置顶，始终浮在列表顶部
- **拖动排序**：抓住左上角手柄拖动调整顺序；置顶区与普通区各自独立排序，互不串位
- **软删除**：两步确认（红色 "再点确认" 4 秒倒计时，反悔无门槛）
- **一键复制纯文本**：title + 时间戳 + 内容，全程不渲染 markdown，**你打的什么就粘出什么**；点击复制时读取屏幕上的 live draft —— 还没自动保存的改动也能直接粘出去
- **自定义剪贴板前缀 / 后缀**：附加签名、标签、引用前缀，自选放在内容前还是后
- **本地优先**：数据进本地 SQLite（应用数据目录），无账号 / 无同步 / 无遥测
- **中英双语**：Settings 内一键切换
- **浅色 / 深色双主题**：跟随系统偏好

## 快捷键

| 快捷键 | 作用 |
|---|---|
| `⌘ F` | 唤起 / 聚焦搜索框 |
| `Esc` | 收起搜索 |
| `⌘ +` / `⌘ −` | 放大 / 缩小字体 |
| `⌘ 0` | 字体复位到 100% |
| `Enter` | 提交底部输入框新建一条（`Shift+Enter` 换行） |

> Windows / Linux 上把 `⌘` 换成 `Ctrl`。

## 状态

V1 MVP — 在 macOS / Windows 上可从源码运行。**暂未发布预编译二进制**。

**功能说明**见 [`docs/features.md`](./docs/features.md)。
完整产品设计 & 路线图见 [`docs/design/0515-1146-design.md`](./docs/design/0515-1146-design.md)。
UI 设计决策见 [`docs/ui.md`](./docs/ui.md)。

## 技术栈

| 层 | 选型 |
|---|---|
| 桌面容器 | [Tauri 2](https://tauri.app/)（Rust） |
| UI | React 19 + TypeScript + Vite 7 |
| 存储 | SQLite，经 `tauri-plugin-sql` |
| 图标 | `lucide-react` |
| 拖拽 | `@dnd-kit`（手柄拖动排序，键盘可达） |
| 目标平台 | macOS（universal）、Windows（x64） |

## 快速开始

### 前置依赖

- Node 20+（24 上测过）
- pnpm 9+（执行 `corepack enable` 即可启用）
- Rust stable 1.77+（用 [rustup](https://rustup.rs/) 装）
- macOS：Xcode Command Line Tools（`xcode-select --install`）
- Windows：Visual Studio Build Tools 2022（Desktop C++）

### 运行

```bash
git clone https://github.com/xtianowner/perch-note.git
cd perch-note
pnpm install
pnpm tauri dev
```

弹出一个 360 × 480 的永远置顶小窗。在底部输入框打字、回车提交，列表立刻多一条。点右上角 ⚙ 打开 Settings 调整语言 / 复制规则 / 字号等。

macOS 下日常使用推荐一键脚本——启动的是**已安装**的常驻实例，进程挂在 launchd 下，与终端解耦（关掉终端不退出）：

```bash
./start.sh --build   # 首次：构建 + 安装到 /Applications + 启动
./start.sh           # 之后：一键启动 / 唤起，并核验已与终端解耦
```

### 打包

```bash
pnpm tauri build
```

产物输出到 `src-tauri/target/release/bundle/`（macOS `.app` / `.dmg`，Windows `.msi`）。

## 目录结构

```
perch-note/
├── src/                  # React UI（TypeScript）
│   ├── components/       # EntryList、EntryItem、InputBar、CopyButton、Settings、DeleteButton、PinButton
│   ├── lib/              # db、i18n、settings、clipboard、time、types
│   └── App.{tsx,css}
├── src-tauri/            # Rust 容器 + SQLite migrations
├── docs/                 # 设计 / UI / 模块 / 环境文档
└── 00TEM/                # 开发流程内部资料（todo / review），保留在 repo 内便于追溯
```

## 数据位置

| 操作系统 | 数据库路径 |
|---|---|
| macOS | `~/Library/Application Support/com.tian.perch/perch.db` |
| Windows | `%APPDATA%\com.tian.perch\perch.db` |

就是个标准 SQLite 文件。可以备份、`sqlite3` 命令行直接打开看、设备间复制 —— 你的数据是你的。

## 路线图

- [ ] 预编译已签名的二进制（macOS `.dmg` + Windows `.msi`）
- [x] 模糊搜索 + 命中高亮定位
- [x] 字体连续缩放
- [ ] 全局快捷键唤起 / 隐藏窗口
- [ ] 系统托盘 + 折叠成小条
- [ ] 自绘 toolbar（去掉系统标题栏）
- [ ] 标签 / 分类
- [ ] 导出（JSON / txt / CSV）
- [ ] 可选云同步

## 贡献

欢迎 issue 和 PR。大改动请先开 issue 对齐方向再动手，免得双方做白工。

## License

[MIT](./LICENSE) © 2026 Tian
