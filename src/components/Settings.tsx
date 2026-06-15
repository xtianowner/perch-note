import { useState } from "react";
import { X, Minus, Plus, RotateCcw } from "lucide-react";
import type {
  Settings as SettingsType,
  TimestampFormat,
  CopyPosition,
} from "../lib/settings";
import {
  clampFontScale,
  FONT_SCALE_STEP,
  FONT_SCALE_DEFAULT,
  FONT_SCALE_MIN,
  FONT_SCALE_MAX,
} from "../lib/settings";
import { previewClipboardText } from "../lib/clipboard";
import { useT, setLang, type Lang } from "../lib/i18n";

type Props = {
  settings: SettingsType;
  fontScale: number;
  onSave: (s: SettingsType) => void;
  onFontScale: (v: number) => void;
  onClose: () => void;
};

export function SettingsPanel({
  settings,
  fontScale,
  onSave,
  onFontScale,
  onClose,
}: Props) {
  const t = useT();
  const [draft, setDraft] = useState<SettingsType>(settings);

  function patch(partial: Partial<SettingsType>) {
    const next = { ...draft, ...partial };
    setDraft(next);
    // live-apply language so preview / labels reflect immediately
    if (partial.lang && partial.lang !== draft.lang) {
      setLang(partial.lang);
    }
  }

  function save() {
    // fontScale is applied immediately (keyboard + stepper), so persist the
    // live committed value rather than the stale draft snapshot from open.
    onSave({ ...draft, fontScale });
    onClose();
  }

  function cancel() {
    // revert lang preview if user changed it but cancels
    if (draft.lang !== settings.lang) {
      setLang(settings.lang);
    }
    onClose();
  }

  return (
    <div className="settings-backdrop" onClick={cancel}>
      <div
        className="settings-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t("settings.title")}
      >
        <div className="settings-header">
          <h3>{t("settings.title")}</h3>
          <button
            className="icon-btn"
            onClick={cancel}
            type="button"
            aria-label={t("settings.close")}
          >
            <X size={14} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <div className="settings-body">
          <div className="settings-row">
            <label className="settings-label" htmlFor="lang">
              {t("settings.lang")}
            </label>
            <select
              id="lang"
              value={draft.lang}
              onChange={(e) => patch({ lang: e.target.value as Lang })}
            >
              <option value="en">{t("settings.lang.en")}</option>
              <option value="zh">{t("settings.lang.zh")}</option>
            </select>
          </div>

          <div className="settings-row">
            <span className="settings-label">{t("settings.fontSize")}</span>
            <div className="font-stepper">
              <button
                type="button"
                onClick={() =>
                  onFontScale(clampFontScale(fontScale - FONT_SCALE_STEP))
                }
                disabled={fontScale <= FONT_SCALE_MIN}
                aria-label={t("settings.fontSize.decrease")}
                title={t("settings.fontSize.decrease")}
              >
                <Minus size={14} strokeWidth={1.75} aria-hidden="true" />
              </button>
              <span className="font-stepper-value">
                {Math.round(fontScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() =>
                  onFontScale(clampFontScale(fontScale + FONT_SCALE_STEP))
                }
                disabled={fontScale >= FONT_SCALE_MAX}
                aria-label={t("settings.fontSize.increase")}
                title={t("settings.fontSize.increase")}
              >
                <Plus size={14} strokeWidth={1.75} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="font-stepper-reset"
                onClick={() => onFontScale(FONT_SCALE_DEFAULT)}
                disabled={fontScale === FONT_SCALE_DEFAULT}
                aria-label={t("settings.fontSize.reset")}
                title={t("settings.fontSize.reset")}
              >
                <RotateCcw size={13} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
            <span className="settings-hint">{t("settings.fontSize.hint")}</span>
          </div>

          <div className="settings-row">
            <label className="settings-label" htmlFor="ts-format">
              {t("settings.tsFormat")}
            </label>
            <select
              id="ts-format"
              value={draft.timestampFormat}
              onChange={(e) =>
                patch({ timestampFormat: e.target.value as TimestampFormat })
              }
            >
              <option value="local">{t("settings.tsFormat.local")}</option>
              <option value="iso">{t("settings.tsFormat.iso")}</option>
            </select>
          </div>

          <div className="settings-row">
            <label className="settings-label" htmlFor="custom-text">
              {t("settings.customText")}
            </label>
            <textarea
              id="custom-text"
              value={draft.customText}
              onChange={(e) => patch({ customText: e.target.value })}
              placeholder={t("settings.customText.placeholder")}
              rows={3}
            />
          </div>

          <div className="settings-row">
            <span className="settings-label">
              {t("settings.customPosition")}
            </span>
            <div className="settings-radio-group">
              <label>
                <input
                  type="radio"
                  name="custom-pos"
                  checked={draft.customPosition === "before"}
                  onChange={() =>
                    patch({ customPosition: "before" as CopyPosition })
                  }
                />
                {t("settings.customPosition.before")}
              </label>
              <label>
                <input
                  type="radio"
                  name="custom-pos"
                  checked={draft.customPosition === "after"}
                  onChange={() =>
                    patch({ customPosition: "after" as CopyPosition })
                  }
                />
                {t("settings.customPosition.after")}
              </label>
            </div>
          </div>

          <div className="settings-preview">
            <div className="settings-preview-title">
              {t("settings.preview")}
            </div>
            <pre className="settings-preview-text">
              {previewClipboardText(draft)}
            </pre>
          </div>
        </div>

        <div className="settings-footer">
          <button onClick={cancel} type="button">
            {t("settings.cancel")}
          </button>
          <button onClick={save} type="button" className="primary">
            {t("settings.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
