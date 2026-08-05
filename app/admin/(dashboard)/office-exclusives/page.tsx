import { getListings } from "@/lib/content";
import { deleteListing } from "@/lib/actions";
import { EditorHeader, Card } from "@/components/admin/editor-header";
import { SubmitButton } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function AdminOfficeExclusivesPage() {
  const listings = await getListings();

  return (
    <>
      <EditorHeader
        title="Office Exclusives"
        description="Every listing agents have posted. You can remove any of them here; agents edit their own from the Office Exclusives page."
        previewHref="/office-exclusives"
      />

      <div className="flex flex-col gap-4">
        {listings.map((listing) => (
          <Card key={listing.id}>
            <div className="flex flex-wrap items-start gap-4">
              {listing.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.imageUrl}
                  alt={`${listing.streetNumber} ${listing.streetName}`}
                  className="h-24 w-32 shrink-0 rounded-sm object-cover"
                />
              )}
              <div className="min-w-[220px] flex-1">
                <h3 className="font-serif text-lg text-navy">
                  {listing.streetNumber} {listing.streetName}
                </h3>
                <p className="text-sm text-text-body">
                  {listing.city}, {listing.state} {listing.zip}
                </p>
                <p className="mt-2 text-sm text-text-body tabular-nums">
                  {listing.bedrooms} bd · {listing.bathrooms} ba ·{" "}
                  {listing.squareFeet.toLocaleString()} sq ft
                  {listing.price != null && (
                    <> · {priceFormatter.format(listing.price)}</>
                  )}
                </p>
                <p className="mt-2 text-sm text-text-muted">
                  Listed by{" "}
                  <span className="font-medium text-navy">
                    {listing.agentName}
                  </span>
                </p>
                {listing.notes && (
                  <p className="mt-2 whitespace-pre-line text-sm text-text-body">
                    {listing.notes}
                  </p>
                )}
              </div>
              <form action={deleteListing}>
                <input type="hidden" name="id" value={listing.id} />
                <SubmitButton variant="danger">Remove</SubmitButton>
              </form>
            </div>
          </Card>
        ))}
        {listings.length === 0 && (
          <p className="text-sm text-text-muted">
            No listings have been posted yet.
          </p>
        )}
      </div>
    </>
  );
}
