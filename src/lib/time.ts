import { t } from "./i18n";
import type { TimestampFormat } from "./settings";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatRelative(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 30) return t("time.justNow");
  if (sec < 60) return t("time.secAgo", { n: sec });
  const m = Math.floor(sec / 60);
  if (m < 60) return t("time.minAgo", { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return t("time.hourAgo", { n: h });
  const d = Math.floor(h / 24);
  return t("time.dayAgo", { n: d });
}

export function formatAbsolute(ts: number): string {
  return new Date(ts).toLocaleString();
}

// Compact absolute timestamp for the entry header. local → "YYYY-MM-DD HH:MM";
// iso → "YYYY-MM-DDTHH:MMZ" (UTC). Seconds/ms dropped to keep the header narrow.
export function formatAbsoluteShort(ts: number, fmt: TimestampFormat): string {
  const d = new Date(ts);
  if (fmt === "iso") return d.toISOString().slice(0, 16) + "Z";
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}
