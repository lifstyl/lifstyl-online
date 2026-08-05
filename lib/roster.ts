/**
 * Parsing for the agent roster spreadsheets ("Name,Phone" per line).
 * Pure string handling with no filesystem access, so the same logic backs both
 * the CLI importer and the browser upload in the admin panel.
 */

import { normalizePhone } from "./phone";

export type RosterEntry = { name: string; phone: string };

export type RosterParseResult = {
  entries: RosterEntry[];
  /** Blank rows, headers, and the stray row-count line sheets end with. */
  skipped: string[];
  /** Same number on two different people — must be fixed before importing. */
  duplicates: string[];
};

export function parseRoster(sources: string[]): RosterParseResult {
  const rows: RosterEntry[] = [];
  const skipped: string[] = [];

  for (const text of sources) {
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) continue;

      // Split on the LAST comma so names containing commas survive.
      const idx = line.lastIndexOf(",");
      if (idx < 0) {
        skipped.push(line);
        continue;
      }

      const name = line
        .slice(0, idx)
        .trim()
        .replace(/^"|"$/g, "")
        .trim();
      const phone = normalizePhone(line.slice(idx + 1));

      if (!name || !phone || phone.length < 7 || /^name$/i.test(name)) {
        skipped.push(line);
        continue;
      }
      rows.push({ name, phone });
    }
  }

  const seen = new Map<string, RosterEntry>();
  const duplicates: string[] = [];
  for (const row of rows) {
    const prior = seen.get(row.phone);
    if (prior) {
      duplicates.push(`${row.phone} → "${prior.name}" and "${row.name}"`);
      continue;
    }
    seen.set(row.phone, row);
  }

  return { entries: [...seen.values()], skipped, duplicates };
}
