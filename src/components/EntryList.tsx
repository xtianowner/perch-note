import type { Entry } from "../lib/types";
import { EntryItem } from "./EntryItem";

export function EntryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return (
      <div className="entry-list">
        <div className="entry-list-empty">
          No entries yet. Type below and press Enter.
        </div>
      </div>
    );
  }
  return (
    <div className="entry-list">
      {entries.map((e) => (
        <EntryItem key={e.id} entry={e} />
      ))}
    </div>
  );
}
