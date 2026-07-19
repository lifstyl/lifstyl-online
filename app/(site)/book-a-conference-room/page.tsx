import { PageHeader } from "@/components/page-header";
import { getPageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = { title: "Book a Conference Room | Lifstyl Online" };

export default async function BookAConferenceRoomPage() {
  const content = await getPageContent("book-a-conference-room");
  const bookingUrl = content.bookingUrl?.trim();

  return (
    <>
      <PageHeader
        eyebrow="Brokerage Resources"
        title="Book a Conference Room"
        intro={
          content.intro ||
          "Reserve one of the Lifstyl conference rooms for your next meeting or training."
        }
      />
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 pb-24 sm:px-10">
          <div className="rounded-sm border border-border border-t-2 border-t-gold bg-pure-white p-8">
            {bookingUrl ? (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
              >
                Book Now
              </a>
            ) : (
              <p className="text-text-muted">
                The booking link hasn&apos;t been set yet. An admin can add it
                from Admin → Book a Conference Room.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
