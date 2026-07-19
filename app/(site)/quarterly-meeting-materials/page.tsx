import { PageHeader } from "@/components/page-header";
import { ResourceGroups } from "@/components/resource-groups";
import { getGroupedResourceLinks } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = { title: "Quarterly Meeting Materials | Lifstyl Online" };

export default async function QuarterlyMeetingMaterialsPage() {
  const groups = await getGroupedResourceLinks("quarterly-meeting-materials");

  return (
    <>
      <PageHeader
        eyebrow="Brokerage Resources"
        title="Quarterly Meeting Materials"
        intro="Slideshows, notes, and handouts from each quarterly meeting."
      />
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 pb-24 sm:px-10">
          <ResourceGroups
            groups={groups}
            emptyLabel="No meeting materials have been added yet."
          />
        </div>
      </section>
    </>
  );
}
