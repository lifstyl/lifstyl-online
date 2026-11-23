import Link from "next/link";
import { getOpenHouses } from "@/lib/content";
import { deleteOpenHouse } from "@/lib/actions";
import { EditorHeader, Card } from "@/components/admin/editor-header";
import { SubmitButton } from "@/components/admin/ui";
import { formatWindow } from "@/lib/schedule";
import { OPEN_HOUSE_TTL_DAYS } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminOpenHouseBoardPage() {
  const openHouses = await getOpenHouses();

  return (
    <>
      <EditorHeader
        title="Open House Board"
        description={`Every open house agents have posted. Unclaimed posts come down after ${OPEN_HOUSE_TTL_DAYS} days; taken ones stay until the open house has finished.`}
        previewHref="/open-house-board"
      />

      {openHouses === null ? (
        <Card>
          <p className="text-sm text-text-body">
            The open house board isn&apos;t set up in the database yet. Go to{" "}
            <Link href="/admin/setup" className="font-medium text-navy underline">
              Setup
            </Link>{" "}
            and run &ldquo;Update database&rdquo;.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {openHouses.map((oh) => (
            <Card key={oh.id}>
              <div className="flex flex-wrap items-start gap-4">
                {oh.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={oh.imageUrl}
                    alt={`${oh.streetNumber} ${oh.streetName}`}
                    className="h-24 w-32 shrink-0 rounded-sm object-cover"
                  />
                )}
                <div className="min-w-[220px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-lg text-navy">
                      {oh.streetNumber} {oh.streetName}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        oh.hostAgentId
                          ? "bg-navy/10 text-navy"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {oh.hostAgentId ? "Hosted" : "Needs a host"}
                    </span>
                  </div>
                  <p className="text-sm text-text-body">
                    {oh.city}, {oh.state} {oh.zip}
                  </p>
                  <p className="mt-2 text-sm font-medium text-navy">
                    {formatWindow(oh.scheduledDate, oh.startTime, oh.endTime)}
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    Listed by{" "}
                    <span className="font-medium text-navy">{oh.agentName}</span>
                    {oh.hostName && (
                      <>
                        {" · hosted by "}
                        <span className="font-medium text-navy">
                          {oh.hostName}
                        </span>
                      </>
                    )}
                  </p>
                  {oh.notes && (
                    <p className="mt-2 whitespace-pre-line text-sm text-text-body">
                      {oh.notes}
                    </p>
                  )}
                </div>
                <form action={deleteOpenHouse}>
                  <input type="hidden" name="id" value={oh.id} />
                  <SubmitButton variant="danger">Remove</SubmitButton>
                </form>
              </div>
            </Card>
          ))}
          {openHouses.length === 0 && (
            <p className="text-sm text-text-muted">
              Nothing on the board right now.
            </p>
          )}
        </div>
      )}
    </>
  );
}
