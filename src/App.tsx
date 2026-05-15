import { useState, useEffect } from "react";
import type { Entry } from "./lib/types";
import { EntryList } from "./components/EntryList";
import { InputBar } from "./components/InputBar";
import { SettingsPanel } from "./components/Settings";
import { listEntries, insertEntry, updateEntry } from "./lib/db";
import {
  loadSettings,
  saveSettings,
  type Settings as SettingsType,
} from "./lib/settings";
import "./App.css";

function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsType>(() => loadSettings());
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

  async function handleUpdate(id: number, content: string) {
    try {
      const { updatedAt } = await updateEntry(id, content);
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, content, updatedAt } : e)),
      );
    } catch (e) {
      setError(String(e));
    }
  }

  function handleSaveSettings(next: SettingsType) {
    setSettings(next);
    saveSettings(next);
  }

  if (loading) {
    return (
      <div className="app">
        <div className="entry-list">
          <div className="entry-list-empty">Loading...</div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="app">
        <div className="entry-list">
          <div className="entry-list-empty">DB error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <button
        className="settings-trigger"
        onClick={() => setShowSettings(true)}
        type="button"
        title="Settings"
        aria-label="Open settings"
      >
        ⚙
      </button>
      <EntryList
        entries={entries}
        settings={settings}
        onUpdate={handleUpdate}
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
