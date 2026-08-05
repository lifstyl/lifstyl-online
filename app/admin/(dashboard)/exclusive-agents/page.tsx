import { getAgents } from "@/lib/content";
import {
  addAgent,
  updateAgentPhone,
  setAgentActive,
  setAgentManager,
  deleteAgent,
} from "@/lib/actions";
import { EditorHeader, Card } from "@/components/admin/editor-header";
import { Field, SubmitButton, inputClass } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminExclusiveAgentsPage() {
  const agents = await getAgents();

  return (
    <>
      <EditorHeader
        title="Exclusive Agents"
        description="Agents who can sign in to Office Exclusives. Their phone number is their password, so it's stored encrypted and never shown on the site — only the last 4 digits appear here so you can tell which number they were set up with."
        previewHref="/office-exclusives"
      />

      <Card className="mb-8 border-t-2 border-t-gold">
        <h2 className="mb-4 font-serif text-lg text-navy">Add an agent</h2>
        <form action={addAgent} className="flex flex-col gap-4">
          <Field label="Name" hint="Exactly how they'll type it when signing in (capitalisation doesn't matter).">
            <input name="name" required className={inputClass} />
          </Field>
          <Field
            label="Phone number"
            hint="This is their password. Numbers only — no dashes, spaces, or parentheses."
          >
            <input
              name="phone"
              required
              inputMode="numeric"
              pattern="[0-9]*"
              className={inputClass}
              placeholder="8595551212"
            />
          </Field>
          <div>
            <SubmitButton>Add agent</SubmitButton>
          </div>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg text-navy">{agent.name}</h3>
                <p className="mt-0.5 text-sm text-text-muted">
                  Phone ends in {agent.phoneLast4 || "—"}
                  {agent.isManager && (
                    <span className="ml-2 rounded-full bg-navy/10 px-2 py-0.5 text-xs font-medium text-navy">
                      Manages all listings
                    </span>
                  )}
                  {!agent.active && (
                    <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                      Access revoked
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form action={setAgentManager}>
                  <input type="hidden" name="id" value={agent.id} />
                  <input
                    type="hidden"
                    name="manager"
                    value={agent.isManager ? "false" : "true"}
                  />
                  <SubmitButton variant="ghost">
                    {agent.isManager ? "Remove manager" : "Make manager"}
                  </SubmitButton>
                </form>
                <form action={setAgentActive}>
                  <input type="hidden" name="id" value={agent.id} />
                  <input
                    type="hidden"
                    name="active"
                    value={agent.active ? "false" : "true"}
                  />
                  <SubmitButton variant="ghost">
                    {agent.active ? "Revoke access" : "Restore access"}
                  </SubmitButton>
                </form>
                <form action={deleteAgent}>
                  <input type="hidden" name="id" value={agent.id} />
                  <SubmitButton variant="danger">Delete</SubmitButton>
                </form>
              </div>
            </div>

            <form
              action={updateAgentPhone}
              className="mt-4 flex flex-wrap items-end gap-3 border-t border-border pt-4"
            >
              <input type="hidden" name="id" value={agent.id} />
              <div className="min-w-[220px] flex-1">
                <Field label="Change phone number (password)">
                  <input
                    name="phone"
                    required
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={inputClass}
                    placeholder="8595551212"
                  />
                </Field>
              </div>
              <SubmitButton variant="ghost">Update</SubmitButton>
            </form>
          </Card>
        ))}
        {agents.length === 0 && (
          <p className="text-sm text-text-muted">
            No agents yet. Add one above — until then, nobody can sign in to
            Office Exclusives.
          </p>
        )}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-text-muted">
        Deleting an agent also removes the listings they posted. To keep their
        listings but stop them signing in, use “Revoke access” instead.
        <br />
        “Make manager” lets an agent edit or remove any listing on the board. It
        does not give them access to this admin panel.
      </p>
    </>
  );
}
