<!-- purpose: Perch UI 设计决策与视觉规范, Phase 2 美化阶段闭环 -->

# Perch — UI 设计决策

**创建时间**: 2026-05-15 12:58:07
**更新时间**: 2026-06-15 (修改时间显示 + 字体连续缩放 + 模糊搜索)

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
--fs-10: 10px;  // micro-label：固定不缩放 (entry-count / section-label)
--fs-11: 11px;  // 极小辅助文字 (header meta / button / saved-mark)
--fs-12: 12px;  // 搜索框 / 设置内文
--fs-13: 13px;  // body, textarea, 内容只读视图
--fs-14: 14px;  // modal title
--fs-15: 15px;  // entry 标题（加大加粗，与正文拉开层级）
// --fs-11..15 = calc(基准 * var(--text-scale))，随字体缩放联动；--fs-10 固定。
// --text-scale 设在 :root(<html>) 上（见 §2.2 教训），不要设在后代元素。
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

- 字典 keys：`扁平.分组` 命名（如 `settings.title` / `entry.saved` / `entry.titlePlaceholder`），避免深嵌套
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

---

## 置顶 + 拖动排序 (2026-05-26)

两项功能性扩展，按双闸门规则属 **Phase 1（功能链路）**：复用既有 design tokens 与按钮模式，**未做新的视觉决策**，精细视觉打磨（拖拽落位动画 / drop 占位提示 / 分区过渡）留待 Phase 2。

- **PinButton**：`copy-btn` 的图标-only 变体（同 DeleteButton 走 `copy-btn` 基类），`is-pinned` 时图标 `fill=currentColor` + `--accent` 色；置顶项卡片根节点 `is-pinned`，加 `inset 3px 0 0 --accent` 左边条作标记。
- **拖动手柄**：每条 header 左侧 `GripVertical`（`.drag-handle`，`cursor: grab` / `:active grabbing`，`touch-action: none` 把手势交给 dnd-kit）；drag listeners **只绑在手柄**上，避免与 textarea 文本选择冲突。拖动中卡片 `is-dragging`（`opacity: .5`）。
- **分区**：列表按 `pinned` 拆「置顶 / 其他」两个独立 `DndContext`，跨区拖动天然不可能（与"置顶浮顶"语义一致）；有置顶项时显示 `.entry-section-label`（10px uppercase micro-label，同 entry-count 风格）。
- **依赖 / bundle**：新增 `@dnd-kit/core + sortable + utilities`；JS ~212KB → ~260KB（gzip ~83KB）。这是本项目首个运行时 UI 依赖（此前仅 lucide-react）。
- 选 `@dnd-kit` 而非原生 HTML5 DnD：手柄绑定干净、自带键盘可达性，避免"动态 draggable + window mouseup 兜底"那套脆弱 hack。

---

## 修改时间显示 + 字体连续缩放 + 模糊搜索 (2026-06-15)

三项功能性扩展，按双闸门规则属 **Phase 1（功能链路）**：复用既有 design tokens 与按钮/输入模式，**未做新的视觉决策**（精细动效 / 搜索高亮 / 缩放过渡留待 Phase 2）。**未触碰数据层 / SQLite 迁移 / `buildClipboardText` / 自动保存 / 窗口配置**——零数据风险。

### 2.1 修改时间显示（绝对 + 相对并排）
- 痛点：header 之前只显示 `formatRelative(updatedAt)`（"15 h ago"），绝对修改时间藏在 hover tooltip。
- 决策：header 改为 `绝对修改时间 · 相对时间`（如 `2026-06-15 10:49 · 15h前`）。绝对部分沿用既有 `timestampFormat` 设置（local 去秒 = `YYYY-MM-DD HH:MM`；iso = 完整 ISO），**不新增设置项**。相对部分用 `--text-3` 弱化为次要信息。
- tooltip 升级为两行：`修改于 <full> / 创建于 <full>`（未编辑则只给创建时间）。
- 布局护栏：`.entry-time` 加 `overflow:hidden + text-overflow:ellipsis + white-space:nowrap + min-width:0`，保证长绝对时间（尤其 ISO）截断而非把右侧 actions 挤出 280px 窗口。
- 实现：`time.ts` 新增 `formatAbsoluteShort(ts, fmt)`；EntryItem 渲染并排两段。

