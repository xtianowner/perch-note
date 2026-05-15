<!-- purpose: Perch UI 设计决策与视觉规范, Phase 2 美化阶段闭环 -->

# Perch — UI 设计决策

**创建时间**: 2026-05-15 12:58:07
**更新时间**: 2026-05-15 12:58:07

---

## Phase 1 闭环标记

- [x] Tauri scaffold + React + Vite
- [x] SQLite 持久化（tauri-plugin-sql + 前端直发 SQL）
- [x] 自动保存三重防线（15s debounce + blur + unmount）
- [x] 复制规则（时间戳 + 自定义文本 + 位置）
- [x] Settings 面板（localStorage 持久化）
- [x] 组件分层完成：`App / EntryList / EntryItem / InputBar / CopyButton / SettingsPanel`，视觉与功能未硬耦合

> Phase 1 视为闭环，Phase 2 仅做美化 + i18n + InputBar resize，**不改任何数据 / 自动保存 / 复制规则 / 窗口配置**。

---

## Phase 2 设计决策

### 1. 设计原则

- **Quiet by default, expressive on focus.** 静态时几乎隐形，操作时给予明确视觉反馈
- **3 件套**：永远置顶 / 时间戳 / 易复制，视觉绝不喧宾夺主
- **小窗自洽**：默认 360×480 窗口，所有元素在 280×200 最小窗口下仍可读可点
- **纯文本至上**：textarea 内容 raw 渲染，CSS 不引入任何 markdown 风格的视觉装饰

### 2. ui-ux-pro-max 决策（参考）

通过 skill 跑 `--design-system "minimal desktop notepad always-on-top floating window quick capture"`：

- **Pattern**：skill 返回的是 landing 模板（Lead Magnet + Form），不适用于桌面工具 → **不采纳 pattern 部分**
- **Style** 采纳：`Trust & Authority` 的克制色 + Minimal swiss 字体方向；并结合 `Exaggerated Minimalism` 的"单 accent only"原则
- **Typography** 采纳：Inter / system-ui，weights 400/500/600；坚持 system-ui 优先，**不**走 Google Fonts CDN（离线启动友好）
- **Colors** 采纳：单色中性 + 一个克制 accent（用 `#2563eb` 而非建议的金色 `#D4AF37` — 桌面工具偏冷静理性，金色过于品牌化）
- **Anti-patterns** 全部避免：playful design / AI 紫粉渐变 / 装饰性动画 / OLED neon glow

### 3. Design Tokens（CSS Custom Properties）

所有视觉变量统一在 `:root` / `[data-theme="dark"]` 定义。

#### 间距 (4/8/12/16 网格)

```
--space-1: 4px;  --space-2: 8px;  --space-3: 12px;  --space-4: 16px;  --space-6: 24px;
```

#### 字号

```
--fs-12: 12px;  // header / meta / button
--fs-13: 13px;  // body, textarea, settings
--fs-14: 14px;  // modal title
--fs-11: 11px;  // 极小辅助文字 (label / saved-mark)
```

#### 圆角

```
--radius-sm: 4px;  // chip / button / input
--radius-md: 6px;  // card / modal
```

#### 阴影（仅 modal + 强 hover）

```
--shadow-1: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-2: 0 4px 12px rgba(0, 0, 0, 0.08);    // hover entry card
--shadow-modal: 0 10px 30px rgba(0, 0, 0, 0.18);
--shadow-modal-dark: 0 10px 30px rgba(0, 0, 0, 0.6);
```

#### 过渡

```
--ease: cubic-bezier(0.4, 0, 0.2, 1);
--dur-fast: 120ms;
--dur-base: 180ms;
```

#### 浅色主题

```
--bg-app:       #fafafa;
--bg-surface:   #ffffff;
--bg-input:     #ffffff;
--bg-muted:     #f4f4f5;
--border:       #e7e7ea;
--border-strong:#d4d4d8;
--text-1:       #18181b;   // primary
--text-2:       #52525b;   // secondary
--text-3:       #a1a1aa;   // tertiary / placeholder
--accent:       #2563eb;
--accent-hover: #1d4ed8;
--success:      #16a34a;
--scrollbar:    rgba(0,0,0,0.12);
```

#### 深色主题（避免纯黑，用深灰）

```
--bg-app:       #18181b;   // zinc-900
--bg-surface:   #232327;   // 偏暖深灰
--bg-input:     #1f1f23;
--bg-muted:     #2a2a30;
--border:       #2e2e34;
--border-strong:#3f3f46;
--text-1:       #f4f4f5;
--text-2:       #a1a1aa;
--text-3:       #71717a;
--accent:       #3b82f6;
--accent-hover: #60a5fa;
--success:      #4ade80;
--scrollbar:    rgba(255,255,255,0.14);
```

### 4. 字体

