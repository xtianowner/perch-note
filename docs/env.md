<!-- purpose: 开发环境与构建依赖说明 -->

# Perch 开发环境

**创建时间**: 2026-05-15 11:46:39
**更新时间**: 2026-05-15 11:50:00

## 必备工具

| 工具 | 最低版本 | 用途 | macOS 安装 |
|---|---|---|---|
| Node.js | 20.x | 前端构建 | `brew install node@20` |
| pnpm | 9.x | 包管理 | `npm i -g pnpm` |
| Rust | 1.77+ | Tauri 后端 | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Xcode CLT | 最新 | macOS 编译 | `xcode-select --install` |

## Windows 额外依赖

- Visual Studio Build Tools 2022 (Desktop development with C++)
- WebView2 Runtime (Win10/11 已内置)

## 项目命令（待 V1 scaffold 后启用）

```bash
pnpm install
pnpm tauri dev          # 开发模式
pnpm tauri build        # 生产打包
pnpm test               # 前端单测
cargo test              # Rust 测试
```

## 不使用 conda

本项目不涉及 Python，直接用 Node + Rust 工具链。
