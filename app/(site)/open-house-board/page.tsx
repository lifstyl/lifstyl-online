import { PageHeader } from "@/components/page-header";
import { AgentLogin } from "@/components/exclusives/agent-login";
import { AgentBar } from "@/components/exclusives/agent-bar";
import { AddOpenHousePanel } from "@/components/openhouse/add-open-house-panel";
import { OpenHouseCard } from "@/components/openhouse/open-house-card";
import { getSessionInfo } from "@/auth";
import { getOpenHouses } from "@/lib/content";
import { formatWindow, todayInOffice } from "@/lib/schedule";
import { OPEN_HOUSE_TTL_DAYS, OFFICE_TIMEZONE } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export const metadata = { title: "Open House Board | Lifstyl Online" };

const PATH = "/open-house-board";

export default async function OpenHouseBoardPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await getSessionInfo();
  const signedIn = !!session && (session.isAgent || session.isAdmin);

  // Only queried once there's a session, so nothing reaches a logged-out visitor.
  // null means the table isn't there yet, which is different from an empty
  // board: posting would fail, so the form is withheld rather than offered.
  const rows = signedIn ? await getOpenHouses() : [];
  const notSetUp = rows === null;
  const openHouses = rows ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Agents only"
        title="Open House Board"
        intro={
          signedIn
            ? `Listings that need someone to host. Post one of yours with the window you want, or take one that's open. Unclaimed posts come down after ${OPEN_HOUSE_TTL_DAYS} days; once taken, a post stays up until the open house has finished.`
            : undefined
        }
      />
      <section className="bg-white">
        <div className="mx-auto max-w-content px-6 pb-24 sm:px-10">
          {!signedIn ? (
            <AgentLogin
              error={searchParams.error}
              redirectTo={PATH}
              blurb="The Open House Board is private to Lifstyl agents."
            />
          ) : (
            <>
              <AgentBar
                name={session.name}
                isAdmin={session.isAdmin}
                redirectTo={PATH}
              />

              {notSetUp ? (
                <div className="mb-10 rounded-sm border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                  <p className="font-medium">The board isn&apos;t ready yet</p>
                  <p className="mt-1">
                    {session.isAdmin
                      ? "Run “Update database” on the Setup page to finish setting it up."
                      : "An admin needs to finish setting this up. Check back shortly."}
                  </p>
                </div>
              ) : session.isAgent ? (
                <AddOpenHousePanel today={todayInOffice(OFFICE_TIMEZONE)} />
              ) : (
                <p className="mb-10 rounded-sm border border-border bg-pure-white px-5 py-4 text-sm text-text-body">
                  You&apos;re signed in as the site admin, so you can remove any
                  post here. Posting and hosting are done by agents from their
                  own sign-in.
                </p>
              )}

              {openHouses.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {openHouses.map((oh) => (
                    <OpenHouseCard
                      key={oh.id}
                      openHouse={oh}
                      when={formatWindow(
                        oh.scheduledDate,
                        oh.startTime,
                        oh.endTime
                      )}
                      isMine={oh.agentId === session.agentId}
                      isHost={
                        oh.hostAgentId !== null &&
                        oh.hostAgentId === session.agentId
                      }
                      canRemove={
                        session.canManageAllListings ||
                        oh.agentId === session.agentId
                      }
                      today={todayInOffice(OFFICE_TIMEZONE)}
                    />
                  ))}
                </div>
              ) : notSetUp ? null : (
                <div className="rounded-sm border border-dashed border-border bg-pure-white p-10 text-center">
                  <p className="font-serif text-xl text-navy">
                    Nothing on the board
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    No open houses need a host right now. Post one of your
                    listings and the office will see it.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
