import { config } from "dotenv";
config({ path: ".env" });

import postgres from "postgres";
import bcrypt from "bcryptjs";
import { normalizePhone, phoneLookupKey } from "../phone";

/**
 * Read-only diagnostic for Office Exclusives sign-in problems.
 *
 *   npm run agents:check -- 8595551212
 *
 * Point POSTGRES_URL / AUTH_SECRET at whichever environment you're debugging.
 * Reports whether the table exists, how many agents are in it, and exactly
 * where a given phone number fails: not found, revoked, or hash mismatch.
 * Never prints or stores a phone number.
 */
async function main() {
  const phoneArg = process.argv.slice(2).find((a) => !a.startsWith("-"));
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error("POSTGRES_URL is not set.");

  console.log(
    `\nAUTH_SECRET: ${
      process.env.AUTH_SECRET
        ? `set (${process.env.AUTH_SECRET.length} chars)`
        : "✗ MISSING — sign-in keys cannot be computed"
    }`
  );

  const sql = postgres(url, { max: 1 });

  const cols = await sql<{ column_name: string }[]>`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'agents'`;
  if (cols.length === 0) {
    console.error(
      "\n✗ No `agents` table in this database.\n" +
        "  Run the migration first:  npm run db:migrate\n"
    );
    await sql.end();
    process.exit(1);
  }
  const names = cols.map((c) => c.column_name);
  console.log(`agents table: present (${names.length} columns)`);
  for (const required of ["phone_lookup", "is_manager"]) {
    if (!names.includes(required)) {
      console.error(
        `\n✗ Column "${required}" is missing — this database is behind the code.\n` +
          "  Run:  npm run db:migrate\n"
      );
      await sql.end();
      process.exit(1);
    }
  }

  const [{ count }] = await sql<{ count: number }[]>`
    SELECT count(*)::int AS count FROM agents`;
  console.log(`agents rows: ${count}`);
  if (count === 0) {
    console.error(
      "\n✗ The roster is empty — nobody can sign in.\n" +
        '  Run:  npm run agents:import -- "roster.csv"\n'
    );
    await sql.end();
    process.exit(1);
  }

  const managers = await sql<{ name: string }[]>`
    SELECT name FROM agents WHERE is_manager`;
  console.log(
    `managers: ${managers.length ? managers.map((m) => m.name).join(", ") : "none"}`
  );

  if (phoneArg) {
    const phone = normalizePhone(phoneArg);
    const rows = await sql<
      { id: number; name: string; active: boolean; phone_hash: string }[]
    >`SELECT id, name, active, phone_hash FROM agents
      WHERE phone_lookup = ${phoneLookupKey(phone)} LIMIT 1`;

    console.log(`\nlooking up •••••${phone.slice(-4)}`);
    if (rows.length === 0) {
      console.error(
        "  ✗ No agent has that number under this AUTH_SECRET.\n" +
          "    Either the number isn't in the roster, or the agents were\n" +
          "    imported with a different AUTH_SECRET than this one.\n" +
          "    Fix: confirm AUTH_SECRET, then re-run the import with --replace.\n"
      );
    } else {
      const a = rows[0];
      const ok = bcrypt.compareSync(phone, a.phone_hash);
      console.log(`  ✓ matched: ${a.name}`);
      console.log(`  active: ${a.active ? "yes" : "✗ no — access revoked"}`);
      console.log(`  password check: ${ok ? "✓ passes" : "✗ FAILS"}`);
      console.log(
        `\n  ${
          ok && a.active
            ? "This number can sign in."
            : "This number cannot sign in — see above."
        }\n`
      );
    }
  } else {
    console.log("\n(pass a phone number to test one, e.g. -- 8595551212)\n");
  }

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
