import { PageHeader } from "@/components/page-header";
import { getPageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lifstyl Community Sponsorship | Lifstyl Online",
};

/**
 * Defaults live here as well as in the seed, so the page works the moment it
 * deploys — a fresh production database has no rows for this slug yet, and
 * editing them in Admin overrides these.
 */
const DEFAULT_INTRO =
  "Lifstyl offers two sponsorship per month that are on a first come, first served basis.";
const DEFAULT_FORM_URL = "https://forms.gle/VbVPE1N8QdYLqrM96";
const DEFAULT_BUTTON_LABEL = "Submit Today";

export default async function CommunitySponsorshipPage() {
  const content = await getPageContent("lifstyl-community-sponsorship");
  const formUrl = content.formUrl?.trim() || DEFAULT_FORM_URL;
  const buttonLabel = content.buttonLabel?.trim() || DEFAULT_BUTTON_LABEL;

  return (
    <>
      <PageHeader
        eyebrow="Brokerage Resources"
        title="Lifstyl Community Sponsorship"
        intro={content.intro || DEFAULT_INTRO}
      />
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 pb-24 sm:px-10">
          <div className="rounded-sm border border-border border-t-2 border-t-gold bg-pure-white p-8">
            {formUrl ? (
              <a
                href={formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
              >
                {buttonLabel}
              </a>
            ) : (
              <p className="text-text-muted">
                The sponsorship form link hasn&apos;t been set yet. An admin can
                add it from Admin → Community Sponsorship.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
