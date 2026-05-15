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
  const title = entry.title.trim();
  const custom = settings.customText.trim();

  // Inner block: optional title + timestamp + content (tight, single-newline separators)
  const innerParts: string[] = [];
  if (title) innerParts.push(title);
  innerParts.push(ts, entry.content);
  const inner = innerParts.join("\n");

  if (custom && settings.customPosition === "before") {
    return `${custom}\n\n${inner}`;
  }
  if (custom && settings.customPosition === "after") {
    return `${inner}\n\n${custom}`;
  }
  return inner;
}

export function previewClipboardText(settings: Settings): string {
  // Preview uses an empty title to stay simple; users can copy a real entry
  // to see the title-included output.
  const mockEntry: Entry = {
    id: 0,
    title: "",
    content: t("settings.preview.mock"),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  return buildClipboardText(mockEntry, settings);
}
