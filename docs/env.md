<!-- purpose: 开发环境与构建依赖说明 -->

# Perch 开发环境

**创建时间**: 2026-05-15 11:46:39
**更新时间**: 2026-05-22 10:20:00

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

## 项目命令

```bash
pnpm install
pnpm dev                # 仅 Vite（浏览器调试 UI，不带 Tauri 窗口）
pnpm build              # tsc 类型检查 + Vite 打包到 dist/
pnpm preview            # 预览 dist/ 产物
pnpm tauri dev          # Tauri 开发模式（开 360×480 永远置顶窗口）
pnpm tauri build        # 生产打包（输出到 src-tauri/target/release/bundle/）
```

> **暂无单测**：`package.json` 未配置 `test` script，`src-tauri/` 也无 `#[cfg(test)]` 用例。V2 视需要再引入。

## 不使用 conda

本项目不涉及 Python，直接用 Node + Rust 工具链。
