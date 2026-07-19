import { ResourceEditor } from "@/components/admin/resource-editor";

export const dynamic = "force-dynamic";

export default function AdminQuarterlyMeetingsPage() {
  return (
    <ResourceEditor
      pageSlug="quarterly-meeting-materials"
      title="Quarterly Meeting Materials"
      description="Add links to slideshows, notes, and handouts. Group links by meeting date."
      previewHref="/quarterly-meeting-materials"
      groupLabelName="Meeting (group label)"
      showNote
    />
  );
}
