import { signOut } from "@/auth";

/** Small "signed in as …" strip with a sign-out control. */
export function AgentBar({
  name,
  isAdmin,
  redirectTo = "/office-exclusives",
}: {
  name: string;
  isAdmin: boolean;
  redirectTo?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-pure-white px-5 py-3">
      <p className="text-sm text-text-body">
        Signed in as <span className="font-medium text-navy">{name}</span>
        {isAdmin && (
          <span className="ml-2 rounded-full bg-navy/10 px-2 py-0.5 text-xs font-medium text-navy">
            Admin
          </span>
        )}
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo });
        }}
      >
        <button
          type="submit"
          className="text-sm text-text-muted underline-offset-2 transition hover:text-navy hover:underline"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
