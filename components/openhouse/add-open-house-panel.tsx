"use client";

import { useState } from "react";
import { addOpenHouse } from "@/lib/actions";
import { SubmitButton } from "@/components/admin/ui";
import { OpenHouseFields } from "./open-house-fields";
import { OPEN_HOUSE_TTL_DAYS } from "@/lib/db/schema";

/** Collapsible "post an open house" form, shown above the board. */
export function AddOpenHousePanel({ today }: { today: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="mb-10 flex justify-center">
        <button type="button" className="btn-gold" onClick={() => setOpen(true)}>
          + Post an open house
        </button>
      </div>
    );
  }

  return (
    <div className="mb-10 rounded-sm border border-border border-t-2 border-t-gold bg-pure-white p-6 sm:p-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-serif text-xl text-navy">Post an open house</h2>
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
          await addOpenHouse(formData);
          setOpen(false);
        }}
        className="flex flex-col gap-5"
      >
        <OpenHouseFields today={today} />
        <div>
          <SubmitButton>Post to the board</SubmitButton>
        </div>
        <p className="text-xs text-text-muted">
          Comes down automatically after {OPEN_HOUSE_TTL_DAYS} days if nobody
          takes it, or once the open house has finished.
        </p>
      </form>
    </div>
  );
}
