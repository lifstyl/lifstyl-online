import { PageHeader } from "@/components/page-header";
import { AgentLogin } from "@/components/exclusives/agent-login";
import { AgentBar } from "@/components/exclusives/agent-bar";
import { AddListingPanel } from "@/components/exclusives/add-listing-panel";
import { ListingCard } from "@/components/exclusives/listing-card";
import { getSessionInfo } from "@/auth";
import { getListings } from "@/lib/content";
import { expiryLabel, daysUntilExpiry } from "@/lib/expiry";
import { EXPIRY_WARNING_DAYS, LISTING_TTL_DAYS } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export const metadata = { title: "Office Exclusives | Lifstyl Online" };

export default async function OfficeExclusivesPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await getSessionInfo();
  const signedIn = !!session && (session.isAgent || session.isAdmin);

  // Listings are only queried once there's a valid session, so nothing about
  // them is ever rendered — or sent — to a logged-out visitor.
  const listings = signedIn ? await getListings() : [];

  return (
    <>
      <PageHeader
        eyebrow="Agents only"
        title="Office Exclusives"
        intro={
          signedIn
            ? `Listings shared by Lifstyl agents. Post your own so the office sees it first. Listings come down automatically after ${LISTING_TTL_DAYS} days.`
            : undefined
        }
      />
      <section className="bg-white">
        <div className="mx-auto max-w-content px-6 pb-24 sm:px-10">
          {!signedIn ? (
            <AgentLogin error={searchParams.error} />
          ) : (
            <>
              <AgentBar name={session.name} isAdmin={session.isAdmin} />

              {session.isAgent ? (
                <AddListingPanel />
              ) : (
                <p className="mb-10 rounded-sm border border-border bg-pure-white px-5 py-4 text-sm text-text-body">
                  You&apos;re signed in as the site admin, so you can edit or
                  remove any listing here. Posting new listings is done by
                  agents from their own sign-in.
                </p>
              )}

              {listings.length > 0 ? (
                // Max two across on desktop so photos and details aren't squeezed.
                <div className="grid gap-6 md:grid-cols-2">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      canManage={
                        session.canManageAllListings ||
                        listing.agentId === session.agentId
                      }
                      expiry={expiryLabel(listing.createdAt, "listing")}
                      expiringSoon={
                        daysUntilExpiry(listing.createdAt, "listing") <=
                        EXPIRY_WARNING_DAYS
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-sm border border-dashed border-border bg-pure-white p-10 text-center">
                  <p className="font-serif text-xl text-navy">
                    No listings yet
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    Be the first to share one with the office.
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
