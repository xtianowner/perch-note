import { useState, useEffect } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import type { Entry } from "./lib/types";
import { EntryList } from "./components/EntryList";
import { InputBar } from "./components/InputBar";
import { SettingsPanel } from "./components/Settings";
import {
  listEntries,
  insertEntry,
  updateEntry,
  deleteEntry,
} from "./lib/db";
import {
  loadSettings,
  saveSettings,
  type Settings as SettingsType,
} from "./lib/settings";
import { setLang, useT } from "./lib/i18n";
import "./App.css";

function App() {
  const t = useT();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsType>(() => {
    const s = loadSettings();
    setLang(s.lang);
    return s;
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    listEntries()
      .then(setEntries)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  async function addEntry(content: string) {
    try {
      const entry = await insertEntry(content);
      setEntries((prev) => [entry, ...prev]);
    } catch (e) {
      setError(String(e));
    }
  }

  async function handleUpdate(id: number, content: string, title: string) {
    try {
      const { updatedAt } = await updateEntry(id, content, title);
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, content, title, updatedAt } : e,
        ),
      );
    } catch (e) {
      setError(String(e));
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      setError(String(e));
    }
  }

  function handleSaveSettings(next: SettingsType) {
    setSettings(next);
    saveSettings(next);
    setLang(next.lang);
  }

  if (loading) {
    return (
      <div className="app" data-text-size={settings.textSize}>
        <div className="entry-list">
          <div className="entry-list-empty">{t("app.loading")}</div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="app" data-text-size={settings.textSize}>
        <div className="entry-list">
          <div className="entry-list-empty">
            {t("app.dbError", { msg: error })}
          </div>
        </div>
      </div>
    );
  }

  const n = entries.length;
  const countLabel = n === 1 ? t("app.count.one") : t("app.count", { n });

  return (
    <div className="app" data-text-size={settings.textSize}>
      <div className="app-topbar">
        <span className="entry-count">{countLabel}</span>
        <button
          className="settings-trigger"
          onClick={() => setShowSettings(true)}
          type="button"
          title={t("settings.title")}
          aria-label={t("settings.open")}
        >
          <SettingsIcon size={15} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
      <EntryList
        entries={entries}
        settings={settings}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
      <InputBar onSubmit={addEntry} />
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
