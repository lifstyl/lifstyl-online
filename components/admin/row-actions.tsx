import { SubmitButton } from "./ui";

/**
 * Reusable move-up / move-down / delete controls for an orderable list row.
 * `moveAction` and `deleteAction` are server actions; extraFields lets callers
 * pass scope fields (e.g. pageSlug) that the actions need.
 */
export function RowActions({
  id,
  moveAction,
  deleteAction,
  isFirst,
  isLast,
  extraFields,
  confirmText = "Delete this item?",
}: {
  id: number;
  moveAction: (fd: FormData) => void;
  deleteAction: (fd: FormData) => void;
  isFirst: boolean;
  isLast: boolean;
  extraFields?: Record<string, string>;
  confirmText?: string;
}) {
  const hidden = (
    <>
      <input type="hidden" name="id" value={id} />
      {extraFields &&
        Object.entries(extraFields).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
    </>
  );

  return (
    <div className="flex items-center gap-2">
      <form action={moveAction}>
        {hidden}
        <input type="hidden" name="direction" value="up" />
        <button
          type="submit"
          disabled={isFirst}
          aria-label="Move up"
          className="rounded-sm border border-border px-2 py-1 text-text-body transition hover:bg-white disabled:opacity-30"
        >
          ↑
        </button>
      </form>
      <form action={moveAction}>
        {hidden}
        <input type="hidden" name="direction" value="down" />
        <button
          type="submit"
          disabled={isLast}
          aria-label="Move down"
          className="rounded-sm border border-border px-2 py-1 text-text-body transition hover:bg-white disabled:opacity-30"
        >
          ↓
        </button>
      </form>
      <form
        action={deleteAction}
        className="ml-auto"
      >
        {hidden}
        <SubmitButton variant="danger">Delete</SubmitButton>
      </form>
    </div>
  );
}
