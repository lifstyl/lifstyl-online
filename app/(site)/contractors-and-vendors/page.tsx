import { PageHeader } from "@/components/page-header";
import { getContractorsRandomized } from "@/lib/content";
import { normalizePhone, formatPhoneForDisplay } from "@/lib/phone";

// Also what keeps the shuffle genuinely per-visitor rather than rendered once
// and served from cache.
export const dynamic = "force-dynamic";

export const metadata = { title: "Contractors & Vendors | Lifstyl Online" };

export default async function ContractorsAndVendorsPage() {
  // Order is randomised per request so no one keeps the top spot. null means
  // the table isn't there yet; treated the same as empty for visitors, while
  // the admin screen explains what to do about it.
  const contractors = (await getContractorsRandomized()) ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Who we work with"
        title="Contractors &amp; Vendors"
        intro="Companies and individuals the Lifstyl team works with. The list is shuffled each visit, so no one is favoured by position."
      />
      <section className="bg-white">
        <div className="mx-auto max-w-content px-6 pb-24 sm:px-10">
          {contractors.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {contractors.map((c) => {
                // Trimmed here as well as on save: stray whitespace is
                // invisible once rendered but silently breaks tel:/mailto:.
                const phone = c.phone.trim();
                const email = c.email.trim();
                const digits = normalizePhone(phone);
                return (
                  <article
                    key={c.id}
                    className="flex flex-col rounded-sm border border-border border-t-2 border-t-gold bg-pure-white p-6"
                  >
                    <h2 className="font-serif text-xl leading-tight text-navy">
                      {c.name}
                    </h2>

                    {c.description && (
                      <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-text-body">
                        {c.description}
                      </p>
                    )}

                    {(phone || email) && (
                      <dl className="mt-auto flex flex-col gap-1.5 pt-5 text-sm">
                        {phone && (
                          <div className="flex gap-2">
                            <dt className="text-text-muted">Phone</dt>
                            <dd>
                              {/* Tappable on a phone, which is where agents
                                  will mostly be reading this. */}
                              <a
                                href={`tel:${digits || phone}`}
                                className="font-medium text-navy underline decoration-gold underline-offset-2 hover:text-gold"
                              >
                                {formatPhoneForDisplay(phone)}
                              </a>
                            </dd>
                          </div>
                        )}
                        {email && (
                          <div className="flex gap-2">
                            <dt className="text-text-muted">Email</dt>
                            <dd className="min-w-0">
                              <a
                                href={`mailto:${email}`}
                                className="break-all font-medium text-navy underline decoration-gold underline-offset-2 hover:text-gold"
                              >
                                {email}
                              </a>
                            </dd>
                          </div>
                        )}
                      </dl>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-border bg-pure-white p-10 text-center">
              <p className="font-serif text-xl text-navy">
                Directory coming soon
              </p>
              <p className="mt-2 text-sm text-text-muted">
                No contractors or vendors have been added yet. An admin can add
                them from Admin → Contractors &amp; Vendors.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
