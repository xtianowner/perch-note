import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Entry } from "../lib/types";
import type { Settings } from "../lib/settings";
import { buildClipboardText } from "../lib/clipboard";
import { useT } from "../lib/i18n";

type Props = {
  entry: Entry;
  settings: Settings;
};

export function CopyButton({ entry, settings }: Props) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      const text = buildClipboardText(entry, settings);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("clipboard write failed", err);
    }
  }

  return (
    <button
      className={`copy-btn${copied ? " is-copied" : ""}`}
      onClick={handleCopy}
      type="button"
      aria-label={copied ? t("entry.copied") : t("entry.copy")}
    >
      {copied ? (
        <Check size={13} strokeWidth={2.25} aria-hidden="true" />
      ) : (
        <Copy size={13} strokeWidth={1.75} aria-hidden="true" />
      )}
      <span>{copied ? t("entry.copied") : t("entry.copy")}</span>
    </button>
  );
}