### 2.2 字体连续缩放（⌘ +/−/0）
- 痛点：mac 上 `⌘ +` 不能像浏览器那样缩放 Tauri webview；旧 3 档 textSize 太粗且要进设置。
- 决策：把离散 `textSize`（small/medium/large）升级为**连续 `fontScale`（0.7–1.8，步进 0.1）**，沿用 `--text-scale` 乘到 `--fs-11..14`（micro-label `--fs-10` 仍不缩放，保 hierarchy）。
- 交互：全局快捷键 `⌘=`/`⌘+` 放大、`⌘-` 缩小、`⌘0` 复位（`metaKey||ctrlKey`，App 顶层 `window` keydown，`preventDefault`）；设置面板内提供 `− 110% + ⟲` 步进器作为可发现入口。
- 单一真相源：`fontScale` 存在 `settings`，App 用 `useEffect` 把它 `document.documentElement.style.setProperty('--text-scale', …)` **设到 `:root`(`<html>`)**（取代旧 `data-text-size` 属性 + 3 条 CSS 规则）。键盘与步进器走同一条 `setFontScale`/`adjustFontScale`（functional setState + 立即 `saveSettings`），**即时生效、即时持久化、不走 draft/save**；设置面板 `save()` 用 live `fontScale` 而非 draft 快照，避免被开面板时的旧值覆盖。
  - **教训（2026-06-15 启动后用户实测：⌘ +/− 与设置改倍数全无效）**：初版把 `--text-scale` **内联设在 `.app`(`<div>`)** 上，但 `--fs-11..14` 是在 `:root` 用 `calc(..px * var(--text-scale))` 定义的——**CSS 自定义属性里的 `var()` 在"声明它的那个元素"上就已解析定值**；`.app` 是 `:root` 的后代，在后代覆盖 `--text-scale` 不会回头重算 `:root` 早已按 `1` 算死的 `--fs-*`，于是缩放从来没生效（经典 `--double-gap: calc(var(--gap)*2)` 陷阱）。修复：改用 `useEffect` 把 `--text-scale` 设到 `document.documentElement`(`:root`) 本身，与 `--fs-*` 同元素解析，后代统一继承缩放值。结论：**派生 token `calc(base * var(--x))` 必须与会被覆盖的 `--x` 设在同一元素（或其祖先）**；若要在子树里覆盖，得把派生 token 也在该子树重新声明，否则 silently no-op、且无报错最难查。
- 迁移：`loadSettings` 把旧 `textSize` 映射成 scale（large→1.12 等），老用户无感；`clampFontScale` 钳制范围并保留 2 位小数防 ±0.1 浮点漂移。

### 2.3 模糊搜索（⌘F / 图标唤起）
- 入口：顶栏放搜索图标，点击或 `⌘F` 唤起；`Esc` 或 ✕ 收起并清空。唤起时搜索框**接管整条顶栏**（图标 + 输入 + 匹配数 + 关闭），平时让位给 entry-count + 图标组，省空间、合 mac 习惯。
- 匹配：`search.ts` **子串包含匹配**——查询按空格拆 token，每 token 须为 `title\ncontent` 的**子串（大小写不敏感 contains）**，多 token AND；空查询匹配全部。
  - **教训（启动后用户实测发现并修正）**：初版用"有序子序列"做模糊，结果太松——`todo`/`sub`/`xtian` 这类短词在中英混排笔记里几乎能在每条都拼出有序子序列，搜索返回几乎全部条目，**失去定位意义**。改为子串包含后，`todo`→2 条真含 TODO、`服务器 密码`→精确 1 条。结论：个人记事本搜索用 contains 才符合直觉，子序列 fuzzy 只适合候选集小且唯一性强的场景（如命令面板）。
- **卡内命中高亮 + 滚动定位**（用户实测后补，2026-06-15）：搜索激活时把内容从 `<textarea>` 换成**带高亮的只读 `<div class="entry-content-view">`**——`highlight.tsx` 把内容按命中区间切成文本/`<mark>` 段直接渲染成真实可见文字（`<mark>` 背景 `--search-hit` 琥珀、文字 `color: inherit`）。点击内容 → `editing=true` 切回 textarea 并 focus；blur → flush + 回只读视图；query 变化 → 重置 `editing` 保证新搜索总是高亮视图。**自动滚动到首个命中**：第一个 `<mark>` 挂 `firstMarkRef`，`view.scrollTop = mark.offsetTop - 8`。
  - **教训（overlay 方案两次对不齐后否定）**：先试"透明文字 textarea + 背后 `<mark>` 高亮层"的 overlay，要求两层文本度量逐像素一致。①第一次：`scrollbar-gutter` 在 textarea 占 8px 而 `overflow:hidden` 的 backdrop 不占 → 宽度差致换行漂移。②隐藏滚动条令两侧满宽后**仍偏一行**——overlay 受 textarea 与 div 的渲染细节（首行基线、滚动坐标系、padding 计入 offsetTop 与否）影响，**在无法看 GUI 逐像素调时不可靠**。结论：**高亮要画在真实文字上（read-view），别用第二层去对齐**——结构上消除对齐问题，比把 overlay 调准更稳。代价：搜索时内容只读、需点击进入编辑（可接受，搜索语境本就以"找"为主）。**限制**：title（`<input>`）暂不高亮（短、本就可见）。
