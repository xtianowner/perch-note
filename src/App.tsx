import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Search as SearchIcon } from "lucide-react";
import type { Entry } from "./lib/types";
import { EntryList } from "./components/EntryList";
import { InputBar } from "./components/InputBar";
import { SearchBar } from "./components/SearchBar";
import { SettingsPanel } from "./components/Settings";
import {
  listEntries,
  insertEntry,
  updateEntry,
  deleteEntry,
  setPinned,
  sortEntries,
  persistOrder,
} from "./lib/db";
import {
  loadSettings,
  saveSettings,
  clampFontScale,
  FONT_SCALE_STEP,
  FONT_SCALE_DEFAULT,
  type Settings as SettingsType,
} from "./lib/settings";
import { entryMatches } from "./lib/search";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    listEntries()
      .then(setEntries)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  // Drive the font zoom from :root (<html>), NOT a descendant. The --fs-*
  // tokens are `calc(..px * var(--text-scale))` declared on :root, so they're
  // resolved there; setting --text-scale on a child wouldn't re-resolve them.
  // (macOS doesn't zoom Tauri webviews natively, hence the CSS-var approach.)
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--text-scale",
      String(settings.fontScale),
    );
  }, [settings.fontScale]);

  async function addEntry(content: string) {
    try {
      const entry = await insertEntry(content);
      setEntries((prev) => sortEntries([entry, ...prev]));
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

  async function handlePin(id: number, pinned: boolean) {
    try {
      await setPinned(id, pinned);
      setEntries((prev) =>
        sortEntries(prev.map((e) => (e.id === id ? { ...e, pinned } : e))),
      );
    } catch (e) {
      setError(String(e));
    }
  }

  async function handleReorder(orderedIds: number[]) {
    try {
      await persistOrder(orderedIds);
      const orderMap = new Map(orderedIds.map((id, i) => [id, i]));
      setEntries((prev) =>
        sortEntries(
          prev.map((e) =>
            orderMap.has(e.id) ? { ...e, sortOrder: orderMap.get(e.id)! } : e,
          ),
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

  // Font zoom is applied + persisted immediately (no draft/save cycle), so
  // ⌘+/− and the settings stepper share one path.
  function setFontScale(scale: number) {
    setSettings((s) => {
      const next = { ...s, fontScale: clampFontScale(scale) };
      saveSettings(next);
      return next;
    });
  }

  function adjustFontScale(delta: number) {
    setSettings((s) => {
      const next = { ...s, fontScale: clampFontScale(s.fontScale + delta) };
      saveSettings(next);
      return next;
    });
  }

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
  }

  // Global shortcuts: ⌘F search, ⌘+/⌘-/⌘0 font zoom (macOS doesn't zoom Tauri
  // webviews natively), Esc to dismiss search. setFontScale/adjustFontScale use
  // functional updates, so the deps-light effect never reads stale scale.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === "f" || e.key === "F")) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (mod && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        adjustFontScale(FONT_SCALE_STEP);
      } else if (mod && (e.key === "-" || e.key === "_")) {
        e.preventDefault();
        adjustFontScale(-FONT_SCALE_STEP);
      } else if (mod && e.key === "0") {
        e.preventDefault();
        setFontScale(FONT_SCALE_DEFAULT);
      } else if (e.key === "Escape" && searchOpen) {
        closeSearch();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen]);

  if (loading) {
    return (
      <div className="app">
        <div className="entry-list">
          <div className="entry-list-empty">{t("app.loading")}</div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="app">
        <div className="entry-list">
          <div className="entry-list-empty">
            {t("app.dbError", { msg: error })}
          </div>
        </div>
      </div>
    );
  }

  const q = query.trim();
  const visibleEntries = q ? entries.filter((e) => entryMatches(q, e)) : entries;
  const n = entries.length;
  const countLabel = n === 1 ? t("app.count.one") : t("app.count", { n });

  return (
    <div className="app">
      <div className="app-topbar">
        {searchOpen ? (
          <SearchBar
            value={query}
            onChange={setQuery}
            count={visibleEntries.length}
            onClose={closeSearch}
          />
        ) : (
          <>
            <span className="entry-count">{countLabel}</span>
            <div className="topbar-actions">
              <button
                className="settings-trigger"
                onClick={() => setSearchOpen(true)}
                type="button"
                title={t("search.open")}
                aria-label={t("search.open")}
              >
                <SearchIcon size={15} strokeWidth={1.75} aria-hidden="true" />
              </button>
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
          </>
        )}
      </div>
      <EntryList
        entries={visibleEntries}
        settings={settings}
        searchActive={q.length > 0}
        highlightQuery={q}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onPin={handlePin}
        onReorder={handleReorder}
      />
      <InputBar onSubmit={addEntry} />
      {showSettings && (
        <SettingsPanel
          settings={settings}
          fontScale={settings.fontScale}
          onSave={handleSaveSettings}
          onFontScale={setFontScale}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
