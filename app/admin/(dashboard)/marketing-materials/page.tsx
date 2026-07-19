import { ResourceEditor } from "@/components/admin/resource-editor";

export const dynamic = "force-dynamic";

export default function AdminMarketingMaterialsPage() {
  return (
    <ResourceEditor
      pageSlug="recommendations-for-marketing-materials"
      title="Recommendations For Marketing Materials"
      description="Recommended vendors, grouped by category (e.g. Business Cards, For Sale Signs)."
      previewHref="/recommendations-for-marketing-materials"
      groupLabelName="Category (group label)"
    />
  );
}
