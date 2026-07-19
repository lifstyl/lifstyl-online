import { PageHeader } from "@/components/page-header";
import { getPageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = { title: "Open House Showcase | Lifstyl Online" };

export default async function OpenHouseShowcasePage() {
  const content = await getPageContent("open-house-showcase");
  const formUrl = content.formUrl?.trim();
  const configured = formUrl && !formUrl.includes("REPLACE_WITH");

  return (
    <>
      <PageHeader
        eyebrow="Brokerage Resources"
        title="Open House Showcase"
        intro={
          content.intro ||
          "Get your weekend open houses featured on Lifstyl's social media."
        }
      />
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 pb-24 sm:px-10">
          <div className="rounded-sm border border-border border-t-2 border-t-gold bg-pure-white p-8">
            {configured ? (
              <a
                href={formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
              >
                Submit Your Open House
              </a>
            ) : (
              <p className="text-text-muted">
                The Google Form link hasn&apos;t been set yet. An admin can add
                it from Admin → Open House Showcase.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
