export type CopyPosition = "before" | "after";
export type TimestampFormat = "local" | "iso";

export type Settings = {
  timestampFormat: TimestampFormat;
  customText: string;
  customPosition: CopyPosition;
};

const DEFAULTS: Settings = {
  timestampFormat: "local",
  customText: "",
  customPosition: "before",
};

const KEY = "perch.settings.v1";

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}
