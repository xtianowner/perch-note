import { useState, useEffect, useRef, useCallback } from "react";
import { Check } from "lucide-react";
import type { Entry } from "../lib/types";
import type { Settings } from "../lib/settings";
import { formatRelative, formatAbsolute } from "../lib/time";
import { useT } from "../lib/i18n";
import { CopyButton } from "./CopyButton";

const AUTOSAVE_DELAY_MS = 15_000;

type Props = {
  entry: Entry;
  settings: Settings;
  onUpdate: (id: number, content: string) => Promise<void>;
};

export function EntryItem({ entry, settings, onUpdate }: Props) {
  const t = useT();
  const [draft, setDraft] = useState(entry.content);
  const [savedFlash, setSavedFlash] = useState(false);

  const draftRef = useRef(draft);
  draftRef.current = draft;
  const originalRef = useRef(entry.content);
  originalRef.current = entry.content;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const idRef = useRef(entry.id);
  idRef.current = entry.id;

  const flush = useCallback(async () => {
    const next = draftRef.current.trim();
    if (!next) return;
    if (next === originalRef.current) return;
    await onUpdateRef.current(idRef.current, next);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1500);
  }, []);

  useEffect(() => {
    if (draft === entry.content) return;
    const t = window.setTimeout(() => {
      void flush();
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(t);
  }, [draft, entry.content, flush]);

  useEffect(() => {
    return () => {
      void flush();
    };
  }, [flush]);

  function handleBlur() {
    void flush();
  }

  const edited = entry.updatedAt > entry.createdAt;
  const rows = Math.max(2, draft.split("\n").length);

  return (
    <div className="entry-item">
      <div className="entry-header">
        <span className="entry-time" title={formatAbsolute(entry.updatedAt)}>
          {formatRelative(entry.updatedAt)}
          {edited && (
            <span className="entry-edited-mark"> {t("entry.edited")}</span>
          )}
          {savedFlash && (
            <span className="entry-saved-mark">
              {" "}
              <Check size={11} strokeWidth={2.25} aria-hidden="true" />{" "}
              {t("entry.saved")}
            </span>
          )}
        </span>
        <CopyButton entry={entry} settings={settings} />
      </div>
      <textarea
        className="entry-textarea"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        rows={rows}
        spellCheck={false}
      />
    </div>
  );
}
