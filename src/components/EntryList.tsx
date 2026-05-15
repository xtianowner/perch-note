import type { Entry } from "../lib/types";
import type { Settings } from "../lib/settings";
import { EntryItem } from "./EntryItem";
import { useT } from "../lib/i18n";

type Props = {
  entries: Entry[];
  settings: Settings;
  onUpdate: (id: number, content: string, title: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export function EntryList({ entries, settings, onUpdate, onDelete }: Props) {
  const t = useT();
  if (entries.length === 0) {
    return (
      <div className="entry-list">
        <div className="entry-list-empty">{t("list.empty")}</div>
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
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
