import "server-only";
import path from "path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

/**
 * Database maintenance run from inside the app rather than a laptop.
 *
 * Vercel marks env vars as "Sensitive", which makes them unreadable — even
 * `vercel env pull` returns the literal string "[SENSITIVE]". So the database
 * URL and AUTH_SECRET can't be fetched locally to run migrations or the roster
 * import against production. Here on the server they're already correct.
 */

function connection() {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error("POSTGRES_URL is not configured on the server.");
  return postgres(url, { max: 1 });
}

export type DbStatus = {
  ok: boolean;
  agentsTable: boolean;
  listingsTable: boolean;
  missingColumns: string[];
  agentCount: number | null;
  listingCount: number | null;
  managers: string[];
  authSecretSet: boolean;
  error?: string;
};

const REQUIRED_AGENT_COLUMNS = [
  "id",
  "name",
  "phone_lookup",
  "phone_hash",
  "phone_last4",
  "active",
  "is_manager",
];

export async function getDbStatus(): Promise<DbStatus> {
  const base: DbStatus = {
    ok: false,
    agentsTable: false,
    listingsTable: false,
    missingColumns: [],
    agentCount: null,
    listingCount: null,
    managers: [],
    authSecretSet: !!process.env.AUTH_SECRET,
  };

  let sql: ReturnType<typeof postgres> | null = null;
  try {
    sql = connection();

    const cols = await sql<{ table_name: string; column_name: string }[]>`
      SELECT table_name, column_name FROM information_schema.columns
      WHERE table_name IN ('agents', 'listings')`;

    const agentCols = cols
      .filter((c) => c.table_name === "agents")
      .map((c) => c.column_name);
    base.agentsTable = agentCols.length > 0;
    base.listingsTable = cols.some((c) => c.table_name === "listings");
    base.missingColumns = base.agentsTable
      ? REQUIRED_AGENT_COLUMNS.filter((c) => !agentCols.includes(c))
      : [];

    if (base.agentsTable && base.missingColumns.length === 0) {
      const [{ count }] = await sql<{ count: number }[]>`
        SELECT count(*)::int AS count FROM agents`;
      base.agentCount = count;
      const mgr = await sql<{ name: string }[]>`
        SELECT name FROM agents WHERE is_manager ORDER BY name`;
      base.managers = mgr.map((m) => m.name);
    }
    if (base.listingsTable) {
      const [{ count }] = await sql<{ count: number }[]>`
        SELECT count(*)::int AS count FROM listings`;
      base.listingCount = count;
    }

    base.ok =
      base.agentsTable && base.listingsTable && base.missingColumns.length === 0;
  } catch (err) {
    base.error = err instanceof Error ? err.message : String(err);
  } finally {
    await sql?.end().catch(() => {});
  }

  return base;
}

/**
 * Apply any pending Drizzle migrations. The SQL files are bundled into this
 * route by `outputFileTracingIncludes` in next.config.mjs.
 */
export async function runMigrations(): Promise<void> {
  const client = connection();
  try {
    await migrate(drizzle(client), {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
    });
  } finally {
    await client.end().catch(() => {});
  }
}
