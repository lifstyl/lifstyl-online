"use client";

import { useState } from "react";
import type { OpenHouseWithAgents } from "@/lib/db/schema";
import {
  claimOpenHouse,
  releaseOpenHouse,
  deleteOpenHouse,
  updateOpenHouse,
} from "@/lib/actions";
import { SubmitButton } from "@/components/admin/ui";
import { OpenHouseFields } from "./open-house-fields";

export function OpenHouseCard({
  openHouse,
  when,
  isMine,
  isHost,
  canHost,
  canEdit,
  canRemove,
  today,
}: {
  openHouse: OpenHouseWithAgents;
  /** Preformatted on the server so both sides render the same wording. */
  when: string;
  /** The signed-in agent posted this listing. */
  isMine: boolean;
  /** The signed-in agent is hosting it. */
  isHost: boolean;
  /** Signed in as an agent, so hosting is actually possible. The admin has no
   *  agent record and can't host — offering them the button would just fail. */
  canHost: boolean;
  canEdit: boolean;
  canRemove: boolean;
  /** Today in the office timezone, for the edit form's date picker. */
  today: string;
}) {
  const taken = openHouse.hostAgentId !== null;
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <article className="rounded-sm border border-border border-t-2 border-t-gold bg-pure-white p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="font-serif text-lg text-navy">Edit open house</h3>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm text-text-muted underline-offset-2 hover:text-navy hover:underline"
          >
            Cancel
          </button>
        </div>

        {/* Nothing notifies the host, so make the consequence visible rather
            than letting the window change quietly under them. */}
        {taken && (
          <p className="mb-5 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {openHouse.hostName} is hosting this one. If you change the date or
            time, let them know yourself — they won&apos;t be told
            automatically.
          </p>
        )}

        <form
          action={async (formData) => {
            await updateOpenHouse(formData);
            setEditing(false);
          }}
          className="flex flex-col gap-5"
        >
          <input type="hidden" name="id" value={openHouse.id} />
          <OpenHouseFields openHouse={openHouse} today={today} />
          <div>
            <SubmitButton>Save changes</SubmitButton>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-sm border border-border bg-pure-white">
      {openHouse.imageUrl && (
        <div className="aspect-[4/3] w-full bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={openHouse.imageUrl}
            alt={`${openHouse.streetNumber} ${openHouse.streetName}`}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-serif text-xl leading-tight text-navy">
            {openHouse.streetNumber} {openHouse.streetName}
          </h3>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              taken
                ? "bg-navy/10 text-navy"
                : "bg-gold/15 text-[color:var(--gold)]"
            }`}
          >
            {taken ? "Hosted" : "Needs a host"}
          </span>
        </div>
        <p className="mt-1 text-sm text-text-body">
          {openHouse.city}, {openHouse.state} {openHouse.zip}
        </p>

        <p className="mt-4 border-y border-border py-3 font-serif text-lg text-navy">
          {when}
        </p>

        {openHouse.notes && (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-text-body">
            {openHouse.notes}
          </p>
        )}

        <div className="mt-auto pt-5 text-sm text-text-muted">
          <p>
            Listed by{" "}
            <span className="font-medium text-navy">{openHouse.agentName}</span>
            {isMine && " (you)"}
          </p>
          {taken && (
            <p className="mt-0.5">
              Hosted by{" "}
              <span className="font-medium text-navy">
                {openHouse.hostName}
              </span>
              {isHost && " (you)"}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          {/* The poster doesn't get a take button — they're looking for someone
              else to cover it — and neither does the admin, who has no agent
              record to host with. */}
          {!taken && !isMine && canHost && (
            <form action={claimOpenHouse}>
              <input type="hidden" name="id" value={openHouse.id} />
              <SubmitButton>I&apos;ll host it</SubmitButton>
            </form>
          )}

          {!taken && isMine && (
            <p className="text-sm text-text-muted">
              Waiting for someone to pick this up.
            </p>
          )}

          {canEdit && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-sm border border-border px-3 py-1.5 text-sm text-text-body transition hover:bg-white"
            >
              Edit
            </button>
          )}

          {isHost && (
            <form action={releaseOpenHouse}>
              <input type="hidden" name="id" value={openHouse.id} />
              <SubmitButton variant="ghost">Give it up</SubmitButton>
            </form>
          )}

          {canRemove && (
            <form action={deleteOpenHouse} className="ml-auto">
              <input type="hidden" name="id" value={openHouse.id} />
              <SubmitButton variant="danger">Remove</SubmitButton>
            </form>
          )}
        </div>
      </div>
    </article>
  );
}
