import { PageHeader } from "@/components/page-header";
import { AgentLogin } from "@/components/exclusives/agent-login";
import { AgentBar } from "@/components/exclusives/agent-bar";
import { AddWishlistPanel } from "@/components/wishlists/add-wishlist-panel";
import { WishlistCard } from "@/components/wishlists/wishlist-card";
import { getSessionInfo } from "@/auth";
import { getWishlists } from "@/lib/content";
import { expiryLabel, daysUntilExpiry } from "@/lib/expiry";
import { EXPIRY_WARNING_DAYS, WISHLIST_TTL_DAYS } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export const metadata = { title: "Buyer Wishlists | Lifstyl Online" };

const PATH = "/buyer-wishlists";

export default async function BuyerWishlistsPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await getSessionInfo();
  const signedIn = !!session && (session.isAgent || session.isAdmin);

  // Only queried once there's a session, so nothing reaches a logged-out visitor.
  const wishlists = signedIn ? await getWishlists() : [];
  const dateFormat = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <PageHeader
        eyebrow="Agents only"
        title="Buyer Wishlists"
        intro={
          signedIn
            ? `What Lifstyl buyers are looking for. Post yours so the office can match it. Posts come down automatically after ${WISHLIST_TTL_DAYS} days.`
            : undefined
        }
      />
      <section className="bg-white">
        <div className="mx-auto max-w-content px-6 pb-24 sm:px-10">
          {!signedIn ? (
            <AgentLogin
              error={searchParams.error}
              redirectTo={PATH}
              blurb="Buyer Wishlists is private to Lifstyl agents."
            />
          ) : (
            <>
              <AgentBar
                name={session.name}
                isAdmin={session.isAdmin}
                redirectTo={PATH}
              />

              {session.isAgent ? (
                <AddWishlistPanel />
              ) : (
                <p className="mb-10 rounded-sm border border-border bg-pure-white px-5 py-4 text-sm text-text-body">
                  You&apos;re signed in as the site admin, so you can edit or
                  remove any wishlist here. Posting is done by agents from their
                  own sign-in.
                </p>
              )}

              {wishlists.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {wishlists.map((wishlist) => (
                    <WishlistCard
                      key={wishlist.id}
                      wishlist={wishlist}
                      canManage={
                        session.canManageAllListings ||
                        wishlist.agentId === session.agentId
                      }
                      postedOn={dateFormat.format(wishlist.createdAt)}
                      expiry={expiryLabel(wishlist.createdAt, "wishlist")}
                      expiringSoon={
                        daysUntilExpiry(wishlist.createdAt, "wishlist") <=
                        EXPIRY_WARNING_DAYS
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-sm border border-dashed border-border bg-pure-white p-10 text-center">
                  <p className="font-serif text-xl text-navy">
                    No wishlists yet
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    Post what your buyer is looking for and the office will see
                    it.
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
