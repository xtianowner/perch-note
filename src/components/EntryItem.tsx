import type { Entry } from "../lib/types";
import { formatRelative, formatAbsolute } from "../lib/time";
import { CopyButton } from "./CopyButton";

export function EntryItem({ entry }: { entry: Entry }) {
  return (
    <div className="entry-item">
      <div className="entry-header">
        <span className="entry-time" title={formatAbsolute(entry.createdAt)}>
          {formatRelative(entry.createdAt)}
        </span>
        <CopyButton text={entry.content} />
      </div>
      <div className="entry-content">{entry.content}</div>
    </div>
  );
}
