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
  content: string;
  created_at: number;
  updated_at: number;
};

function rowToEntry(r: Row): Entry {
  return {
    id: r.id,
    content: r.content,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function listEntries(): Promise<Entry[]> {
  const conn = await db();
  const rows = await conn.select<Row[]>(
    "SELECT id, content, created_at, updated_at FROM entries WHERE deleted_at IS NULL ORDER BY created_at DESC",
  );
  return rows.map(rowToEntry);
}

export async function insertEntry(content: string): Promise<Entry> {
  const conn = await db();
  const now = Date.now();
  const result = await conn.execute(
    "INSERT INTO entries (content, created_at, updated_at) VALUES ($1, $2, $3)",
    [content, now, now],
  );
  return {
    id: Number(result.lastInsertId),
    content,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateEntry(
  id: number,
  content: string,
): Promise<{ updatedAt: number }> {
  const conn = await db();
  const now = Date.now();
  await conn.execute(
    "UPDATE entries SET content = $1, updated_at = $2 WHERE id = $3",
    [content, now, id],
  );
  return { updatedAt: now };
}
