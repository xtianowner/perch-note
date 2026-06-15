import type { ReactNode, RefObject } from "react";

type Range = { start: number; end: number };

// Offsets (into `text`) of every occurrence of any whitespace-separated token
// in `query`, case-insensitive, with overlapping/adjacent hits merged.
function matchRanges(text: string, query: string): Range[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const hay = text.toLowerCase();
  const ranges: Range[] = [];
  for (const tok of tokens) {
    let from = 0;
    for (;;) {
      const idx = hay.indexOf(tok, from);
      if (idx === -1) break;
      ranges.push({ start: idx, end: idx + tok.length });
      from = idx + tok.length;
    }
  }
  if (ranges.length === 0) return [];
  ranges.sort((a, b) => a.start - b.start);
  const merged: Range[] = [{ ...ranges[0] }];
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1];
    if (ranges[i].start <= last.end) {
      last.end = Math.max(last.end, ranges[i].end);
    } else {
      merged.push({ ...ranges[i] });
    }
  }
  return merged;
}

/**
 * Split `text` into plain strings and <mark> spans for each query match, for
 * use as the highlight backdrop behind a transparent textarea/input. The first
 * <mark> takes `firstMarkRef` so callers can scroll it into view. With no
 * matches it returns the raw text unchanged.
 */
export function highlightNodes(
  text: string,
  query: string,
  firstMarkRef?: RefObject<HTMLElement | null>,
): ReactNode {
  const ranges = matchRanges(text, query);
  if (ranges.length === 0) return text;
  const out: ReactNode[] = [];
  let pos = 0;
  ranges.forEach((r, i) => {
    if (r.start > pos) out.push(text.slice(pos, r.start));
    out.push(
      <mark
        key={`m${i}`}
        ref={i === 0 ? firstMarkRef : undefined}
        className="search-mark"
      >
        {text.slice(r.start, r.end)}
      </mark>,
    );
    pos = r.end;
  });
  if (pos < text.length) out.push(text.slice(pos));
  return out;
}
