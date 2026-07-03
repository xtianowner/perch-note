<!-- purpose: Perch 项目级 Claude 协作规则（L2，叠加全局，只写本项目 delta） -->

# Perch · 项目级规则

**创建时间**: 2026-06-29 14:09:56
**更新时间**: 2026-07-03 11:32:31
**时区**: Asia/Shanghai

> 叠加 `~/.claude/CLAUDE.md` 全局规则，这里只写 Perch 专属的 delta。

## 启动方式（默认行为，无需每次说明）

Perch 是 Tauri 桌面 GUI 应用。**「启动 / 全局启动这个项目」一律执行**：

```bash
./start.sh        # 一键启动（内部即 open /Applications/Perch.app + 核验）
```

- 本项目开源（有 GitHub 远端），故按全局约定用 `start.sh` 命名（纯私有项目才叫 `start-tian.sh`）。
- `./start.sh --build`：重新构建 + 覆盖安装到 /Applications + 重启常驻实例。

等价的裸命令：

```bash
open /Applications/Perch.app
```

- `open` 把进程交给 macOS `launchd`（PPID=1），**与终端完全解耦**——关闭终端 / 退出 Claude Code 后应用照常运行，满足「关掉终端不停」的诉求。
- 启动后核验：`pgrep -fl -i perch` 能看到 `/Applications/Perch.app/Contents/MacOS/perch-app`，且其 PPID 为 1。

### 不要这样启动
- ❌ `pnpm tauri dev` / 直接跑 `src-tauri/target/debug/perch-app`：dev 二进制依赖 vite dev server，**单独跑会白屏**；且 dev server 是终端子进程，关终端即停。dev 模式仅用于本地开发调试，不用于「让它常驻运行」。
- ❌ 用 `&` 后台挂在当前 shell：仍是 shell 子进程，终端关闭会被 SIGHUP 杀掉。`open` 才是正解。

## 改了代码后如何刷新常驻应用
`/Applications/Perch.app` 是已构建产物，改源码不会自动生效。**规范流程就是一条命令**：

```bash
./start.sh --build   # 构建 → 停旧实例 → 覆盖安装到 /Applications → 重启 + 核验解耦
```

等价的裸命令（顺序与脚本一致：先停旧实例、再替换 bundle）：

```bash
pnpm tauri build                              # 产出 src-tauri/target/release/bundle/macos/Perch.app
pkill -f /Applications/Perch.app/Contents/MacOS/perch-app || true      # 停旧实例
rm -rf /Applications/Perch.app                # 移除旧 bundle（BSD cp -R 对已存在 bundle 是合并而非替换，会残留陈旧文件）
cp -R src-tauri/target/release/bundle/macos/Perch.app /Applications/   # 全新安装
open /Applications/Perch.app                  # 重启常驻实例
```

## 依赖管理
- 本项目用 **pnpm workspace**：装依赖一律 `pnpm add`，**`npm install` 会崩**。
