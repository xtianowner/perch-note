<!-- purpose: Perch UI 设计决策与视觉规范, Phase 2 美化阶段闭环 -->

# Perch — UI 设计决策

**创建时间**: 2026-05-15 12:58:07
**更新时间**: 2026-05-15 16:50:00

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

---

## v2 polish (2026-05-15)

第二轮微调。背景：主 agent 在 v1 后续增加了 title input / DeleteButton / entry-count 三类新元素（commit `c380560` + `98db887`），是用 v1 design tokens 凭手感拼的，需要"二次熔接"。用户原话："文字间距、风格设计等"。

按 ui-ux-pro-max 的 Typography & Color (MEDIUM) + Touch & Interaction (CRITICAL) + Animation (MEDIUM) + Style consistency (MEDIUM) 优先级清单，做以下调整：

1. **Title 字号 + 字重重排（核心）**：`fs-14 / weight 600 / letter-spacing -0.005em` → `fs-13 / weight 600 / letter-spacing -0.01em`。理由：360×480 小窗内 14px+600 视觉过重，title 一旦填写就压过 textarea 内容；同字号靠字重区分层级符合 Swiss minimal 原则（Tschichold "类型层级靠字重而非字号"）。title 与 body content 同尺度，title 字重 600、body 400，hierarchy 清晰且不喧哗。

2. **新增 `--danger / --danger-hover / --danger-soft / --danger-soft-strong` 4 个 token**（浅 `#dc2626` 系 / 深 `#f87171` 系），把 DeleteButton 里 4 处 hardcoded `#dc2626`/`#f87171`/`rgba(220,38,38,*)` 全部归 token。理由：与 accent / success 同等级；以后若做主题切换不会漏。

3. **行高与字号微调**：body line-height `1.5 → 1.55`；textarea / preview-text / input-textarea 同步 `1.5 → 1.55`。理由：ui-ux-pro-max line-height 推荐 1.5–1.75，Inter 在 13px 下偏紧，1.55 给中文混排留口气。

4. **`font-variant-numeric: tabular-nums` 扩到 `.entry-time`**：之前只在 entry-count 用。理由：相对时间含数字（"5 min ago" / "5 分钟前"），数字宽度抖动会让 header 行右侧 actions 跟着抖；tabular-nums 稳定。移除原 `.entry-time` 的 `letter-spacing: 0.01em`（与字号 11px 配字间距过松）。

5. **entry-count 重新定位 + 缩字号**：`fs-11 → fs-10` (10px)、`top: 10px → 8px`、`letter-spacing: 0.04em → 0.08em`、加 `opacity: 0.85`、加 `line-height: 26px` 与 settings-trigger 视觉基线对齐。理由：作为静默状态徽标，应该比 secondary text 还轻一档；10px + uppercase + tracking 是经典 micro-label 风格。

6. **entry-item 内部密度重排**：padding 由 `var(--space-2) var(--space-3)` (8/12) 调整为 `var(--space-2) var(--space-3) var(--space-3)` (上 8 / 左右 12 / 下 12)；title 与 textarea 之间 `margin-bottom: 2px → var(--space-1)` (4px)；entry-header `min-height: 18px → 20px`。理由：v1 上下 8px 在 v2 加了 title 后过紧，下方多 4px 让 title + textarea 视觉分组更清；header 高度 20 留出 saved-mark 动画空间。

7. **focus halo 全局统一为 3px**：settings-trigger / icon-btn / copy-btn 的 focus ring 从 2px 提升到 3px，与 textarea / input 等输入控件保持同一规格。理由：UX rule `focus-states` (CRITICAL)，多档 ring 让视觉不统一。

8. **saved-mark 动画升级**：`opacity fade-in` → `opacity + translateY(-1px → 0)`，符合 ui-ux-pro-max `transform-performance` 规则（用 transform/opacity，不用 width/height/top）。视觉上"轻轻浮上来"。

9. **DeleteButton 第二态视觉强化**：confirming 状态除背景加深外，新增 `font-weight: 600`（普通 copy-btn 默认 500）。理由：v1 hover 与 confirming 仅靠背景颜色区分，色弱用户难辨；字重加权是第二信号。

10. **滚动条 thumb min-height: 24px**：避免内容很多时滑块太小难抓。`empty-state` 加 `letter-spacing: 0.005em` + `line-height: 1.6`，长占位提示更舒展。

11. **Settings label tracking 加宽**：`letter-spacing 0.04em → 0.06em`。理由：11px uppercase label 在 0.04em 下字符间距偏紧，看着像被压扁；0.06em 是 Inter 在 small caps 风格下的常见 tracking。

12. **`--fs-10: 10px`** 新增到 design tokens（仅供 entry-count 这一处用）；`text-rendering: optimizeLegibility` 加到 body（让 Inter 在 13px 显示更好）。

### 不动的部分
- design tokens 颜色（accent / success / bg / text / border 整套不动；只新增 danger 子集）
- 间距网格 4/8/12/16（一律走 var）
- Inter / lucide / 字体栈策略
- 复制按钮 / settings modal 布局结构
- i18n key 名（仅未来若需要"copying..." flash 才扩 key）
- TSX 文件层组件结构（无新增 wrapper，无 className 改名）— v2 polish 是**纯 CSS 改动**

### bundle 影响
本轮纯 CSS，JS 0 变化；CSS 微增（多 ~0.2KB），无新增 npm 依赖。

---

## v3 polish (2026-05-15)

