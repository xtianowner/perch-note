import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
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
