import { getPageContent } from "@/lib/content";
import { savePageContent } from "@/lib/actions";
import { EditorHeader, Card } from "@/components/admin/editor-header";
import { Field, SubmitButton, inputClass } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminBookARoomPage() {
  const content = await getPageContent("book-a-conference-room");

  return (
    <>
      <EditorHeader
        title="Book a Conference Room"
        description="The intro text and the room-booking link."
        previewHref="/book-a-conference-room"
      />
      <Card className="border-t-2 border-t-gold">
        <form action={savePageContent} className="flex flex-col gap-4">
          <input type="hidden" name="pageSlug" value="book-a-conference-room" />
          <Field label="Intro text">
            <textarea name="kv:intro" defaultValue={content.intro ?? ""} rows={3} className={inputClass} />
          </Field>
          <Field label="Booking link" hint="Where the “Book Now” button sends agents (e.g. your Skedda page).">
            <input name="kv:bookingUrl" defaultValue={content.bookingUrl ?? ""} className={inputClass} placeholder="https://…" />
          </Field>
          <div>
            <SubmitButton>Save</SubmitButton>
          </div>
        </form>
      </Card>
    </>
  );
}
