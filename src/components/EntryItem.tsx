import { useState, type KeyboardEvent } from "react";
import type { Entry } from "../lib/types";
import type { Settings } from "../lib/settings";
import { formatRelative, formatAbsolute } from "../lib/time";
import { CopyButton } from "./CopyButton";

type Props = {
  entry: Entry;
  settings: Settings;
  onUpdate: (id: number, content: string) => Promise<void>;
};

export function EntryItem({ entry, settings, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.content);

  function startEdit() {
    setDraft(entry.content);
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(entry.content);
    setEditing(false);
  }

  async function saveEdit() {
    const next = draft.trim();
    if (!next) {
      cancelEdit();
      return;
    }
    if (next === entry.content) {
      setEditing(false);
      return;
    }
    await onUpdate(entry.id, next);
    setEditing(false);
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
      return;
    }
    if (
      e.key === "Enter" &&
      (e.metaKey || e.ctrlKey) &&
      !e.nativeEvent.isComposing
    ) {
      e.preventDefault();
      saveEdit();
    }
  }

  const edited = entry.updatedAt > entry.createdAt;
  const headerTs = formatAbsolute(entry.updatedAt);

  return (
    <div className={`entry-item${editing ? " entry-editing" : ""}`}>
      <div className="entry-header">
        <span className="entry-time" title={headerTs}>
          {formatRelative(entry.updatedAt)}
          {edited && <span className="entry-edited-mark"> (edited)</span>}
        </span>
        <div className="entry-actions">
          {!editing && (
            <button
              className="copy-btn"
              onClick={startEdit}
              type="button"
              title="Edit (or double-click content)"
            >
              edit
            </button>
          )}
          <CopyButton entry={entry} settings={settings} />
        </div>
      </div>

      {editing ? (
        <>
          <textarea
            className="entry-edit-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            autoFocus
            rows={Math.max(2, draft.split("\n").length)}
          />
          <div className="entry-edit-hint">
            <button
              className="copy-btn"
              onClick={saveEdit}
              type="button"
            >
              save
            </button>
            <button
              className="copy-btn"
              onClick={cancelEdit}
              type="button"
            >
              cancel
            </button>
            <span className="entry-edit-keys">
              Cmd/Ctrl+Enter to save · Esc to cancel
            </span>
          </div>
        </>
      ) : (
        <div
          className="entry-content"
          onDoubleClick={startEdit}
          title="Double-click to edit"
        >
          {entry.content}
        </div>
      )}
    </div>
  );
}
