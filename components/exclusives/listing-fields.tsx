"use client";

import type { Listing } from "@/lib/db/schema";

const input =
  "w-full rounded-sm border border-border bg-white px-3 py-2 text-sm text-black outline-none focus:border-gold";

function Label({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
      {children}
      {required && <span className="ml-1 text-gold">*</span>}
    </span>
  );
}

/**
 * The address / beds / baths / sqft / price / notes inputs, shared by the
 * "add a listing" panel and the inline edit form on each card.
 */
export function ListingFields({ listing }: { listing?: Listing }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Address */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-serif text-base text-navy">Address</legend>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
          <label className="flex flex-col gap-1.5">
            <Label required>Street number</Label>
            <input
              name="streetNumber"
              required
              defaultValue={listing?.streetNumber}
              placeholder="123"
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <Label required>Street name</Label>
            <input
              name="streetName"
              required
              defaultValue={listing?.streetName}
              placeholder="Pasadena Dr"
              className={input}
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <label className="flex flex-col gap-1.5">
            <Label required>City</Label>
            <input
              name="city"
              required
              defaultValue={listing?.city}
              placeholder="Lexington"
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <Label required>State</Label>
            <input
              name="state"
              required
              maxLength={2}
              defaultValue={listing?.state}
              placeholder="KY"
              className={`${input} uppercase`}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <Label required>ZIP</Label>
            <input
              name="zip"
              required
              inputMode="numeric"
              defaultValue={listing?.zip}
              placeholder="40503"
              className={input}
            />
          </label>
        </div>
      </fieldset>

      {/* Property details */}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <Label required>Bedrooms</Label>
          <input
            name="bedrooms"
            required
            type="number"
            min={0}
            step={1}
            defaultValue={listing?.bedrooms}
            className={input}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <Label required>Bathrooms</Label>
          <input
            name="bathrooms"
            required
            type="number"
            min={0}
            step={0.5}
            defaultValue={listing?.bathrooms}
            className={input}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <Label required>Square feet</Label>
          <input
            name="squareFeet"
            required
            type="number"
            min={1}
            step={1}
            defaultValue={listing?.squareFeet}
            className={input}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <Label>Price</Label>
        <input
          name="price"
          inputMode="numeric"
          defaultValue={listing?.price ?? ""}
          placeholder="450000"
          className={input}
        />
        <span className="text-xs text-text-muted">
          Optional. Numbers only — commas and $ are fine, they&apos;ll be
          cleaned up.
        </span>
      </label>

      <label className="flex flex-col gap-1.5">
        <Label>Notes</Label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={listing?.notes}
          placeholder="Coming soon — showings start Friday. Recently updated kitchen."
          className={input}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <Label>Photo</Label>
        <input type="file" name="image" accept="image/*" className="text-sm" />
        {listing?.imageUrl && (
          <span className="text-xs text-text-muted">
            Leave empty to keep the current photo.
          </span>
        )}
      </label>
    </div>
  );
}
