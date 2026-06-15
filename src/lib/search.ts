import type { Entry } from "./types";

/**
 * Search match: every whitespace-separated token in `query` must appear in
 * `text` as a case-insensitive substring (contains). Tokens are AND-combined.
 * Empty/whitespace query matches everything.
 *
 * NOTE: deliberately substring, not subsequence. Subsequence "fuzzy" matching
 * is far too loose for mixed CJK/Latin notes — short queries like "todo"/"sub"
 * match almost every entry as an in-order subsequence, so the filter stops
 * narrowing anything. Contains is what users expect from a notepad search.
 */
export function fuzzyMatch(query: string, text: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = text.toLowerCase();
  return q.split(/\s+/).every((token) => hay.includes(token));
}

export function entryMatches(query: string, entry: Entry): boolean {
  return fuzzyMatch(query, `${entry.title}\n${entry.content}`);
}
