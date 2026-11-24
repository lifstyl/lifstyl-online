"use client";

import type { OpenHouse } from "@/lib/db/schema";

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
 * The property / window / notes / photo inputs, shared by the "post an open
 * house" panel and the inline edit form on each card, so the two can't drift.
 */
export function OpenHouseFields({
  openHouse,
  today,
}: {
  openHouse?: OpenHouse;
  /** Today in the office timezone, so the date picker can't offer the past. */
  today: string;
}) {
  return (
    <>
      {/* Property */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-serif text-base text-navy">Property</legend>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
          <label className="flex flex-col gap-1.5">
            <Label required>Street number</Label>
            <input
              name="streetNumber"
              required
              defaultValue={openHouse?.streetNumber}
              placeholder="123"
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <Label required>Street name</Label>
            <input
              name="streetName"
              required
              defaultValue={openHouse?.streetName}
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
              defaultValue={openHouse?.city}
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
              defaultValue={openHouse?.state}
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
              defaultValue={openHouse?.zip}
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
              defaultValue={openHouse?.scheduledDate}
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <Label required>Starts</Label>
            <input
              type="time"
              name="startTime"
              required
              defaultValue={openHouse?.startTime ?? "14:00"}
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <Label required>Ends</Label>
            <input
              type="time"
              name="endTime"
              required
              defaultValue={openHouse?.endTime ?? "16:00"}
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
          defaultValue={openHouse?.notes}
          placeholder="Lockbox on the front door. Sign and flyers are in the garage."
          className={input}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <Label>Photo</Label>
        <input type="file" name="image" accept="image/*" className="text-sm" />
        {openHouse?.imageUrl && (
          <span className="text-xs text-text-muted">
            Leave empty to keep the current photo.
          </span>
        )}
      </label>
    </>
  );
}
