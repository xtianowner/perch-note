import { useRef, useEffect, type KeyboardEvent } from "react";
import { Search, X } from "lucide-react";
import { useT } from "../lib/i18n";

type Props = {
  value: string;
  onChange: (v: string) => void;
  count: number;
  onClose: () => void;
};

export function SearchBar({ value, onChange, count, onClose }: Props) {
  const t = useT();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <div className="search-bar">
      <Search
        size={14}
        strokeWidth={1.75}
        aria-hidden="true"
        className="search-icon"
      />
      <input
        ref={ref}
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={t("search.placeholder")}
        spellCheck={false}
        aria-label={t("search.open")}
      />
      {value.trim() && (
        <span className="search-count" aria-live="polite">
          {count}
        </span>
      )}
      <button
        type="button"
        className="icon-btn search-close"
        onClick={onClose}
        aria-label={t("search.close")}
        title={t("search.close")}
      >
        <X size={14} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
}
