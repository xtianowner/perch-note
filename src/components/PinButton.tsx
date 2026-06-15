import { Pin } from "lucide-react";
import { useT } from "../lib/i18n";

type Props = {
  pinned: boolean;
  onToggle: () => void;
};

export function PinButton({ pinned, onToggle }: Props) {
  const t = useT();
  const label = pinned ? t("entry.unpin") : t("entry.pin");
  return (
    <button
      className={`copy-btn pin-btn${pinned ? " is-pinned" : ""}`}
      onClick={onToggle}
      type="button"
      aria-pressed={pinned}
      aria-label={label}
      title={label}
    >
      <Pin
        size={13}
        strokeWidth={1.75}
        aria-hidden="true"
        fill={pinned ? "currentColor" : "none"}
      />
    </button>
  );
}
