"use client";

import { useState } from "react";
import { addOpenHouse } from "@/lib/actions";
import { SubmitButton } from "@/components/admin/ui";
import { OPEN_HOUSE_TTL_DAYS } from "@/lib/db/schema";

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
        {/* Address */}
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-serif text-base text-navy">
            Property
          </legend>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
            <label className="flex flex-col gap-1.5">
              <Label required>Street number</Label>
              <input name="streetNumber" required placeholder="123" className={input} />
            </label>
            <label className="flex flex-col gap-1.5">
              <Label required>Street name</Label>
              <input
                name="streetName"
                required
                placeholder="Pasadena Dr"
                className={input}
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <label className="flex flex-col gap-1.5">
              <Label required>City</Label>
              <input name="city" required placeholder="Lexington" className={input} />
            </label>
            <label className="flex flex-col gap-1.5">
              <Label required>State</Label>
              <input
                name="state"
                required
                maxLength={2}
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
                placeholder="40503"
                className={input}
              />
            </label>
          </div>
        </fieldset>

        {/* When */}
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-serif text-base text-navy">
            Date &amp; time window
          </legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <Label required>Date</Label>
              {/* min stops a date that's already gone; the server checks too. */}
              <input
                type="date"
                name="scheduledDate"
                required
                min={today}
                className={input}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <Label required>Starts</Label>
              <input
                type="time"
                name="startTime"
                required
                defaultValue="14:00"
                className={input}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <Label required>Ends</Label>
              <input
                type="time"
                name="endTime"
                required
                defaultValue="16:00"
                className={input}
              />
            </label>
          </div>
          <p className="text-xs text-text-muted">
            Whoever hosts takes this exact window, so set the time you want the
            house open.
          </p>
        </fieldset>

        <label className="flex flex-col gap-1.5">
          <Label>Notes</Label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Lockbox on the front door. Sign and flyers are in the garage."
            className={input}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <Label>Photo</Label>
          <input type="file" name="image" accept="image/*" className="text-sm" />
        </label>

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
