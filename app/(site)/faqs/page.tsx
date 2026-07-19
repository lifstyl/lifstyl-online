import { PageHeader } from "@/components/page-header";
import { FaqAccordion } from "@/components/faq-accordion";
import { getFaqs } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = { title: "FAQs | Lifstyl Online" };

export default async function FaqsPage() {
  const faqs = await getFaqs();

  return (
    <>
      <PageHeader
        eyebrow="Answers"
        title="Frequently Asked Questions"
        intro="Common questions from Lifstyl agents, all in one place."
      />
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 pb-24 sm:px-10">
          {faqs.length > 0 ? (
            <FaqAccordion faqs={faqs} />
          ) : (
            <p className="text-text-muted">No FAQs have been added yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
