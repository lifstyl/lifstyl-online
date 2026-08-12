import { getFaqs } from "@/lib/content";
import { addFaq, updateFaq, deleteFaq, moveFaq } from "@/lib/actions";
import { EditorHeader, Card } from "@/components/admin/editor-header";
import { RowActions } from "@/components/admin/row-actions";
import { Field, SubmitButton, inputClass } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const faqs = await getFaqs();

  return (
    <>
      <EditorHeader
        title="FAQs"
        description="Add, edit, reorder, or remove questions. Changes appear on the FAQs page immediately."
        previewHref="/faqs"
      />

      {/* Add new */}
      <Card className="mb-8 border-t-2 border-t-gold">
        <h2 className="mb-4 font-serif text-lg text-navy">Add a question</h2>
        <form action={addFaq} className="flex flex-col gap-4">
          <Field label="Question">
            <input name="question" required className={inputClass} />
          </Field>
          <Field
            label="Answer"
            hint="Any web address typed here becomes a clickable link automatically."
          >
            <textarea name="answer" required rows={3} className={inputClass} />
          </Field>
          <Field
            label="Link (optional)"
            hint="Shows as a gold button under the answer. Paste the address — canva.com works as well as https://canva.com."
          >
            <input
              name="linkUrl"
              className={inputClass}
              placeholder="https://example.com"
            />
          </Field>
          <Field label="Link button text (optional)" hint="Defaults to “Open Link”.">
            <input
              name="linkLabel"
              className={inputClass}
              placeholder="e.g. Watch the Video Tutorial"
            />
          </Field>
          <div>
            <SubmitButton>Add question</SubmitButton>
          </div>
        </form>
      </Card>

      {/* Existing */}
      <div className="flex flex-col gap-4">
        {faqs.map((faq, i) => (
          <Card key={faq.id}>
            <form action={updateFaq} className="flex flex-col gap-4">
              <input type="hidden" name="id" value={faq.id} />
              <Field label="Question">
                <input
                  name="question"
                  defaultValue={faq.question}
                  required
                  className={inputClass}
                />
              </Field>
              <Field
                label="Answer"
                hint="Any web address typed here becomes a clickable link automatically."
              >
                <textarea
                  name="answer"
                  defaultValue={faq.answer}
                  required
                  rows={3}
                  className={inputClass}
                />
              </Field>
              <Field
                label="Link (optional)"
                hint="Shows as a gold button under the answer."
              >
                <input
                  name="linkUrl"
                  defaultValue={faq.linkUrl}
                  className={inputClass}
                  placeholder="https://example.com"
                />
              </Field>
              <Field
                label="Link button text (optional)"
                hint="Defaults to “Open Link”."
              >
                <input
                  name="linkLabel"
                  defaultValue={faq.linkLabel}
                  className={inputClass}
                  placeholder="e.g. Watch the Video Tutorial"
                />
              </Field>
              <div>
                <SubmitButton variant="ghost">Save changes</SubmitButton>
              </div>
            </form>
            <div className="mt-4 border-t border-border pt-4">
              <RowActions
                id={faq.id}
                moveAction={moveFaq}
                deleteAction={deleteFaq}
                isFirst={i === 0}
                isLast={i === faqs.length - 1}
                confirmText="Delete this FAQ?"
              />
            </div>
          </Card>
        ))}
        {faqs.length === 0 && (
          <p className="text-sm text-text-muted">No FAQs yet. Add one above.</p>
        )}
      </div>
    </>
  );
}
