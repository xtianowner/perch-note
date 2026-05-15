import { useState, useEffect, useRef, useCallback } from "react";
import { Check } from "lucide-react";
import type { Entry } from "../lib/types";
import type { Settings } from "../lib/settings";
import { formatRelative, formatAbsolute } from "../lib/time";
import { buildClipboardText } from "../lib/clipboard";
import { useT } from "../lib/i18n";
import { CopyButton } from "./CopyButton";
import { DeleteButton } from "./DeleteButton";

const AUTOSAVE_DELAY_MS = 15_000;

type Props = {
  entry: Entry;
  settings: Settings;
  onUpdate: (id: number, content: string, title: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export function EntryItem({ entry, settings, onUpdate, onDelete }: Props) {
  const t = useT();
  const [contentDraft, setContentDraft] = useState(entry.content);
  const [titleDraft, setTitleDraft] = useState(entry.title);
  const [savedFlash, setSavedFlash] = useState(false);

  const contentRef = useRef(contentDraft);
  contentRef.current = contentDraft;
  const titleRef = useRef(titleDraft);
  titleRef.current = titleDraft;
  const originalContentRef = useRef(entry.content);
  originalContentRef.current = entry.content;
  const originalTitleRef = useRef(entry.title);
  originalTitleRef.current = entry.title;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const idRef = useRef(entry.id);
  idRef.current = entry.id;

  const flush = useCallback(async () => {
    const c = contentRef.current.trim();
    const tt = titleRef.current.trim();
    if (
      c === originalContentRef.current.trim() &&
      tt === originalTitleRef.current.trim()
    ) {
      return;
    }
    await onUpdateRef.current(idRef.current, c, tt);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1500);
  }, []);

  function buildLiveCopyText(): string {
    const content = contentDraft.trim();
    const title = titleDraft.trim();
    const changed =
      content !== entry.content.trim() || title !== entry.title.trim();
    const updatedAt = changed ? Date.now() : entry.updatedAt;
    return buildClipboardText(
      { ...entry, content, title, updatedAt },
      settings,
    );
  }

  useEffect(() => {
    if (
      contentDraft === entry.content &&
      titleDraft === entry.title
    ) {
      return;
    }
    const id = window.setTimeout(() => {
      void flush();
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(id);
  }, [contentDraft, titleDraft, entry.content, entry.title, flush]);

  useEffect(() => {
    return () => {
      void flush();
    };
  }, [flush]);

  function handleBlur() {
    void flush();
  }

  const edited = entry.updatedAt > entry.createdAt;
  const rows = Math.max(2, contentDraft.split("\n").length);

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
        <div className="entry-actions">
          <DeleteButton onConfirm={() => void onDelete(entry.id)} />
          <CopyButton buildText={buildLiveCopyText} />
        </div>
      </div>
      <input
        type="text"
        className="entry-title"
        value={titleDraft}
        onChange={(e) => setTitleDraft(e.target.value)}
        onBlur={handleBlur}
        placeholder={t("entry.titlePlaceholder")}
        spellCheck={false}
      />
      <textarea
        className="entry-textarea"
        value={contentDraft}
        onChange={(e) => setContentDraft(e.target.value)}
        onBlur={handleBlur}
        rows={rows}
        spellCheck={false}
      />
    </div>
  );
}
