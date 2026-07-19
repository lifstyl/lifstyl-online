import { PageHeader } from "@/components/page-header";
import { ResourceGroups } from "@/components/resource-groups";
import { getGroupedResourceLinks } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Recommendations For Marketing Materials | Lifstyl Online",
};

export default async function RecommendationsPage() {
  const groups = await getGroupedResourceLinks(
    "recommendations-for-marketing-materials"
  );

  return (
    <>
      <PageHeader
        eyebrow="Brokerage Resources"
        title="Recommendations For Marketing Materials"
        intro="Trusted vendors for business cards, signs, and other marketing materials."
      />
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 pb-24 sm:px-10">
          <ResourceGroups
            groups={groups}
            emptyLabel="No vendor recommendations have been added yet."
          />
        </div>
      </section>
    </>
  );
}
