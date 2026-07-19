import { getResourceLinks } from "@/lib/content";
import {
  addResourceLink,
  updateResourceLink,
  deleteResourceLink,
  moveResourceLink,
} from "@/lib/actions";
import { EditorHeader, Card } from "./editor-header";
import { RowActions } from "./row-actions";
import { Field, SubmitButton, inputClass } from "./ui";

/**
 * Shared editor for pages that are "grouped outbound links": quarterly meeting
 * materials and marketing recommendations. Rows sharing a group label render
 * together on the public page.
 */
export async function ResourceEditor({
  pageSlug,
  title,
  description,
  previewHref,
  groupLabelName,
  showNote = false,
}: {
  pageSlug: string;
  title: string;
  description: string;
  previewHref: string;
  groupLabelName: string;
  showNote?: boolean;
}) {
  const links = await getResourceLinks(pageSlug);

  return (
    <>
      <EditorHeader title={title} description={description} previewHref={previewHref} />

      <Card className="mb-8 border-t-2 border-t-gold">
        <h2 className="mb-4 font-serif text-lg text-navy">Add a link</h2>
        <form action={addResourceLink} className="flex flex-col gap-4">
          <input type="hidden" name="pageSlug" value={pageSlug} />
          <Field
            label={groupLabelName}
            hint="Links with the same group are shown together in one card."
          >
            <input name="groupLabel" className={inputClass} />
          </Field>
          {showNote && (
            <Field label="Group note (optional)">
              <input name="groupNote" className={inputClass} />
            </Field>
          )}
          <Field label="Button label">
            <input name="title" required className={inputClass} placeholder="e.g. View the Presentation" />
          </Field>
          <Field label="Link URL">
            <input name="url" required className={inputClass} placeholder="https://…" />
          </Field>
          <div>
            <SubmitButton>Add link</SubmitButton>
          </div>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        {links.map((link, i) => (
          <Card key={link.id}>
            <form action={updateResourceLink} className="flex flex-col gap-4">
              <input type="hidden" name="id" value={link.id} />
              <input type="hidden" name="pageSlug" value={pageSlug} />
              <Field label={groupLabelName}>
                <input name="groupLabel" defaultValue={link.groupLabel} className={inputClass} />
              </Field>
              {showNote && (
                <Field label="Group note (optional)">
                  <input name="groupNote" defaultValue={link.groupNote} className={inputClass} />
                </Field>
              )}
              {!showNote && (
                <input type="hidden" name="groupNote" value={link.groupNote} />
              )}
              <Field label="Button label">
                <input name="title" defaultValue={link.title} required className={inputClass} />
              </Field>
              <Field label="Link URL">
                <input name="url" defaultValue={link.url} required className={inputClass} />
              </Field>
              <div>
                <SubmitButton variant="ghost">Save changes</SubmitButton>
              </div>
            </form>
            <div className="mt-4 border-t border-border pt-4">
              <RowActions
                id={link.id}
                moveAction={moveResourceLink}
                deleteAction={deleteResourceLink}
                isFirst={i === 0}
                isLast={i === links.length - 1}
                extraFields={{ pageSlug }}
              />
            </div>
          </Card>
        ))}
        {links.length === 0 && (
          <p className="text-sm text-text-muted">No links yet. Add one above.</p>
        )}
      </div>
    </>
  );
}
