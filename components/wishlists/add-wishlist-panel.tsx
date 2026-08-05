"use client";

import { useState } from "react";
import { addWishlist } from "@/lib/actions";
import { SubmitButton } from "@/components/admin/ui";
import { WISHLIST_TTL_DAYS } from "@/lib/db/schema";

/** Collapsible "post a wishlist" form, shown above the wishlist grid. */
export function AddWishlistPanel() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="mb-10 flex justify-center">
        <button type="button" className="btn-gold" onClick={() => setOpen(true)}>
          + Post a wishlist
        </button>
      </div>
    );
  }

  return (
    <div className="mb-10 rounded-sm border border-border border-t-2 border-t-gold bg-pure-white p-6 sm:p-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-serif text-xl text-navy">
          What is your buyer looking for?
        </h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-text-muted underline-offset-2 hover:text-navy hover:underline"
        >
          Cancel
        </button>
      </div>
      <form
        action={async (formData) => {
          await addWishlist(formData);
          setOpen(false);
        }}
        className="flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Wishlist
          </span>
          <textarea
            name="body"
            required
            rows={5}
            placeholder="Pre-approved buyer looking for 3+ bed, 2 bath in Hamburg or Beaumont. Up to $450k. Needs a garage and a fenced yard. Flexible on closing."
            className="w-full rounded-sm border border-border bg-white px-3 py-2 text-sm leading-relaxed text-black outline-none focus:border-gold"
          />
          <span className="text-xs text-text-muted">
            Posts come down automatically after {WISHLIST_TTL_DAYS} days.
          </span>
        </label>
        <div>
          <SubmitButton>Post wishlist</SubmitButton>
        </div>
      </form>
    </div>
  );
}
