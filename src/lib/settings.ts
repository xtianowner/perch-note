import type { Lang } from "./i18n";

export type CopyPosition = "before" | "after";
export type TimestampFormat = "local" | "iso";

export type Settings = {
  timestampFormat: TimestampFormat;
  customText: string;
  customPosition: CopyPosition;
  lang: Lang;
  // Continuous body-text zoom (multiplies --fs-11..14). Driven by ⌘+/−/0 and
  // the settings stepper. Replaces the legacy 3-tier textSize.
  fontScale: number;
};

export const FONT_SCALE_MIN = 0.7;
export const FONT_SCALE_MAX = 1.8;
export const FONT_SCALE_STEP = 0.1;
export const FONT_SCALE_DEFAULT = 1;

export function clampFontScale(v: number): number {
  if (!Number.isFinite(v)) return FONT_SCALE_DEFAULT;
  const clamped = Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, v));
  // round to 2 decimals so repeated ±0.1 steps don't accumulate float drift
  return Math.round(clamped * 100) / 100;
}

const DEFAULTS: Settings = {
  timestampFormat: "local",
  customText: "",
  customPosition: "before",
  lang: "en",
  fontScale: FONT_SCALE_DEFAULT,
};

const KEY = "perch.settings.v1";

// Legacy small/medium/large → continuous scale, so users upgrading from the
// old 3-tier select keep their chosen size on first load.
const LEGACY_TEXT_SIZE_SCALE: Record<string, number> = {
  small: 0.92,
  medium: 1,
  large: 1.12,
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const fontScale =
      typeof parsed.fontScale === "number"
        ? clampFontScale(parsed.fontScale)
        : typeof parsed.textSize === "string" &&
            parsed.textSize in LEGACY_TEXT_SIZE_SCALE
          ? clampFontScale(LEGACY_TEXT_SIZE_SCALE[parsed.textSize])
          : DEFAULTS.fontScale;
    return {
      timestampFormat:
        parsed.timestampFormat === "local" || parsed.timestampFormat === "iso"
          ? parsed.timestampFormat
          : DEFAULTS.timestampFormat,
      customText:
        typeof parsed.customText === "string"
          ? parsed.customText
          : DEFAULTS.customText,
      customPosition:
        parsed.customPosition === "before" || parsed.customPosition === "after"
          ? parsed.customPosition
          : DEFAULTS.customPosition,
      lang:
        parsed.lang === "en" || parsed.lang === "zh"
          ? parsed.lang
          : DEFAULTS.lang,
      fontScale,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}
