// i18n module — flat dictionary, useSyncExternalStore-based reactivity.
// Supports `t(key, params?)` for use outside React, and `useT()` hook
// for components that should re-render when language changes.

import { useSyncExternalStore } from "react";

export type Lang = "en" | "zh";

type Dict = Record<string, string>;

const en: Dict = {
  "app.loading": "Loading...",
  "app.dbError": "DB error: {msg}",
  "app.count": "{n} entries",
  "app.count.one": "1 entry",

  "list.empty": "No entries yet. Type below and press Enter.",
  "list.pinnedSection": "Pinned",
  "list.otherSection": "Others",

  "entry.edited": "(edited)",
  "entry.saved": "saved",
  "entry.copy": "Copy",
  "entry.copied": "Copied",
  "entry.delete": "Delete",
  "entry.deleteConfirm": "Confirm",
  "entry.pin": "Pin to top",
  "entry.unpin": "Unpin",
  "entry.drag": "Drag to reorder",
  "entry.titlePlaceholder": "Title (optional)",
  "entry.modifiedAt": "Modified {t}",
  "entry.createdAt": "Created {t}",
  "entry.editHint": "Click to edit",

  "input.placeholder": "Type, Enter to save (Shift+Enter = newline)",

  "search.open": "Search",
  "search.close": "Close search",
  "search.placeholder": "Search title and content...",
  "search.noResults": "No matching entries.",

  "settings.title": "Settings",
  "settings.open": "Open settings",
  "settings.close": "Close",
  "settings.cancel": "Cancel",
  "settings.save": "Save",

  "settings.lang": "Language",
  "settings.lang.en": "English",
  "settings.lang.zh": "中文",

  "settings.tsFormat": "Timestamp format",
  "settings.tsFormat.local": "Local — 2026-05-15 12:35:00",
  "settings.tsFormat.iso": "ISO 8601 — 2026-05-15T04:35:00.000Z",

  "settings.customText": "Custom text (appended to clipboard)",
  "settings.customText.placeholder": "e.g. — from Perch",

  "settings.customPosition": "Custom text position",
  "settings.customPosition.before": "Before content",
  "settings.customPosition.after": "After content",

  "settings.fontSize": "Font size",
  "settings.fontSize.hint": "⌘ +/− to zoom · ⌘ 0 to reset · applies instantly",
  "settings.fontSize.decrease": "Smaller",
  "settings.fontSize.increase": "Larger",
  "settings.fontSize.reset": "Reset to 100%",

  "settings.preview": "Clipboard preview",
  "settings.preview.mock": "your note content here",

  "time.justNow": "just now",
  "time.secAgo": "{n}s ago",
  "time.minAgo": "{n} min ago",
  "time.hourAgo": "{n} h ago",
  "time.dayAgo": "{n} d ago",
};

const zh: Dict = {
  "app.loading": "加载中...",
  "app.dbError": "数据库错误：{msg}",
  "app.count": "共 {n} 条",
  "app.count.one": "共 1 条",

  "list.empty": "还没有记录。在下方输入并按 Enter。",
  "list.pinnedSection": "置顶",
  "list.otherSection": "其他",

  "entry.edited": "（已编辑）",
  "entry.saved": "已保存",
  "entry.copy": "复制",
  "entry.copied": "已复制",
  "entry.delete": "删除",
  "entry.deleteConfirm": "再点确认",
  "entry.pin": "置顶",
  "entry.unpin": "取消置顶",
  "entry.drag": "拖动调整顺序",
  "entry.titlePlaceholder": "标题（可选）",
  "entry.modifiedAt": "修改于 {t}",
  "entry.createdAt": "创建于 {t}",
  "entry.editHint": "点击编辑",

  "input.placeholder": "输入内容，Enter 保存（Shift+Enter 换行）",

  "search.open": "搜索",
  "search.close": "关闭搜索",
  "search.placeholder": "搜索标题和内容...",
  "search.noResults": "没有匹配的记录。",

  "settings.title": "设置",
  "settings.open": "打开设置",
  "settings.close": "关闭",
  "settings.cancel": "取消",
  "settings.save": "保存",

  "settings.lang": "语言",
  "settings.lang.en": "English",
  "settings.lang.zh": "中文",

  "settings.tsFormat": "时间戳格式",
  "settings.tsFormat.local": "本地格式 — 2026-05-15 12:35:00",
  "settings.tsFormat.iso": "ISO 8601 — 2026-05-15T04:35:00.000Z",

  "settings.customText": "自定义文本（追加到剪贴板）",
  "settings.customText.placeholder": "例如：— 来自 Perch",

  "settings.customPosition": "自定义文本位置",
  "settings.customPosition.before": "内容之前",
  "settings.customPosition.after": "内容之后",

  "settings.fontSize": "字体大小",
  "settings.fontSize.hint": "⌘ +/− 缩放 · ⌘ 0 复位 · 即时生效",
  "settings.fontSize.decrease": "缩小",
  "settings.fontSize.increase": "放大",
  "settings.fontSize.reset": "复位到 100%",

  "settings.preview": "剪贴板预览",
  "settings.preview.mock": "你的记录内容",

  "time.justNow": "刚刚",
  "time.secAgo": "{n} 秒前",
  "time.minAgo": "{n} 分钟前",
  "time.hourAgo": "{n} 小时前",
  "time.dayAgo": "{n} 天前",
};

const dicts: Record<Lang, Dict> = { en, zh };

// --- store ---
let currentLang: Lang = "en";
const listeners = new Set<() => void>();

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): Lang {
  return currentLang;
}

export function setLang(lang: Lang): void {
  if (lang === currentLang) return;
  currentLang = lang;
  listeners.forEach((cb) => cb());
}

export function getLang(): Lang {
  return currentLang;
}

// --- format ---
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => {
    const v = params[k];
    return v === undefined ? `{${k}}` : String(v);
  });
}

/**
 * Translate a key. Falls back: current lang -> en -> key itself.
 * Safe to call outside React.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const dict = dicts[currentLang] ?? en;
  const raw = dict[key] ?? en[key] ?? key;
  return interpolate(raw, params);
}

/**
 * React hook: returns a `t` function bound to the current lang and
 * re-renders the component when lang changes.
 */
export function useT(): (key: string, params?: Record<string, string | number>) => string {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return t;
}
