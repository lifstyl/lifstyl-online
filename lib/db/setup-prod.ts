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

  if (!existsSync(ENV_FILE)) {
    fail(
      `Can't find ${ENV_FILE}.\n\n` +
        `  Download your production settings first:\n\n` +
        `    npx vercel link          (pick the lifstyl-online project)\n` +
        `    npx vercel env pull ${ENV_FILE}\n\n` +
        `  Then run this again:  npm run prod:agents`
    );
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

  console.log("── Step 1/3 · updating database structure ──");
  run("lib/db/migrate.ts", [], env);

  console.log("\n── Step 2/3 · importing agents ──");
  run("lib/db/import-agents.ts", rosters, {
    ...env,
    MANAGER_PHONE,
  });

  console.log("── Step 3/3 · verifying sign-in ──");
  run("lib/db/check-agents.ts", [MANAGER_PHONE], env);

  console.log("Done. Try signing in on the live site.\n");
}

main();
