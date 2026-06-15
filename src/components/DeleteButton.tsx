import { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { useT } from "../lib/i18n";

const CONFIRM_WINDOW_MS = 4000;

type Props = {
  onConfirm: () => void;
};

export function DeleteButton({ onConfirm }: Props) {
  const t = useT();
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleClick() {
    if (confirming) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      setConfirming(false);
      onConfirm();
      return;
    }
    setConfirming(true);
    timerRef.current = window.setTimeout(() => {
      setConfirming(false);
      timerRef.current = null;
    }, CONFIRM_WINDOW_MS);
  }

  return (
    <button
      className={`copy-btn delete-btn${confirming ? " is-confirming" : ""}`}
      onClick={handleClick}
      type="button"
      aria-label={confirming ? t("entry.deleteConfirm") : t("entry.delete")}
      title={confirming ? t("entry.deleteConfirm") : t("entry.delete")}
    >
      <Trash2 size={13} strokeWidth={1.75} aria-hidden="true" />
      {/* icon-only by default to keep the header compact; the two-step confirm
          still reveals its label so the destructive action stays legible */}
      {confirming && <span>{t("entry.deleteConfirm")}</span>}
    </button>
  );
}
