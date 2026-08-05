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
  /** Tables the app needs that aren't there yet. */
  missingTables: string[];
  missingColumns: string[];
  agentCount: number | null;
  listingCount: number | null;
  managers: string[];
  authSecretSet: boolean;
  error?: string;
};

const REQUIRED_TABLES = ["agents", "listings", "wishlists", "notifications"];

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
    missingTables: [...REQUIRED_TABLES],
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
      WHERE table_name IN ('agents', 'listings', 'wishlists', 'notifications')`;

    const present = new Set(cols.map((c) => c.table_name));
    base.missingTables = REQUIRED_TABLES.filter((t) => !present.has(t));

    const agentCols = cols
      .filter((c) => c.table_name === "agents")
      .map((c) => c.column_name);
    base.agentsTable = present.has("agents");
    base.listingsTable = present.has("listings");
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

    base.ok = base.missingTables.length === 0 && base.missingColumns.length === 0;
  } catch (err) {
    base.error = err instanceof Error ? err.message : String(err);
  } finally {
    await sql?.end().catch(() => {});
  }

  return base;
}

/**
 * Statements that bring a database up to the current Office Exclusives schema
 * without reading anything off disk. Every one is written to be safe to repeat.
 *
 * This exists because the migration files are plain .sql that nothing imports,
 * so they only reach the deployed function via build-time file tracing — and
 * if that ever fails, the migrator can't run at all. These statements need no
 * files, so the setup page keeps working regardless.
 */
const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS "agents" (
     "id" serial PRIMARY KEY NOT NULL,
     "name" text NOT NULL,
     "phone_lookup" text,
     "phone_hash" text DEFAULT '' NOT NULL,
     "phone_last4" text DEFAULT '' NOT NULL,
     "active" boolean DEFAULT true NOT NULL,
     "is_manager" boolean DEFAULT false NOT NULL,
     "created_at" timestamp DEFAULT now() NOT NULL
   )`,
  // For a table that predates these columns.
  `ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "phone_lookup" text`,
  `ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "phone_hash" text DEFAULT '' NOT NULL`,
  `ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "phone_last4" text DEFAULT '' NOT NULL`,
  `ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true NOT NULL`,
  `ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "is_manager" boolean DEFAULT false NOT NULL`,
  // Rows without a lookup key can't be signed in as, so they're unusable
  // leftovers; clearing them is what allows the NOT NULL below.
  `DELETE FROM "agents" WHERE "phone_lookup" IS NULL`,
  `ALTER TABLE "agents" ALTER COLUMN "phone_lookup" SET NOT NULL`,
  `DO $$ BEGIN
     ALTER TABLE "agents" ADD CONSTRAINT "agents_phone_lookup_unique" UNIQUE ("phone_lookup");
   EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL;
   END $$`,
  `ALTER TABLE "agents" DROP CONSTRAINT IF EXISTS "agents_name_unique"`,
  `CREATE TABLE IF NOT EXISTS "listings" (
     "id" serial PRIMARY KEY NOT NULL,
     "agent_id" integer NOT NULL,
     "image_url" text,
     "street_number" text NOT NULL,
     "street_name" text NOT NULL,
     "city" text NOT NULL,
     "state" text NOT NULL,
     "zip" text NOT NULL,
     "bedrooms" integer NOT NULL,
     "bathrooms" double precision NOT NULL,
     "square_feet" integer NOT NULL,
     "price" integer,
     "notes" text DEFAULT '' NOT NULL,
     "created_at" timestamp DEFAULT now() NOT NULL
   )`,
  `DO $$ BEGIN
     ALTER TABLE "listings" ADD CONSTRAINT "listings_agent_id_agents_id_fk"
       FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE;
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$`,
  `CREATE TABLE IF NOT EXISTS "wishlists" (
     "id" serial PRIMARY KEY NOT NULL,
     "agent_id" integer NOT NULL,
     "body" text NOT NULL,
     "created_at" timestamp DEFAULT now() NOT NULL
   )`,
  `DO $$ BEGIN
     ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_agent_id_agents_id_fk"
       FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE;
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$`,
  `CREATE TABLE IF NOT EXISTS "notifications" (
     "id" serial PRIMARY KEY NOT NULL,
     "kind" text NOT NULL,
     "title" text NOT NULL,
     "detail" text DEFAULT '' NOT NULL,
     "href" text DEFAULT '' NOT NULL,
     "entity_id" integer DEFAULT 0 NOT NULL,
     "created_at" timestamp DEFAULT now() NOT NULL,
     "read_at" timestamp
   )`,
  `DO $$ BEGIN
     ALTER TABLE "notifications" ADD CONSTRAINT "notifications_kind_entity_unique"
       UNIQUE ("kind", "entity_id");
   EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL;
   END $$`,
];

/**
 * Bring the database up to date.
 *
 * Prefers the real Drizzle migrator so the migration journal stays accurate,
 * and falls back to the file-free statements above if it can't run — which is
 * what matters in production, where the tables being absent is the whole
 * problem. Returns a note when the fallback was used so the UI can say so.
 */
export async function runMigrations(): Promise<{ note?: string }> {
  const client = connection();
  try {
    try {
      await migrate(drizzle(client), {
        migrationsFolder: path.join(process.cwd(), "drizzle"),
      });
      return {};
    } catch (migratorError) {
      const reason =
        migratorError instanceof Error
          ? migratorError.message
          : String(migratorError);

      for (const statement of SCHEMA_STATEMENTS) {
        await client.unsafe(statement);
      }
      return {
        note:
          "Applied directly, because the standard migration step couldn't run " +
          `(${reason}). The database is up to date either way.`,
      };
    }
  } finally {
    await client.end().catch(() => {});
  }
}
