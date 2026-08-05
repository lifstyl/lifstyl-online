"use client";

import { useState } from "react";
import { addListing } from "@/lib/actions";
import { ListingFields } from "./listing-fields";
import { SubmitButton } from "@/components/admin/ui";

/** Collapsible "Add a listing" form, shown above the listing grid. */
export function AddListingPanel() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="mb-10 flex justify-center">
        <button type="button" className="btn-gold" onClick={() => setOpen(true)}>
          + Add a listing
        </button>
      </div>
    );
  }

  return (
    <div className="mb-10 rounded-sm border border-border border-t-2 border-t-gold bg-pure-white p-6 sm:p-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-serif text-xl text-navy">Add a listing</h2>
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
          await addListing(formData);
          setOpen(false);
        }}
        className="flex flex-col gap-5"
      >
        <ListingFields />
        <div>
          <SubmitButton>Post listing</SubmitButton>
        </div>
      </form>
    </div>
  );
}