第三轮微调。两项主诉求：

1. 用户希望可调整文本大小（accessibility / 不同显示器密度场景）
2. 用户反馈"有些文字和边框距离较近"——v2 调过密度但还有遗漏点

### 字号调节方案

- **形态决策：3 档下拉 select（Small / Medium / Large）**，否决滑块。理由：(a) 桌面工具偏 explicit / 可记忆 / 可复现；(b) 3 档下拉占用空间和现有 Language / Timestamp format select 一致，视觉同语言；(c) 滑块需要连续值校验、touch target、视觉反馈，复杂度回报率低；(d) modular scale 原则（ui-ux-pro-max Typography→Font Size Scale）：固定 3 个尺度优于任意值。
- **缩放机制：CSS custom property `--text-scale` 乘到 `--fs-11/12/13/14`**。`--fs-10` 与 `.entry-count` / `.settings-label` 等 micro-label 故意不缩放——这类元素的"小"本身就是视觉语义（label 比 body 小一档），跟着等比放大会失去 hierarchy 感。
- **缩放系数**：small=0.92（≈12px body）、medium=1.0（13px body，当前体验）、large=1.12（≈14.5px body）。范围控制：避免 ≤11px 影响可读性，避免 ≥16px 在 360×480 窗口里挤爆布局。
- **应用面**：通过 `<div class="app" data-text-size="...">` 注入到根，所有 token 自动连级传播。loading / error / 主界面三处 `.app` div 都加了 attribute，保证一致。
- **持久化**：新增 `settings.textSize` 字段，默认 `"medium"`，写入既有 `perch.settings.v1` localStorage key；`loadSettings` 走 `{...DEFAULTS, ...parsed}` merge，旧用户自动获得默认 medium，无需迁移。
- **live preview**：Settings 面板内改字号实时反映（mutate `.app` DOM 属性），Cancel 时回滚到 saved 值——与 v2 的 lang live preview 模式一致。
- **i18n**：新增 4 个 key（`settings.textSize` + 3 档名），en/zh 同步。

### 文字与边框距离（before → after）

按"文字最贴边的元素"自上而下排查 8 处：

| 元素 | before | after | 理由 |
|------|--------|-------|------|
| `.entry-textarea` | 4px / 8px | 6px / 10px | 内容紧贴顶部与左边框是最严重的"压抑感"来源 |
| `.entry-title` | 4px / 8px | 6px / 10px | 与 textarea 视觉同语言，padding 同步 |
| `.input-textarea` | 8px / 12px | 10px / 12px | 底部输入栏文字上下贴边，垂直 +2px |
| `.entry-item` 顶部 | 8px | 10px | header 行离顶 8px，加上 entry-time 11px 字体，视觉上压顶 |
| `.copy-btn` | 3px / 8px | 4px / 10px | icon+文字组合在 hover 背景时太挤 |
| `.icon-btn` | 24×24 | 26×26 | X 图标在 settings 关闭按钮处显得"被框住" |
| `.settings-row select/input/textarea` | 6px / 8px | 7px / 10px | 表单控件常用尺度，与 input-textarea 同步 |
| `.settings-footer button` | 6px / 12px | 7px / 14px | 主按钮显得更"够分量"，符合 primary action 视觉权重 |
| `.settings-header` / `.settings-footer` | 8px / 12px | 10px / 12px | modal 上下边距与中间 body 间距一致（v2 body 是 12px） |
| `.settings-preview` | 8px / 12px | 10px / 12px | 预览框内容贴顶 |
| `.entry-list` 顶部 | 16px / 8px | 18px / 12px | 第一条 entry 离顶 16px → 18px；左右 8px → 12px（与 input-bar 12px 对齐） |

**未动**的 padding：`.settings-trigger`（齿轮，是 26×26 icon button，padding:0 居中即可）、`.entry-list` 列表项间 gap（v2 已为 8px，合理）、`.entry-actions` 内部 gap=2px（紧凑视觉 chunk，不拆开）、`.settings-body` gap=12px（行间已足够）。

### 设计原则保留

- Swiss minimal 紧凑感不破坏：所有 padding +2~3px，总体 "compact" 感不变，只去掉"挤"
- 4/8/12/16 spacing grid：新值（6/10/14/18）部分非 grid 值，是有意的——textarea 内边距用非 grid 数能更精细控制呼吸感（typography 内距 vs 组件外距是两套系统，常见做法）
- design tokens 不动：颜色 / 圆角 / 阴影 / 动画时长 完全沿用

### Pre-Delivery Checklist（本轮）

- [x] 字号 3 档 setting，默认 medium 保留当前体验
- [x] 旧用户兼容（merge defaults 自动补 textSize=medium）
- [x] textSize 在 loading / error / main 三种 `.app` 状态下均生效
- [x] live preview + cancel 回滚
- [x] micro-label（entry-count / settings-label）不参与缩放，保持视觉语义
- [x] i18n en/zh 同步新 4 个 key
- [x] 所有 padding 改动后总宽度仍适配 280px min-width
- [x] 未触碰：data layer / 自动保存 / `buildClipboardText` / 既有 i18n key 名称 / 窗口配置
- [x] `pnpm build` 通过

### bundle 影响

- CSS 11.59KB → **11.72KB** (+0.13KB)
- JS 209.43KB → **210.45KB** (+1.02KB：textSize 字段 + Settings panel select + 4 个 i18n key)
- 无新增 npm 依赖
