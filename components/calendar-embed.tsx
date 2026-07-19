/**
 * Renders the embedded Google Calendar when a URL is configured. Google
 * Calendar's public embed auto-reflects newly created events with no redeploy.
 * Shows a helpful placeholder (with an admin hint) when not yet configured.
 */
export function CalendarEmbed({ url }: { url?: string }) {
  const configured = url && url.trim().length > 0;

  if (!configured) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-sm border border-dashed border-border bg-pure-white p-10 text-center">
        <p className="font-serif text-xl text-navy">Calendar coming soon</p>
        <p className="mt-2 max-w-md text-sm text-text-muted">
          The events calendar hasn&apos;t been connected yet. An admin can paste
          the Google Calendar embed link from{" "}
          <span className="font-medium text-text-body">Admin → Home</span> and it
          will appear here, auto-updating whenever a new event is added.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-sm border border-border bg-pure-white shadow-sm">
      <iframe
        src={url}
        title="Lifstyl Events & Trainings Calendar"
        className="h-[600px] w-full"
        style={{ border: 0 }}
        frameBorder={0}
        scrolling="no"
      />
    </div>
  );
}
