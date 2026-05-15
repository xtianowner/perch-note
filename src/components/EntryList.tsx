import type { Entry } from "../lib/types";
import type { Settings } from "../lib/settings";
import { EntryItem } from "./EntryItem";

type Props = {
  entries: Entry[];
  settings: Settings;
  onUpdate: (id: number, content: string) => Promise<void>;
};

export function EntryList({ entries, settings, onUpdate }: Props) {
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
        <EntryItem
          key={e.id}
          entry={e}
          settings={settings}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