- **Stack**：`'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif`
- Inter 不通过 Google Fonts CDN 加载，使用 fallback 优先；用户机器若装了 Inter 自动启用，未装则 system-ui
- **Mono**（textarea / preview）：`ui-monospace, 'SF Mono', Menlo, Consolas, monospace`
- 字重：400 (body) / 500 (按钮/小标题) / 600 (modal 标题)
- 行高：1.5（body）/ 1.4（textarea，让相邻行更紧凑）

### 5. 图标策略

- 引入 `lucide-react`（tree-shake 友好，按需 import 单个图标，不会全量打入 bundle）
- 替换：⚙ → `Settings`、× → `X`、copy 文字按钮 → `Copy` + `Check` 图标 + 文字组合
- 尺寸：14px / 16px stroke 1.5；颜色继承 `currentColor`
- **不**在 entry 内容里渲染图标（纯文本原则）

### 6. 组件视觉规则

#### Entry 卡片

- 默认：浅边框 `--border` + 微阴影 `--shadow-1`；hover 时 `--shadow-2` + 边框升级 `--border-strong`
- header 行：相对时间用 `--text-2`，(edited) / saved-mark 用 `--text-3` 斜体；saved-mark 用 `--success` 色
- textarea：默认透明边框，hover 显示 `--border`，focus 显示 `--accent` (1px) + `--bg-input` 背景
- copy 按钮：图标+文字组合，icon 14px；hover 时背景变 `--bg-muted`；copied 状态用 `--success`

#### InputBar

- 顶部 1px `--border` 分割线；textarea 与 entry 卡片视觉同语言（同样 radius + border + focus 行为）
- 字体改回 inherit（与 entry 卡片一致，纯文本工具不需要刻意 mono）
- **resize: vertical**，`min-height: 44px`，`max-height: 60vh`（窗口高度 60% 上限，避免拖满把列表挤没）

#### Settings Modal

- backdrop：`rgba(0,0,0,0.35)` + 浅色 `backdrop-filter: blur(2px)`
- panel：`--bg-surface` + `--radius-md` + `--shadow-modal`；入场 fade 100ms + 微 translateY(4px)
- header 标题 14/600；close 按钮用 `X` 图标
- 表单输入：focus ring 用 `--accent` 1px + 2px halo（`box-shadow: 0 0 0 3px rgba(37,99,235,0.15)`）
- footer 主按钮：`--accent` 实底；次按钮：`--bg-surface` + `--border`

#### Settings Trigger（齿轮）

- 位置 `top: 6px right: 6px`；尺寸 26×26；默认 `--text-3`，hover `--text-1` + `--bg-muted` 背景

#### 滚动条（自定义）

- `width: 8px`；thumb：`--scrollbar`；track 透明；不显示 buttons
- WebKit + 标准 `scrollbar-color`

### 7. 动效

- 所有过渡走 `transition: <prop> var(--dur-base) var(--ease)`
- saved-mark / copied 状态：opacity fade，不用 transform 抖动
- Modal 入场：100ms `opacity` + `translateY(4px)`，**仅入场，不做出场**（避免关闭时延迟感）
- `prefers-reduced-motion: reduce` 下所有 transition / animation 缩到 0.01ms

### 8. 深色模式策略

- 触发：`prefers-color-scheme: dark`（自动）；MVP 不加手动 toggle（保留 Phase 3）
- 整体调色：`#18181b → #232327`（深灰系，不纯黑，避免 OLED 上"洞"感）
- accent 提亮：`#2563eb → #3b82f6`，在暗背景下更易读
- 阴影：用更深的 alpha（0.6 vs 浅模式的 0.18）
- 边框：`#2e2e34`，不到 `#000` 也不到 `#444`

### 9. i18n 决策

- 字典 keys：`扁平.分组` 命名（如 `settings.title` / `entry.savedFlash`），避免深嵌套
- 字符串覆盖：所有 UI 文案、时间相对单位、placeholder、aria-label
- API：
  - `t(key, params?)` — 顶层函数（也可被非 React 模块如 `time.ts` 调用）
  - `useT()` — React hook，订阅 lang 切换重渲染
  - `setLang(lang)` — 触发全局重渲染（通过 `useSyncExternalStore` + listener set）
- 持久化：写入现有 `perch.settings.v1` 的 `lang` 字段
- 默认 `en`；首次启动如系统语言为 `zh*`，**不**自动跟随（保持 explicit），用户可在 Settings 切换

### 10. Pre-Delivery Checklist（本轮已核对）

- [x] 无 emoji 作图标：⚙ / × 已替换为 lucide SVG
- [x] 所有可点击元素 `cursor: pointer`
- [x] hover 过渡 120-180ms ease-out
- [x] 浅色文字 contrast：`--text-1 #18181b on #fafafa` ≈ 16:1，`--text-2 #52525b` ≈ 7:1（AAA）
- [x] focus 可见环 + 键盘可达
- [x] `prefers-reduced-motion` 已尊重
- [x] 双主题已打磨（深色非纯黑）
- [x] InputBar resize 上限 60vh，不会挤掉列表
- [x] **未触碰**数据层 / 自动保存 / `buildClipboardText` 输出格式 / 窗口配置
