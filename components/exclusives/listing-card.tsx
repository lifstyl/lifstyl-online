"use client";

import { useState } from "react";
import type { ListingWithAgent } from "@/lib/db/schema";
import { updateListing, deleteListing } from "@/lib/actions";
import { ListingFields } from "./listing-fields";
import { SubmitButton } from "@/components/admin/ui";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Bathrooms print as "2" or "2.5" rather than "2.0". */
function formatBaths(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function ListingCard({
  listing,
  canManage,
  expiry,
  expiringSoon,
}: {
  listing: ListingWithAgent;
  canManage: boolean;
  /** Precomputed server-side so server and client render the same value. */
  expiry: string;
  expiringSoon: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-sm border border-border border-t-2 border-t-gold bg-pure-white p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="font-serif text-lg text-navy">Edit listing</h3>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm text-text-muted underline-offset-2 hover:text-navy hover:underline"
          >
            Cancel
          </button>
        </div>
        <form
          action={async (formData) => {
            await updateListing(formData);
            setEditing(false);
          }}
          className="flex flex-col gap-5"
        >
          <input type="hidden" name="id" value={listing.id} />
          <ListingFields listing={listing} />
          <div>
            <SubmitButton>Save changes</SubmitButton>
          </div>
        </form>
      </div>
    );
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-sm border border-border bg-pure-white">
      <div className="aspect-[4/3] w-full bg-white">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt={`${listing.streetNumber} ${listing.streetName}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-navy/5">
            <span className="text-sm text-navy/40">No photo</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-xl leading-tight text-navy">
          {listing.streetNumber} {listing.streetName}
        </h3>
        <p className="mt-1 text-sm text-text-body">
          {listing.city}, {listing.state} {listing.zip}
        </p>

        {listing.price != null && (
          <p className="mt-3 font-serif text-2xl text-gold">
            {priceFormatter.format(listing.price)}
          </p>
        )}

        <dl className="mt-4 grid grid-cols-3 gap-2 border-y border-border py-3 text-center">
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-text-muted">
              Beds
            </dt>
            <dd className="font-serif text-lg text-navy tabular-nums">
              {listing.bedrooms}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-text-muted">
              Baths
            </dt>
            <dd className="font-serif text-lg text-navy tabular-nums">
              {formatBaths(listing.bathrooms)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-text-muted">
              Sq Ft
            </dt>
            <dd className="font-serif text-lg text-navy tabular-nums">
              {listing.squareFeet.toLocaleString()}
            </dd>
          </div>
        </dl>

        {listing.notes && (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-text-body">
            {listing.notes}
          </p>
        )}

        <p className="mt-auto pt-5 text-sm text-text-muted">
          Listed by{" "}
          <span className="font-medium text-navy">{listing.agentName}</span>
        </p>
        <p
          className={`mt-1 text-xs ${
            expiringSoon ? "font-medium text-gold" : "text-text-muted"
          }`}
        >
          {expiry}
        </p>

        {canManage && (
          <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-sm border border-border px-3 py-1.5 text-sm text-text-body transition hover:bg-white"
            >
              Edit
            </button>
            <form action={deleteListing} className="ml-auto">
              <input type="hidden" name="id" value={listing.id} />
              <SubmitButton variant="danger">Remove</SubmitButton>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}
