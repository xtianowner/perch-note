import { useState, type KeyboardEvent } from "react";
import { useT } from "../lib/i18n";

export function InputBar({ onSubmit }: { onSubmit: (text: string) => void }) {
  const t = useT();
  const [value, setValue] = useState("");

  function submit() {
    const text = value.trim();
    if (!text) return;
    onSubmit(text);
    setValue("");
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="input-bar">
      <textarea
        className="input-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder={t("input.placeholder")}
        rows={2}
        autoFocus
      />
    </div>
  );
}
