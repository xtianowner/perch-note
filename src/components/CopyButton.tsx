import { useState } from "react";
import type { Entry } from "../lib/types";
import type { Settings } from "../lib/settings";
import { buildClipboardText } from "../lib/clipboard";

type Props = {
  entry: Entry;
  settings: Settings;
};

export function CopyButton({ entry, settings }: Props) {
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
    <button className="copy-btn" onClick={handleCopy} type="button">
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}