- 拖拽互斥：搜索激活（query 非空）时 `searchActive→dndDisabled` 透传到 EntryItem（`useSortable({disabled})` + 隐藏手柄）。**理由**：过滤子集上拖动会把 `sort_order` 写到错误邻居，污染数据；直接禁用最稳。
- 状态隔离：过滤只作用于渲染（`visibleEntries`）；insert/update/delete/pin/reorder 仍操作完整 `entries`，乐观更新与搜索互不干扰；编辑中卡片即便因 flush 后不再匹配而被过滤，unmount flush 仍保证不丢数据。

### 2.4 标题/正文层级强化（2026-06-15 实测后补）
- 痛点：标题（`.entry-title`，sans `--fs-13`/600）与正文（`.entry-textarea`，mono `--fs-13`）字号相同，仅靠字族+字重区分，**用户反馈"分不清标题和内容"**。
- 决策：标题升到 `--fs-15`（新增的 token，随 `--text-scale` 一起缩放）+ `font-weight:700`；正文保持 mono `--fs-13`。如今差异 = 更大 + 更粗 + sans/mono 三重对比，层级一眼可辨。placeholder 仍 400/italic 保持"空标题"的弱提示语义。

### 设计修订：Copy/Delete 改纯图标（否定 Phase-2"图标+文字"决策）
- **背景**：2.1 把 header 时间从"15h前"扩成"绝对 · 相对"并排后，在用户的 `large`(112%) 字体 + 默认窗口下，带文字的 Copy/Delete 按钮挤占 header，"· 相对时间"被省略号截断。
- **决策（经用户确认）**：把 Copy/Delete 收敛为**纯图标**（与 PinButton 同款 `copy-btn` 图标变体），释放 ~80px 让"绝对 · 相对"完整显示。Copy 始终图标（copied 态 = `Check` + `--success`）；Delete 默认图标、**仅 confirming 态显"再点确认"文字**（红底 + 文字双信号，保留两步删除的可辨识性）；两者补 `title` tooltip + `aria-label` 保可达性。
- **教训留痕（§5 图标策略 / v2 §1 原定"copy 文字按钮 → Copy + 文字组合"被本轮否定）**：小窗工具里"图标+文字"动作按钮的横向成本会和任何新增 header 信息直接竞争；动作按钮优先图标化、把文字让给信息密度。后续 Phase 2 若再加 header 元素，按此约束评估。

### 复查修复（2026-06-15 多 agent 对抗审查后）
本轮功能跑了一轮 6 维度 × 对抗验证的 review（32 发现 → 确证 12）。修复项：
- **EntryItem savedFlash 卸载守卫**：搜索过滤会卸载正在编辑的卡片（其 unmount flush 仍持久化），给写入后的 `setSavedFlash` 加 `mountedRef` 守卫 + 清 flash 定时器，防卸载后 setState / 残留 timer。
- **pin 编辑中途丢屏幕编辑（旧 pin 功能遗留，顺手修）**：置顶/取消置顶会让卡片在「置顶/其他」两个独立 DndContext 子树间**重新挂载**，新实例从 `entry.content`（旧持久值）`useState` 初始化 → 屏幕上未保存编辑视觉消失（数据不丢）。修法：PinButton `onToggle` 先 `await flush()` 再 `onPin`，让乐观 setEntries 携带最新文本、重新挂载从最新内容初始化。flush 无变更时 no-op，置顶仍即时。
- **formatAbsoluteShort(iso) 压缩**：iso 分支由完整 `toISOString()` 改 `slice(0,16)+"Z"`，与 local 去秒同样紧凑。
- **迁移值钳制**：旧 textSize→fontScale 映射值也过 `clampFontScale`（防御性一致）。
- 验证为"无问题"（不改）：迁移 v3 纯加列零数据风险；搜索不破坏 insert/update/delete/pin/reorder 乐观更新（均操作完整 `entries`，搜索时拖拽已禁用）。

### bundle 影响
- 无新增 npm 依赖（复用 lucide-react 的 `Search`/`Minus`/`Plus`/`RotateCcw`）。
- CSS 11.72KB → 14.53KB；JS ~260KB → 265KB（gzip ~84KB）。新增 `search.ts` 纯函数 + SearchBar + 键盘逻辑 + Copy/Delete 图标化（净减文字渲染）。
