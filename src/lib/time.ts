import { t } from "./i18n";

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
