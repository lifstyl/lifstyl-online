import { getPageContent } from "@/lib/content";
import { savePageContent } from "@/lib/actions";
import { EditorHeader, Card } from "@/components/admin/editor-header";
import { Field, SubmitButton, inputClass } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminCommunitySponsorshipPage() {
  const content = await getPageContent("lifstyl-community-sponsorship");

  return (
    <>
      <EditorHeader
        title="Community Sponsorship"
        description="The intro text and the sponsorship form link."
        previewHref="/lifstyl-community-sponsorship"
      />
      <Card className="border-t-2 border-t-gold">
        <form action={savePageContent} className="flex flex-col gap-4">
          <input
            type="hidden"
            name="pageSlug"
            value="lifstyl-community-sponsorship"
          />
          <Field label="Intro text">
            <textarea
              name="kv:intro"
              defaultValue={content.intro ?? ""}
              rows={3}
              className={inputClass}
              placeholder="Lifstyl offers two sponsorship per month that are on a first come, first served basis."
            />
          </Field>
          <Field
            label="Form link"
            hint="Where the button sends agents — the Google Form for sponsorship requests."
          >
            <input
              name="kv:formUrl"
              defaultValue={content.formUrl ?? ""}
              className={inputClass}
              placeholder="https://docs.google.com/forms/…"
            />
          </Field>
          <Field label="Button text" hint="Defaults to “Submit Today”.">
            <input
              name="kv:buttonLabel"
              defaultValue={content.buttonLabel ?? ""}
              className={inputClass}
              placeholder="Submit Today"
            />
          </Field>
          <div>
            <SubmitButton>Save</SubmitButton>
          </div>
        </form>
      </Card>

      <p className="mt-6 text-xs leading-relaxed text-text-muted">
        Leaving a field blank falls back to the built-in default, so the page
        always shows something sensible.
      </p>
    </>
  );
}
