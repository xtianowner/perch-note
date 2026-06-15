import { useState, useEffect, useRef, useCallback } from "react";
import { Check, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Entry } from "../lib/types";
import type { Settings } from "../lib/settings";
import { formatRelative, formatAbsolute, formatAbsoluteShort } from "../lib/time";
import { buildClipboardText } from "../lib/clipboard";
import { highlightNodes } from "../lib/highlight";
import { useT } from "../lib/i18n";
import { CopyButton } from "./CopyButton";
import { DeleteButton } from "./DeleteButton";
import { PinButton } from "./PinButton";

const AUTOSAVE_DELAY_MS = 15_000;

type Props = {
  entry: Entry;
  settings: Settings;
  dndDisabled?: boolean;
  highlightQuery?: string;
  onUpdate: (id: number, content: string, title: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onPin: (id: number, pinned: boolean) => Promise<void>;
};

export function EntryItem({
  entry,
  settings,
  dndDisabled,
  highlightQuery,
  onUpdate,
  onDelete,
  onPin,
}: Props) {
  const t = useT();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id, disabled: dndDisabled });
  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const [contentDraft, setContentDraft] = useState(entry.content);
  const [titleDraft, setTitleDraft] = useState(entry.title);
  const [savedFlash, setSavedFlash] = useState(false);
  // During an active search, show content as a highlighted read-only view
  // (highlights drawn ON the real text → no overlay alignment to get wrong);
  // clicking it switches to the editable textarea.
  const [editing, setEditing] = useState(false);

  const contentRef = useRef(contentDraft);
  contentRef.current = contentDraft;
  const titleRef = useRef(titleDraft);
  titleRef.current = titleDraft;
  const persistedContentRef = useRef(entry.content);
  const persistedTitleRef = useRef(entry.title);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const idRef = useRef(entry.id);
  idRef.current = entry.id;
  const deletedRef = useRef(false);
  const inflightRef = useRef<Promise<void> | null>(null);
  // Search filtering can unmount an actively-edited item (its flush still runs
  // on unmount to persist). Guard the post-write savedFlash UI so it doesn't
  // setState / leak a timer after unmount.
  const mountedRef = useRef(true);
  const flashTimerRef = useRef<number | null>(null);
  // Search highlight read-view + the editable textarea it toggles to.
  const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const viewRef = useRef<HTMLDivElement | null>(null);
  const firstMarkRef = useRef<HTMLElement | null>(null);

  const flush = useCallback(async () => {
    if (deletedRef.current) return;
    if (inflightRef.current) {
      await inflightRef.current;
    }
    if (deletedRef.current) return;
    const c = contentRef.current;
    const tt = titleRef.current;
    if (c === persistedContentRef.current && tt === persistedTitleRef.current) {
      return;
    }
    const p = (async () => {
      await onUpdateRef.current(idRef.current, c, tt);
      persistedContentRef.current = c;
      persistedTitleRef.current = tt;
      if (!mountedRef.current) return;
      setSavedFlash(true);
      flashTimerRef.current = window.setTimeout(() => {
        if (mountedRef.current) setSavedFlash(false);
        flashTimerRef.current = null;
      }, 1500);
    })();
    inflightRef.current = p;
    try {
      await p;
    } finally {
      if (inflightRef.current === p) inflightRef.current = null;
    }
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
      contentDraft === persistedContentRef.current &&
      titleDraft === persistedTitleRef.current
    ) {
      return;
    }
    const id = window.setTimeout(() => {
      void flush();
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(id);
  }, [contentDraft, titleDraft, flush]);

  useEffect(() => {
    return () => {
      if (deletedRef.current) return;
      if (
        contentRef.current === persistedContentRef.current &&
        titleRef.current === persistedTitleRef.current
      ) {
        return;
      }
      void flush();
    };
  }, [flush]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (flashTimerRef.current !== null) clearTimeout(flashTimerRef.current);
    };
  }, []);

  function handleBlur() {
    void flush();
    setEditing(false);
  }

  const showHighlightView = !!highlightQuery && !editing;

  // Any change to the search query drops back to the read-view (so a fresh
  // search always shows highlights, even if the card was mid-edit).
  useEffect(() => {
    setEditing(false);
  }, [highlightQuery]);

  // Scroll the read-view to its first match when the search changes.
  useEffect(() => {
    if (!showHighlightView) return;
    const view = viewRef.current;
    const mk = firstMarkRef.current;
    if (!view || !mk) return;
    view.scrollTop = Math.max(0, mk.offsetTop - 8);
  }, [showHighlightView, highlightQuery, contentDraft]);

  // Focus the textarea right after a click switches the read-view to edit.
  useEffect(() => {
    if (editing) contentTextareaRef.current?.focus();
  }, [editing]);

  const edited = entry.updatedAt > entry.createdAt;
  const timeTooltip = edited
    ? `${t("entry.modifiedAt", { t: formatAbsolute(entry.updatedAt) })}\n` +
      t("entry.createdAt", { t: formatAbsolute(entry.createdAt) })
    : t("entry.createdAt", { t: formatAbsolute(entry.createdAt) });
  const rows = Math.max(2, contentDraft.split("\n").length);

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={`entry-item${entry.pinned ? " is-pinned" : ""}${isDragging ? " is-dragging" : ""}`}
    >
      <div className="entry-header">
        <div className="entry-header-left">
          {!dndDisabled && (
            <button
              type="button"
              className="drag-handle"
              aria-label={t("entry.drag")}
              title={t("entry.drag")}
              {...attributes}
              {...listeners}
            >
              <GripVertical size={14} strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
          <span className="entry-time" title={timeTooltip}>
            {formatAbsoluteShort(entry.updatedAt, settings.timestampFormat)}
            <span className="entry-time-rel">
              {" · "}
              {formatRelative(entry.updatedAt)}
            </span>
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
        </div>
        <div className="entry-actions">
          <PinButton
            pinned={entry.pinned}
            onToggle={() => {
              // Toggling pin moves this card between the pinned/others drag
              // subtrees, which remounts EntryItem fresh from entry.content.
              // Flush the live draft first so the remount initializes from the
              // current text — otherwise unsaved on-screen edits visually drop
              // (data is safe; this is the visual fix). flush() no-ops when
              // nothing changed, so pinning stays instant in the common case.
              void (async () => {
                await flush();
                await onPin(entry.id, !entry.pinned);
              })();
            }}
          />
          <DeleteButton
            onConfirm={() => {
              deletedRef.current = true;
              void onDelete(entry.id);
            }}
          />
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
      {showHighlightView ? (
        <div
          ref={viewRef}
          className="entry-content-view"
          onMouseDown={() => setEditing(true)}
          title={t("entry.editHint")}
        >
          {highlightNodes(contentDraft, highlightQuery, firstMarkRef)}
        </div>
      ) : (
        <textarea
          ref={contentTextareaRef}
          className="entry-textarea"
          value={contentDraft}
          onChange={(e) => setContentDraft(e.target.value)}
          onBlur={handleBlur}
          rows={rows}
          spellCheck={false}
        />
      )}
    </div>
  );
}
