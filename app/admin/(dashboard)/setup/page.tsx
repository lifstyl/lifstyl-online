import { getDbStatus } from "@/lib/db/maintenance";
import { runDatabaseUpdate, importRoster } from "@/lib/actions";
import { EditorHeader, Card } from "@/components/admin/editor-header";
import { Field, SubmitButton, inputClass } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminSetupPage({
  searchParams,
}: {
  searchParams: { error?: string; done?: string; imported?: string };
}) {
  const status = await getDbStatus();

  return (
    <>
      <EditorHeader
        title="Setup"
        description="Prepare the database and load the agent roster for Office Exclusives. Everything here runs on the server, so nothing needs to be copied from Vercel."
        previewHref="/office-exclusives"
      />

      {searchParams.error && (
        <div className="mb-6 rounded-sm border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">That didn&apos;t work</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-red-700">
            {searchParams.error}
          </p>
        </div>
      )}
      {searchParams.done === "structure" && (
        <div className="mb-6 rounded-sm border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">
            Database structure is up to date.
          </p>
        </div>
      )}
      {searchParams.imported && (
        <div className="mb-6 rounded-sm border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">Roster imported</p>
          <p className="mt-1 text-sm text-green-700">{searchParams.imported}</p>
        </div>
      )}

      {/* ── Status ───────────────────────────────────── */}
      <Card className="mb-8 border-t-2 border-t-gold">
        <h2 className="mb-4 font-serif text-lg text-navy">Current status</h2>
        {status.error ? (
          <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Couldn&apos;t reach the database: {status.error}
          </p>
        ) : (
          <dl className="flex flex-col gap-2 text-sm">
            <Row
              label="Agents table"
              ok={status.agentsTable}
              value={status.agentsTable ? "ready" : "missing"}
            />
            <Row
              label="Listings table"
              ok={status.listingsTable}
              value={status.listingsTable ? "ready" : "missing"}
            />
            <Row
              label="Required columns"
              ok={status.agentsTable && status.missingColumns.length === 0}
              value={
                !status.agentsTable
                  ? "—"
                  : status.missingColumns.length === 0
                    ? "all present"
                    : `missing: ${status.missingColumns.join(", ")}`
              }
            />
            <Row
              label="Sign-in secret"
              ok={status.authSecretSet}
              value={status.authSecretSet ? "configured" : "AUTH_SECRET not set"}
            />
            <Row
              label="Agents loaded"
              ok={(status.agentCount ?? 0) > 0}
              value={status.agentCount === null ? "—" : String(status.agentCount)}
            />
            <Row
              label="Manager"
              ok={status.managers.length > 0}
              value={status.managers.join(", ") || "none set"}
            />
          </dl>
        )}
      </Card>

      {/* ── Step 1 ───────────────────────────────────── */}
      <Card className="mb-8">
        <h2 className="font-serif text-lg text-navy">
          Step 1 · Update the database structure
        </h2>
        <p className="mt-2 text-sm text-text-body">
          Creates anything the site needs but the database doesn&apos;t have
          yet. Safe to run more than once — it skips whatever already exists.
        </p>
        <form action={runDatabaseUpdate} className="mt-4">
          <SubmitButton>Update database</SubmitButton>
        </form>
      </Card>

      {/* ── Step 2 ───────────────────────────────────── */}
      <Card>
        <h2 className="font-serif text-lg text-navy">
          Step 2 · Load the agent roster
        </h2>
        <p className="mt-2 text-sm text-text-body">
          Upload the roster spreadsheets, exported as CSV — one file per sheet.
          Each line should be a name, a comma, then a phone number.
        </p>

        {!status.ok && (
          <p className="mt-4 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Run step 1 first — the database isn&apos;t ready for the roster yet.
          </p>
        )}

        <form action={importRoster} className="mt-5 flex flex-col gap-4">
          <Field label="Roster CSV files" hint="You can select more than one.">
            <input
              type="file"
              name="rosters"
              accept=".csv,text/csv"
              multiple
              required
              className="text-sm"
            />
          </Field>

          <Field
            label="Manager phone number"
            hint="Optional. This agent can edit or remove any listing on the board. Numbers only."
          >
            <input
              name="managerPhone"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="8595551212"
              className={inputClass}
            />
          </Field>

          <label className="flex items-start gap-2 text-sm text-text-body">
            <input type="checkbox" name="replace" className="mt-1" />
            <span>
              Replace the existing roster instead of adding to it.
              <span className="mt-0.5 block text-xs text-text-muted">
                Only needed if agents were loaded before and can&apos;t sign in.
                This also removes any listings they posted.
              </span>
            </span>
          </label>

          <div>
            <SubmitButton>Import roster</SubmitButton>
          </div>
        </form>
      </Card>
    </>
  );
}

function Row({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-2 last:border-b-0">
      <dt className="text-text-muted">{label}</dt>
      <dd className="flex items-center gap-2 text-right">
        <span className={ok ? "text-text-body" : "font-medium text-red-700"}>
          {value}
        </span>
        <span aria-hidden="true">{ok ? "✓" : "✗"}</span>
      </dd>
    </div>
  );
}
