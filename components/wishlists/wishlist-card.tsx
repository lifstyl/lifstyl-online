"use client";

import { useState } from "react";
import type { WishlistWithAgent } from "@/lib/db/schema";
import { updateWishlist, deleteWishlist } from "@/lib/actions";
import { SubmitButton } from "@/components/admin/ui";

export function WishlistCard({
  wishlist,
  canManage,
  expiry,
  postedOn,
  expiringSoon,
}: {
  wishlist: WishlistWithAgent;
  canManage: boolean;
  /** Precomputed on the server so server and client agree on the date. */
  expiry: string;
  postedOn: string;
  expiringSoon: boolean;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <article className="flex flex-col rounded-sm border border-border border-t-2 border-t-gold bg-pure-white p-6">
      {editing ? (
        <form
          action={async (formData) => {
            await updateWishlist(formData);
            setEditing(false);
          }}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="id" value={wishlist.id} />
          <textarea
            name="body"
            required
            rows={5}
            defaultValue={wishlist.body}
            className="w-full rounded-sm border border-border bg-white px-3 py-2 text-sm leading-relaxed text-black outline-none focus:border-gold"
          />
          <div className="flex items-center gap-2">
            <SubmitButton>Save changes</SubmitButton>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-sm text-text-muted underline-offset-2 hover:text-navy hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-text-body">
            {wishlist.body}
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-5 text-sm text-text-muted">
            <span>
              Posted by{" "}
              <span className="font-medium text-navy">{wishlist.agentName}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>{postedOn}</span>
          </div>

          <p
            className={`mt-2 text-xs ${
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
              <form action={deleteWishlist} className="ml-auto">
                <input type="hidden" name="id" value={wishlist.id} />
                <SubmitButton variant="danger">Remove</SubmitButton>
              </form>
            </div>
          )}
        </>
      )}
    </article>
  );
}
