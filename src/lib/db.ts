import Database from "@tauri-apps/plugin-sql";
import type { Entry } from "./types";

const DB_URL = "sqlite:perch.db";

let dbPromise: Promise<Database> | null = null;

function db(): Promise<Database> {
  if (!dbPromise) dbPromise = Database.load(DB_URL);
  return dbPromise;
}

type Row = {
  id: number;
  title: string;
  content: string;
  created_at: number;
  updated_at: number;
  pinned: number;
  sort_order: number;
};

function rowToEntry(r: Row): Entry {
  return {
    id: r.id,
    title: r.title,
    content: r.content,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    pinned: r.pinned === 1,
    sortOrder: r.sort_order,
  };
}

// Display order: pinned group on top; within each group, manual sort_order
// ascending, then newest first as a tiebreak (sort_order ties at 0 for
// never-dragged / freshly inserted rows). Keep in sync with listEntries'
// ORDER BY so App's optimistic in-memory updates match a reload from SQLite.
export function sortEntries(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return b.createdAt - a.createdAt;
  });
}

export async function listEntries(): Promise<Entry[]> {
  const conn = await db();
  const rows = await conn.select<Row[]>(
    "SELECT id, title, content, created_at, updated_at, pinned, sort_order FROM entries WHERE deleted_at IS NULL ORDER BY pinned DESC, sort_order ASC, created_at DESC",
  );
  return rows.map(rowToEntry);
}

export async function insertEntry(content: string): Promise<Entry> {
  const conn = await db();
  const now = Date.now();
  const result = await conn.execute(
    "INSERT INTO entries (content, title, created_at, updated_at, sort_order) VALUES ($1, '', $2, $3, 0)",
    [content, now, now],
  );
  return {
    id: Number(result.lastInsertId),
    title: "",
    content,
    createdAt: now,
    updatedAt: now,
    pinned: false,
    sortOrder: 0,
  };
}

export async function updateEntry(
  id: number,
  content: string,
  title: string,
): Promise<{ updatedAt: number }> {
  const conn = await db();
  const now = Date.now();
  await conn.execute(
    "UPDATE entries SET content = $1, title = $2, updated_at = $3 WHERE id = $4 AND deleted_at IS NULL",
    [content, title, now, id],
  );
  return { updatedAt: now };
}

export async function setPinned(id: number, pinned: boolean): Promise<void> {
  const conn = await db();
  await conn.execute(
    "UPDATE entries SET pinned = $1 WHERE id = $2 AND deleted_at IS NULL",
    [pinned ? 1 : 0, id],
  );
}

// Persist a section's manual order. `orderedIds` is one pin-group (all pinned
// or all unpinned) in its new top-to-bottom order; each row's sort_order is
// rewritten to its index. The two groups number independently from 0 — fine,
// since `pinned` is the primary sort key and sort_order only breaks ties
// within a group. N is small (personal notepad), so a per-row loop is fine.
export async function persistOrder(orderedIds: number[]): Promise<void> {
  const conn = await db();
  for (let i = 0; i < orderedIds.length; i++) {
    await conn.execute(
      "UPDATE entries SET sort_order = $1 WHERE id = $2 AND deleted_at IS NULL",
      [i, orderedIds[i]],
    );
  }
}

export async function deleteEntry(id: number): Promise<void> {
  const conn = await db();
  const now = Date.now();
  await conn.execute(
    "UPDATE entries SET deleted_at = $1 WHERE id = $2",
    [now, id],
  );
}
