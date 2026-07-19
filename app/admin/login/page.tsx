import { signIn } from "@/auth";
import { Logo } from "@/components/logo";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

export const metadata = { title: "Admin Login | Lifstyl Online" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  async function authenticate(formData: FormData) {
    "use server";
    const callbackUrl = String(formData.get("callbackUrl") || "/admin");
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: callbackUrl,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect(`/admin/login?error=1`);
      }
      throw error;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-deep px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <span className="rounded-lg bg-navy px-4 py-2">
            <Logo />
          </span>
        </div>
        <div className="rounded-sm border border-white/10 bg-white/[0.03] p-8">
          <h1 className="text-center font-serif text-2xl text-pure-white">
            Admin Login
          </h1>
          <p className="mt-1 text-center text-sm text-white/50">
            Sign in to edit the Lifstyl agent site.
          </p>

          {searchParams.error && (
            <p className="mt-5 rounded-sm border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-200">
              Incorrect email or password.
            </p>
          )}

          <form action={authenticate} className="mt-6 flex flex-col gap-4">
            <input
              type="hidden"
              name="callbackUrl"
              value={searchParams.callbackUrl || "/admin"}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Email
              </span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="rounded-sm border border-white/15 bg-navy-deep px-3 py-2.5 text-sm text-pure-white outline-none focus:border-gold"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Password
              </span>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="rounded-sm border border-white/15 bg-navy-deep px-3 py-2.5 text-sm text-pure-white outline-none focus:border-gold"
              />
            </label>
            <button type="submit" className="btn-gold mt-2 justify-center">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
