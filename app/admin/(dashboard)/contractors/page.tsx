import Link from "next/link";
import { getContractors } from "@/lib/content";
import {
  addContractor,
  updateContractor,
  deleteContractor,
} from "@/lib/actions";
import { EditorHeader, Card } from "@/components/admin/editor-header";
import { Field, SubmitButton, inputClass } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminContractorsPage() {
  const contractors = await getContractors();

  return (
    <>
      <EditorHeader
        title="Contractors & Vendors"
        description="Companies and individuals the team works with. Only a name is required — phone, email, and description are optional. Listed A–Z here; the public page shuffles the order on every visit."
        previewHref="/contractors-and-vendors"
      />

      {contractors === null ? (
        <Card>
          <p className="text-sm text-text-body">
            Contractors &amp; Vendors isn&apos;t set up in the database yet. Go
            to{" "}
            <Link href="/admin/setup" className="font-medium text-navy underline">
              Setup
            </Link>{" "}
            and run &ldquo;Update database&rdquo;, then come back here.
          </p>
        </Card>
      ) : (
        <>
          {/* Add new */}
          <Card className="mb-8 border-t-2 border-t-gold">
            <h2 className="mb-4 font-serif text-lg text-navy">
              Add a contractor or vendor
            </h2>
            <form action={addContractor} className="flex flex-col gap-4">
              <Field label="Name" hint="Required — a company or a person.">
                <input name="name" required className={inputClass} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone (optional)">
                  <input
                    name="phone"
                    className={inputClass}
                    placeholder="8595551212"
                  />
                </Field>
                <Field label="Email (optional)">
                  <input
                    name="email"
                    type="email"
                    className={inputClass}
                    placeholder="name@example.com"
                  />
                </Field>
              </div>
              <Field
                label="Description (optional)"
                hint="What they do, areas served, who to ask for — anything useful."
              >
                <textarea name="description" rows={3} className={inputClass} />
              </Field>
              <div>
                <SubmitButton>Add to list</SubmitButton>
              </div>
            </form>
          </Card>

          {/* Existing */}
          <div className="flex flex-col gap-4">
            {contractors.map((c, i) => (
              <Card key={c.id}>
                <form action={updateContractor} className="flex flex-col gap-4">
                  <input type="hidden" name="id" value={c.id} />
                  <Field label="Name">
                    <input
                      name="name"
                      defaultValue={c.name}
                      required
                      className={inputClass}
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Phone (optional)">
                      <input
                        name="phone"
                        defaultValue={c.phone}
                        className={inputClass}
                        placeholder="8595551212"
                      />
                    </Field>
                    <Field label="Email (optional)">
                      <input
                        name="email"
                        type="email"
                        defaultValue={c.email}
                        className={inputClass}
                        placeholder="name@example.com"
                      />
                    </Field>
                  </div>
                  <Field label="Description (optional)">
                    <textarea
                      name="description"
                      defaultValue={c.description}
                      rows={3}
                      className={inputClass}
                    />
                  </Field>
                  <div>
                    <SubmitButton variant="ghost">Save changes</SubmitButton>
                  </div>
                </form>
                {/* No move controls — the public list is shuffled per visit,
                    so there's no fixed order to arrange. */}
                <div className="mt-4 flex border-t border-border pt-4">
                  <form action={deleteContractor} className="ml-auto">
                    <input type="hidden" name="id" value={c.id} />
                    <SubmitButton variant="danger">Delete</SubmitButton>
                  </form>
                </div>
              </Card>
            ))}
            {contractors.length === 0 && (
              <p className="text-sm text-text-muted">
                Nobody on the list yet. Add the first one above.
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}
