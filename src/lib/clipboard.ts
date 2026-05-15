import type { Entry } from "./types";
import type { Settings, TimestampFormat } from "./settings";
import { t } from "./i18n";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatTimestamp(ts: number, fmt: TimestampFormat): string {
  const d = new Date(ts);
  if (fmt === "iso") return d.toISOString();
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

export function buildClipboardText(entry: Entry, settings: Settings): string {
  const ts = formatTimestamp(entry.updatedAt, settings.timestampFormat);
  const custom = settings.customText.trim();
  const parts: string[] = [];

  if (custom && settings.customPosition === "before") {
    parts.push(custom, "", ts, entry.content);
  } else if (custom && settings.customPosition === "after") {
    parts.push(ts, entry.content, "", custom);
  } else {
    parts.push(ts, entry.content);
  }
  return parts.join("\n");
}

export function previewClipboardText(settings: Settings): string {
  const mockEntry: Entry = {
    id: 0,
    content: t("settings.preview.mock"),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  return buildClipboardText(mockEntry, settings);
}
