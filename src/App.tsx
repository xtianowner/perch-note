import { useState, useEffect } from "react";
import type { Entry } from "./lib/types";
import { EntryList } from "./components/EntryList";
import { InputBar } from "./components/InputBar";
import { listEntries, insertEntry } from "./lib/db";
import "./App.css";

function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <EntryList entries={entries} />
      <InputBar onSubmit={addEntry} />
    </div>
  );
}

export default App;
