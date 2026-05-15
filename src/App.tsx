import { useState } from "react";
import type { Entry } from "./lib/types";
import { EntryList } from "./components/EntryList";
import { InputBar } from "./components/InputBar";
import "./App.css";

function App() {
  const [entries, setEntries] = useState<Entry[]>([]);

  function addEntry(content: string) {
    const now = Date.now();
    setEntries((prev) => [
      { id: now, content, createdAt: now, updatedAt: now },
      ...prev,
    ]);
  }

  return (
    <div className="app">
      <EntryList entries={entries} />
      <InputBar onSubmit={addEntry} />
    </div>
  );
}

export default App;
