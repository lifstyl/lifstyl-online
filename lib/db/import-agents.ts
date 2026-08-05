import { config } from "dotenv";
config({ path: ".env" });

import { drizzle } from "drizzle-orm/postgres-js";
import { eq, sql } from "drizzle-orm";
import postgres from "postgres";
import { readFileSync } from "fs";
import bcrypt from "bcryptjs";
import * as schema from "./schema";
import { normalizePhone, phoneLookupKey } from "../phone";

/**
 * Import Office Exclusives agents from CSV files of "Name,Phone".
 *
 *   npm run agents:import -- "path/to/roster.csv" ["another-sheet.csv" ...]
 *
 * Google Sheets exports one sheet per CSV, so a workbook with several tabs
 * needs each tab passed as its own file — they're all merged into one roster.
 *
 * Safe to re-run: an existing agent (matched on phone number) has their name
 * refreshed rather than being duplicated, and their listings are untouched.
 * Agents already in the database but absent from the CSV are left alone.
 *
 * Set MANAGER_PHONE to grant one agent management of every listing:
 *   MANAGER_PHONE=8595551212 npm run agents:import -- roster.csv
 *
 * Pass --replace to clear the agent table first. Needed if a previous import
 * ran with a different AUTH_SECRET: the stored lookup keys would be derived
 * from the wrong pepper, so nobody could sign in, and a plain re-run would
 * add a second copy of everyone rather than repair them (rows are matched by
 * that same key). WARNING: removing agents also removes their listings.
 */
async function main() {
  const args = process.argv.slice(2);
  const replace = args.includes("--replace");
  const files = args.filter((a) => !a.startsWith("-"));
  if (files.length === 0) {
    console.error(
      'Usage: npm run agents:import -- "roster.csv" ["second-sheet.csv" ...]'
    );
    process.exit(1);
  }

  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error("POSTGRES_URL is not set.");
  if (!process.env.AUTH_SECRET) {
    throw new Error(
      "AUTH_SECRET is not set — it peppers the phone lookup keys, so importing without it would produce keys that don't match at sign-in."
    );
  }

  const managerPhone = normalizePhone(process.env.MANAGER_PHONE ?? "");

  // ── Parse every file into one roster ──────────────────────
  type Row = { name: string; phone: string; source: string };
  const rows: Row[] = [];
  const skipped: string[] = [];

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) continue;
      // Split on the LAST comma so names containing commas survive.
      const idx = line.lastIndexOf(",");
      if (idx < 0) {
        skipped.push(`${file}: ${line}`);
        continue;
      }
      const name = line
        .slice(0, idx)
        .trim()
        .replace(/^"|"$/g, "")
        .trim();
      const phone = normalizePhone(line.slice(idx + 1));
      // Skips header rows and the stray row-count line at the end of the sheet.
      if (!name || !phone || phone.length < 7 || /^name$/i.test(name)) {
        skipped.push(`${file}: ${line}`);
        continue;
      }
      rows.push({ name, phone, source: file });
    }
  }

  // ── Reject duplicate numbers before touching the database ──
  const seen = new Map<string, Row>();
  const duplicates: string[] = [];
  for (const row of rows) {
    const prior = seen.get(row.phone);
    if (prior) {
      duplicates.push(`${row.phone} → "${prior.name}" and "${row.name}"`);
      continue;
    }
    seen.set(row.phone, row);
  }
  if (duplicates.length) {
    console.error(
      "\n✗ The roster has the same phone number on more than one agent.\n" +
        "  Phone numbers are the password, so each must be unique:\n" +
        duplicates.map((d) => `    ${d}`).join("\n") +
        "\n  Fix these in the spreadsheet and re-run.\n"
    );
    process.exit(1);
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });
  const { agents } = schema;

  if (replace) {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(agents);
    await db.delete(agents);
    console.log(`\n⚠ --replace: cleared ${count} existing agent row(s).`);
  }

  const existing = await db.select().from(agents);
  const byLookup = new Map(existing.map((a) => [a.phoneLookup, a]));

  // A populated table where nothing matches usually means the stored keys were
  // built with a different AUTH_SECRET — importing over it would duplicate
  // everyone instead of fixing them, so stop and explain.
  if (!replace && existing.length > 0) {
    const anyMatch = [...seen.values()].some((r) =>
      byLookup.has(phoneLookupKey(r.phone))
    );
    if (!anyMatch) {
      console.error(
        `\n✗ ${existing.length} agent(s) are already in this database, but none ` +
          `match the roster.\n` +
          `  That almost always means they were imported with a different ` +
          `AUTH_SECRET,\n  so their sign-in keys are unusable.\n\n` +
          `  Check AUTH_SECRET matches this environment, then re-run with ` +
          `--replace to rebuild:\n    npm run agents:import -- --replace "file.csv"\n`
      );
      await client.end();
      process.exit(1);
    }
  }

  let added = 0;
  let updated = 0;
  let manager: string | null = null;

  for (const row of seen.values()) {
    const lookup = phoneLookupKey(row.phone);
    const isManager = !!managerPhone && row.phone === managerPhone;
    if (isManager) manager = row.name;

    const match = byLookup.get(lookup);
    if (match) {
      await db
        .update(agents)
        .set({
          name: row.name,
          phoneLast4: row.phone.slice(-4),
          ...(isManager ? { isManager: true } : {}),
        })
        .where(eq(agents.id, match.id));
      updated++;
    } else {
      await db.insert(agents).values({
        name: row.name,
        phoneLookup: lookup,
        phoneHash: bcrypt.hashSync(row.phone, 10),
        phoneLast4: row.phone.slice(-4),
        isManager,
      });
      added++;
    }
  }

  console.log(`\n✓ Imported from ${files.length} file(s).`);
  console.log(`  ${added} agent(s) added, ${updated} already existed (name refreshed).`);
  console.log(`  ${seen.size} unique agent(s) in the roster.`);
  if (manager) console.log(`  Manager: ${manager} (can manage every listing).`);
  else if (managerPhone)
    console.log(`  ⚠ MANAGER_PHONE ${managerPhone} was not found in the roster.`);
  if (skipped.length) {
    console.log(`  Skipped ${skipped.length} non-data line(s):`);
    skipped.forEach((s) => console.log(`    ${s}`));
  }
  console.log("");

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
