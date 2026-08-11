import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/admin/ui";

/**
 * Gate shown on /office-exclusives when nobody is signed in.
 * Agents sign in with their name and phone number.
 */
export function AgentLogin({
  error,
  redirectTo = "/office-exclusives",
  blurb = "Office Exclusives is private to Lifstyl agents.",
}: {
  error?: string;
  redirectTo?: string;
  blurb?: string;
}) {
  async function authenticate(formData: FormData) {
    "use server";
    const target = String(formData.get("redirectTo") || "/office-exclusives");
    try {
      await signIn("agent", {
        phone: formData.get("phone"),
        redirectTo: target,
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(`${target}?error=1`);
      }
      throw err;
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-sm border border-border border-t-2 border-t-gold bg-pure-white p-8">
        <h2 className="text-center font-serif text-2xl text-navy">
          Agent Sign In
        </h2>
        <p className="mt-2 text-center text-sm text-text-body">{blurb}</p>

        {error && (
          <p className="mt-5 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700">
            We don&apos;t recognize that phone number. Check with the office if
            you need access.
          </p>
        )}

        <form action={authenticate} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Password
            </span>
            <input
              name="phone"
              type="password"
              required
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="current-password"
              placeholder="8595551212"
              className="w-full rounded-sm border border-border bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-gold"
            />
            <span className="text-xs text-text-muted">
              Numbers only — no dashes, spaces, or parentheses.
            </span>
          </label>
          <SubmitButton className="mt-2 w-full">Sign In</SubmitButton>
        </form>
      </div>
    </div>
  );
}
