import { useState } from "react";
import type {
  Settings as SettingsType,
  TimestampFormat,
  CopyPosition,
} from "../lib/settings";
import { previewClipboardText } from "../lib/clipboard";

type Props = {
  settings: SettingsType;
  onSave: (s: SettingsType) => void;
  onClose: () => void;
};

export function SettingsPanel({ settings, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<SettingsType>(settings);

  function save() {
    onSave(draft);
    onClose();
  }

  return (
    <div className="settings-backdrop" onClick={onClose}>
      <div
        className="settings-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Settings"
      >
        <div className="settings-header">
          <h3>Settings</h3>
          <button
            className="copy-btn"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="settings-body">
          <div className="settings-row">
            <label className="settings-label" htmlFor="ts-format">
              Timestamp format
            </label>
            <select
              id="ts-format"
              value={draft.timestampFormat}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  timestampFormat: e.target.value as TimestampFormat,
                })
              }
            >
              <option value="local">Local — 2026-05-15 12:35:00</option>
              <option value="iso">ISO 8601 — 2026-05-15T04:35:00.000Z</option>
            </select>
          </div>

          <div className="settings-row">
            <label className="settings-label" htmlFor="custom-text">
              Custom text (appended to clipboard)
            </label>
            <textarea
              id="custom-text"
              value={draft.customText}
              onChange={(e) =>
                setDraft({ ...draft, customText: e.target.value })
              }
              placeholder="e.g. — from Perch"
              rows={3}
            />
          </div>

          <div className="settings-row">
            <span className="settings-label">Custom text position</span>
            <div className="settings-radio-group">
              <label>
                <input
                  type="radio"
                  name="custom-pos"
                  checked={draft.customPosition === "before"}
                  onChange={() =>
                    setDraft({
                      ...draft,
                      customPosition: "before" as CopyPosition,
                    })
                  }
                />
                Before content
              </label>
              <label>
                <input
                  type="radio"
                  name="custom-pos"
                  checked={draft.customPosition === "after"}
                  onChange={() =>
                    setDraft({
                      ...draft,
                      customPosition: "after" as CopyPosition,
                    })
                  }
                />
                After content
              </label>
            </div>
          </div>

          <div className="settings-preview">
            <div className="settings-preview-title">Clipboard preview</div>
            <pre className="settings-preview-text">
              {previewClipboardText(draft)}
            </pre>
          </div>
        </div>

        <div className="settings-footer">
          <button onClick={onClose} type="button">
            Cancel
          </button>
          <button onClick={save} type="button" className="primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
