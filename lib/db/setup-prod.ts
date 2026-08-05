import { config } from "dotenv";
import { existsSync } from "fs";
import { execFileSync } from "child_process";
import path from "path";

/**
 * One-command production setup for the Office Exclusives roster.
 *
 *   npm run prod:agents
 *
 * Reads the real production credentials from `.env.production.local`, which
 * `vercel env pull` writes for you — so nobody has to copy long secrets by
 * hand, which is the step that silently breaks sign-in when a character is
 * missed.
 *
 * Everything it does is safe to repeat: the migration only adds missing
 * tables/columns, and the import matches agents on phone number so re-running
 * refreshes them instead of creating duplicates.
 */

const ENV_FILE = ".env.production.local";

const ROSTER_FILES = [
  "/Users/kushrathod/Downloads/For Lifstyl.Online Office Exclusives Database - Lifstyl-Flagship.csv",
  "/Users/kushrathod/Downloads/For Lifstyl.Online Office Exclusives Database - Lifstyl-Georgetown.csv",
];

const MANAGER_PHONE = "8599485512"; // Kush Rathod

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

function run(script: string, args: string[], env: Record<string, string>) {
  execFileSync("npx", ["tsx", script, ...args], {
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
}

function main() {
  console.log("\n─── Lifstyl production setup ───\n");

  // Pull the credentials ourselves, always from the production environment.
  // `vercel env pull` defaults to *development*, which on this project holds
  // no values (everything is scoped to Production and Preview) — that silently
  // points the migration at the wrong place, which is exactly how the live
  // database ended up missing columns the app expects.
  console.log("Fetching production settings from Vercel…");
  try {
    execFileSync(
      "npx",
      ["vercel", "env", "pull", ENV_FILE, "--environment=production", "--yes"],
      { stdio: "inherit" }
    );
  } catch {
    fail(
      "Couldn't download settings from Vercel.\n\n" +
        "  If you haven't connected this folder to the project yet, run:\n" +
        "    npx vercel login\n" +
        "    npx vercel link       (choose the lifstyl-online project)\n\n" +
        "  Then run this again:  npm run prod:agents"
    );
  }

  if (!existsSync(ENV_FILE)) {
    fail(`Vercel didn't create ${ENV_FILE}. Try 'npx vercel link' first.`);
  }

  // override:true — these production values must win over any local .env.
  const parsed = config({ path: ENV_FILE, override: true });
  if (parsed.error) fail(`Couldn't read ${ENV_FILE}: ${parsed.error.message}`);

  const url = process.env.POSTGRES_URL;
  const secret = process.env.AUTH_SECRET;

  if (!url) {
    fail(
      `${ENV_FILE} has no POSTGRES_URL.\n` +
        `  Add Postgres storage to the project in Vercel, then re-run:\n` +
        `    npx vercel env pull ${ENV_FILE}`
    );
  }
  if (!secret) {
    fail(
      `${ENV_FILE} has no AUTH_SECRET.\n` +
        `  Add it in Vercel → Settings → Environment Variables, then re-run:\n` +
        `    npx vercel env pull ${ENV_FILE}`
    );
  }

  const host = (() => {
    try {
      return new URL(url).host;
    } catch {
      return "(unparsed)";
    }
  })();
  console.log(`Database : ${host}`);
  console.log(`Secret   : loaded (${secret.length} chars)`);

  const rosters = ROSTER_FILES.filter((f) => existsSync(f));
  if (rosters.length === 0) {
    fail(
      "Couldn't find the roster CSVs in your Downloads folder.\n" +
        "  Expected:\n" +
        ROSTER_FILES.map((f) => `    ${path.basename(f)}`).join("\n")
    );
  }
  console.log(`Roster   : ${rosters.length} file(s)\n`);

  const env = { POSTGRES_URL: url, AUTH_SECRET: secret };

  console.log("── Step 1/4 · updating database structure ──");
  run("lib/db/migrate.ts", [], env);

  // Confirm the columns actually landed in *this* database before importing
  // into it — otherwise a migration that ran somewhere else looks like success.
  console.log("\n── Step 2/4 · confirming the update reached this database ──");
  run("lib/db/check-agents.ts", ["--structure-only"], env);

  console.log("── Step 3/4 · importing agents ──");
  run("lib/db/import-agents.ts", rosters, {
    ...env,
    MANAGER_PHONE,
  });

  console.log("── Step 4/4 · verifying sign-in ──");
  run("lib/db/check-agents.ts", [MANAGER_PHONE], env);

  console.log("Done. Try signing in on the live site.\n");
}

main();
