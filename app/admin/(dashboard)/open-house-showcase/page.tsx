import { getPageContent } from "@/lib/content";
import { savePageContent } from "@/lib/actions";
import { EditorHeader, Card } from "@/components/admin/editor-header";
import { Field, SubmitButton, inputClass } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminOpenHouseShowcasePage() {
  const content = await getPageContent("open-house-showcase");

  return (
    <>
      <EditorHeader
        title="Open House Showcase"
        description="The intro text and the Google Form link where agents submit their open houses."
        previewHref="/open-house-showcase"
      />
      <Card className="border-t-2 border-t-gold">
        <form action={savePageContent} className="flex flex-col gap-4">
          <input type="hidden" name="pageSlug" value="open-house-showcase" />
          <Field label="Intro text">
            <textarea name="kv:intro" defaultValue={content.intro ?? ""} rows={4} className={inputClass} />
          </Field>
          <Field label="Google Form link" hint="Where the “Submit Your Open House” button sends agents.">
            <input name="kv:formUrl" defaultValue={content.formUrl ?? ""} className={inputClass} placeholder="https://forms.gle/…" />
          </Field>
          <div>
            <SubmitButton>Save</SubmitButton>
          </div>
        </form>
      </Card>
    </>
  );
}
