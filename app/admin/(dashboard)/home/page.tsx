import { getCarouselImages, getPageContent } from "@/lib/content";
import {
  savePageContent,
  addCarouselImage,
  deleteCarouselImage,
  moveCarouselImage,
} from "@/lib/actions";
import { EditorHeader, Card } from "@/components/admin/editor-header";
import { RowActions } from "@/components/admin/row-actions";
import { Field, SubmitButton, inputClass } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [images, content] = await Promise.all([
    getCarouselImages(),
    getPageContent("home"),
  ]);

  return (
    <>
      <EditorHeader
        title="Home Page"
        description="Everything on the homepage — hero photos, text, and the events calendar."
        previewHref="/"
      />

      {/* ── Hero carousel ─────────────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-3 font-serif text-xl text-navy">Hero photo carousel</h2>
        <Card className="mb-4 border-t-2 border-t-gold">
          <form action={addCarouselImage} className="flex flex-col gap-4">
            <Field label="Upload a photo" hint="JPG or PNG. Large, landscape photos look best.">
              <input type="file" name="image" accept="image/*" className="text-sm" />
            </Field>
            <Field label="…or paste an image URL" hint="Optional — use either upload or URL.">
              <input name="url" className={inputClass} placeholder="https://…" />
            </Field>
            <Field label="Alt text (for accessibility)">
              <input name="altText" className={inputClass} placeholder="e.g. Lifstyl Lexington office" />
            </Field>
            <div>
              <SubmitButton>Add photo</SubmitButton>
            </div>
          </form>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {images.map((img, i) => (
            <Card key={img.id} className="flex flex-col gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.altText}
                className="h-40 w-full rounded-sm object-cover"
              />
              <p className="truncate text-xs text-text-muted">{img.altText || "No alt text"}</p>
              <RowActions
                id={img.id}
                moveAction={moveCarouselImage}
                deleteAction={deleteCarouselImage}
                isFirst={i === 0}
                isLast={i === images.length - 1}
              />
            </Card>
          ))}
          {images.length === 0 && (
            <p className="text-sm text-text-muted">
              No photos yet. Add one above — until then the hero shows a navy background.
            </p>
          )}
        </div>
      </section>

      {/* ── Text content ──────────────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-3 font-serif text-xl text-navy">Text &amp; calendar</h2>
        <Card>
          <form action={savePageContent} className="flex flex-col gap-4">
            <input type="hidden" name="pageSlug" value="home" />
            <Field label="Hero heading">
              <input name="kv:heroHeading" defaultValue={content.heroHeading ?? ""} className={inputClass} />
            </Field>
            <Field label="Hero banner (small pill under the heading)">
              <input name="kv:heroBanner" defaultValue={content.heroBanner ?? ""} className={inputClass} />
            </Field>
            <Field label="Events section heading">
              <input name="kv:eventsHeading" defaultValue={content.eventsHeading ?? ""} className={inputClass} />
            </Field>
            <Field
              label="Google Calendar embed URL"
              hint="In Google Calendar → Settings → your calendar → Integrate calendar, copy the src=&quot;…&quot; URL from the embed code and paste it here. It auto-updates when you add events."
            >
              <input
                name="kv:calendarEmbedUrl"
                defaultValue={content.calendarEmbedUrl ?? ""}
                className={inputClass}
                placeholder="https://calendar.google.com/calendar/embed?src=…"
              />
            </Field>
            <Field label="Closing call-to-action heading">
              <input name="kv:ctaHeading" defaultValue={content.ctaHeading ?? ""} className={inputClass} />
            </Field>
            <Field label="CTA button label">
              <input name="kv:ctaButtonLabel" defaultValue={content.ctaButtonLabel ?? ""} className={inputClass} />
            </Field>
            <Field label="CTA button link">
              <input name="kv:ctaButtonUrl" defaultValue={content.ctaButtonUrl ?? ""} className={inputClass} />
            </Field>
            <div>
              <SubmitButton>Save text</SubmitButton>
            </div>
          </form>
        </Card>
      </section>

    </>
  );
}
